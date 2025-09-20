import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

interface WalletCreationResult {
  address: string;
  encryptedPrivateKey: string;
}

interface TransferResult {
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
}

interface StakeResult {
  transactionHash: string;
  unlockDate: Date;
  stakingPeriod: number;
  rewardRate: number;
}

interface WalletBalance {
  balance: string;
  balanceFormatted: string;
  usdValue: number;
  stakedAmount: string;
  availableBalance: string;
}

@Injectable()
export class BlockchainService {
  private prisma = new PrismaClient();
  private provider: ethers.JsonRpcProvider;
  private dominionCoinContract: ethers.Contract;
  private stakingContract: ethers.Contract;
  private rewardsContract: ethers.Contract;

  // ABI definitions (simplified - in production, import from artifacts)
  private dominionCoinABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function mint(address to, uint256 amount)',
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  ];

  private stakingABI = [
    'function stake(uint256 amount, uint256 duration) returns (bool)',
    'function unstake() returns (bool)',
    'function getStakeInfo(address staker) view returns (uint256 amount, uint256 unlockTime, uint256 rewardRate)',
    'function calculateReward(address staker) view returns (uint256)',
    'function claimReward() returns (bool)',
    'event Staked(address indexed staker, uint256 amount, uint256 duration)',
    'event Unstaked(address indexed staker, uint256 amount, uint256 reward)'
  ];

  constructor(private configService: ConfigService) {
    this.initializeBlockchain();
  }

  private async initializeBlockchain() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL') || 'http://localhost:8545';
    const dominionCoinAddress = this.configService.get<string>('DOMINION_COIN_ADDRESS');
    const stakingAddress = this.configService.get<string>('STAKING_CONTRACT_ADDRESS');
    const rewardsAddress = this.configService.get<string>('REWARDS_CONTRACT_ADDRESS');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (dominionCoinAddress) {
      this.dominionCoinContract = new ethers.Contract(
        dominionCoinAddress,
        this.dominionCoinABI,
        this.provider
      );
    }

    if (stakingAddress) {
      this.stakingContract = new ethers.Contract(
        stakingAddress,
        this.stakingABI,
        this.provider
      );
    }
  }

  async createWallet(userId: string): Promise<{ address: string }> {
    // Check if user already has a wallet
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true }
    });

    if (existingUser?.walletAddress) {
      return { address: existingUser.walletAddress };
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;

    // Encrypt private key with user's password (in production, use proper key management)
    const password = this.generateSecurePassword();
    const encryptedPrivateKey = await wallet.encrypt(password);

    // Store in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        walletAddress: address
      }
    });

    // Store encrypted private key securely (in production, use HSM or secure vault)
    await this.storeEncryptedKey(userId, encryptedPrivateKey, password);

    // Record wallet creation transaction
    await this.prisma.transaction.create({
      data: {
        userId,
        transactionType: 'wallet_created',
        amount: 0,
        status: 'confirmed',
        metadata: {
          address,
          createdAt: new Date()
        }
      }
    });

    return { address };
  }

  async getBalance(userId: string): Promise<WalletBalance> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, totalCoins: true }
    });

    if (!user?.walletAddress) {
      throw new NotFoundException('Wallet not found for user');
    }

    let blockchainBalance = '0';
    let stakedAmount = '0';

    try {
      if (this.dominionCoinContract) {
        // Get balance from blockchain
        const balance = await this.dominionCoinContract.balanceOf(user.walletAddress);
        blockchainBalance = ethers.formatEther(balance);

        // Get staked amount if staking contract exists
        if (this.stakingContract) {
          const stakeInfo = await this.stakingContract.getStakeInfo(user.walletAddress);
          stakedAmount = ethers.formatEther(stakeInfo.amount);
        }
      }
    } catch (error) {
      console.error('Blockchain balance fetch error:', error);
      // Fallback to database balance
      blockchainBalance = user.totalCoins.toString();
    }

    const availableBalance = (parseFloat(blockchainBalance) - parseFloat(stakedAmount)).toString();
    const usdValue = await this.calculateUSDValue(blockchainBalance);

    return {
      balance: blockchainBalance,
      balanceFormatted: `${parseFloat(blockchainBalance).toFixed(4)} DMCN`,
      usdValue,
      stakedAmount,
      availableBalance
    };
  }

  async transferCoins(
    fromUserId: string,
    toAddress: string,
    amount: string,
    memo?: string
  ): Promise<TransferResult> {
    const fromUser = await this.prisma.user.findUnique({
      where: { id: fromUserId },
      select: { walletAddress: true, totalCoins: true }
    });

    if (!fromUser?.walletAddress) {
      throw new NotFoundException('Sender wallet not found');
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      throw new BadRequestException('Transfer amount must be positive');
    }

    if (transferAmount > fromUser.totalCoins.toNumber()) {
      throw new BadRequestException('Insufficient balance');
    }

    try {
      // Get wallet for transaction signing
      const wallet = await this.getWalletForUser(fromUserId);
      const contractWithSigner = this.dominionCoinContract.connect(wallet);

      // Convert amount to wei
      const amountWei = ethers.parseEther(amount);

      // Execute transfer
      const tx = await contractWithSigner.transfer(toAddress, amountWei);
      const receipt = await tx.wait();

      // Update database balances
      await this.prisma.$transaction([
        // Decrease sender balance
        this.prisma.user.update({
          where: { id: fromUserId },
          data: {
            totalCoins: {
              decrement: transferAmount
            }
          }
        }),
        // Record transaction
        this.prisma.transaction.create({
          data: {
            userId: fromUserId,
            transactionHash: tx.hash,
            transactionType: 'transfer_out',
            amount: -transferAmount,
            status: 'confirmed',
            metadata: {
              toAddress,
              memo,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString()
            }
          }
        })
      ]);

      // Try to update recipient if they're a Mo'edim user
      const recipientUser = await this.prisma.user.findFirst({
        where: { walletAddress: toAddress }
      });

      if (recipientUser) {
        await this.prisma.$transaction([
          // Increase recipient balance
          this.prisma.user.update({
            where: { id: recipientUser.id },
            data: {
              totalCoins: {
                increment: transferAmount
              }
            }
          }),
          // Record incoming transaction
          this.prisma.transaction.create({
            data: {
              userId: recipientUser.id,
              transactionHash: tx.hash,
              transactionType: 'transfer_in',
              amount: transferAmount,
              status: 'confirmed',
              metadata: {
                fromAddress: fromUser.walletAddress,
                memo,
                blockNumber: receipt.blockNumber
              }
            }
          })
        ]);
      }

      return {
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      // Record failed transaction
      await this.prisma.transaction.create({
        data: {
          userId: fromUserId,
          transactionType: 'transfer_out',
          amount: -transferAmount,
          status: 'failed',
          metadata: {
            toAddress,
            memo,
            error: error.message
          }
        }
      });

      throw new BadRequestException(`Transfer failed: ${error.message}`);
    }
  }

  async stakeCoins(
    userId: string,
    amount: string,
    duration: number
  ): Promise<StakeResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true, totalCoins: true }
    });

    if (!user?.walletAddress) {
      throw new NotFoundException('Wallet not found');
    }

    const stakeAmount = parseFloat(amount);
    if (stakeAmount <= 0) {
      throw new BadRequestException('Stake amount must be positive');
    }

    if (stakeAmount > user.totalCoins.toNumber()) {
      throw new BadRequestException('Insufficient balance for staking');
    }

    // Validate biblical durations
    const biblicalDurations = [7, 40, 50, 180, 365]; // 7 days, 40 days, 50 days (Jubilee), 6 months, 1 year
    if (!biblicalDurations.includes(duration)) {
      throw new BadRequestException('Invalid staking duration. Must be biblical period: 7, 40, 50, 180, or 365 days');
    }

    try {
      const wallet = await this.getWalletForUser(userId);
      const stakingWithSigner = this.stakingContract.connect(wallet);

      // Approve staking contract to spend tokens
      const dominionWithSigner = this.dominionCoinContract.connect(wallet);
      const amountWei = ethers.parseEther(amount);

      const approveTx = await dominionWithSigner.approve(this.stakingContract.target, amountWei);
      await approveTx.wait();

      // Execute staking
      const stakeTx = await stakingWithSigner.stake(amountWei, duration);
      const receipt = await stakeTx.wait();

      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + duration);

      // Calculate reward rate based on biblical significance
      const rewardRate = this.calculateStakingRewardRate(duration);

      // Update database
      await this.prisma.$transaction([
        // Move coins to staked status (don't decrease total, but mark as staked)
        this.prisma.transaction.create({
          data: {
            userId,
            transactionHash: stakeTx.hash,
            transactionType: 'stake',
            amount: stakeAmount,
            status: 'confirmed',
            metadata: {
              duration,
              unlockDate,
              rewardRate,
              blockNumber: receipt.blockNumber
            }
          }
        })
      ]);

      return {
        transactionHash: stakeTx.hash,
        unlockDate,
        stakingPeriod: duration,
        rewardRate
      };

    } catch (error) {
      await this.prisma.transaction.create({
        data: {
          userId,
          transactionType: 'stake',
          amount: stakeAmount,
          status: 'failed',
          metadata: {
            duration,
            error: error.message
          }
        }
      });

      throw new BadRequestException(`Staking failed: ${error.message}`);
    }
  }

  async unstakeCoins(userId: string): Promise<TransferResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true }
    });

    if (!user?.walletAddress) {
      throw new NotFoundException('Wallet not found');
    }

    try {
      const wallet = await this.getWalletForUser(userId);
      const stakingWithSigner = this.stakingContract.connect(wallet);

      // Check if stake is unlocked
      const stakeInfo = await this.stakingContract.getStakeInfo(user.walletAddress);
      const now = Math.floor(Date.now() / 1000);

      if (stakeInfo.unlockTime > now) {
        throw new BadRequestException('Stake is still locked');
      }

      // Calculate rewards
      const rewards = await this.stakingContract.calculateReward(user.walletAddress);

      // Execute unstaking
      const unstakeTx = await stakingWithSigner.unstake();
      const receipt = await unstakeTx.wait();

      const stakedAmount = parseFloat(ethers.formatEther(stakeInfo.amount));
      const rewardAmount = parseFloat(ethers.formatEther(rewards));
      const totalAmount = stakedAmount + rewardAmount;

      // Update database
      await this.prisma.$transaction([
        // Add coins back to balance (principal + rewards)
        this.prisma.user.update({
          where: { id: userId },
          data: {
            totalCoins: {
              increment: totalAmount
            }
          }
        }),
        // Record unstaking transaction
        this.prisma.transaction.create({
          data: {
            userId,
            transactionHash: unstakeTx.hash,
            transactionType: 'unstake',
            amount: totalAmount,
            status: 'confirmed',
            metadata: {
              principalAmount: stakedAmount,
              rewardAmount,
              blockNumber: receipt.blockNumber
            }
          }
        })
      ]);

      return {
        transactionHash: unstakeTx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      throw new BadRequestException(`Unstaking failed: ${error.message}`);
    }
  }

  async getUserTransactions(userId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await this.prisma.transaction.count({
      where: { userId }
    });

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async mintReward(userId: string, amount: number, reason: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true }
    });

    if (!user?.walletAddress) {
      return; // No wallet, just update database
    }

    try {
      if (this.dominionCoinContract && this.rewardsContract) {
        // In production, this would be called by the rewards contract with proper signature verification
        const adminWallet = await this.getAdminWallet();
        const contractWithSigner = this.dominionCoinContract.connect(adminWallet);

        const amountWei = ethers.parseEther(amount.toString());
        const mintTx = await contractWithSigner.mint(user.walletAddress, amountWei);
        await mintTx.wait();

        // Record mint transaction
        await this.prisma.transaction.create({
          data: {
            userId,
            transactionHash: mintTx.hash,
            transactionType: 'reward',
            amount,
            status: 'confirmed',
            metadata: {
              reason,
              mintedAt: new Date()
            }
          }
        });
      }
    } catch (error) {
      console.error('Minting failed, reward recorded in database only:', error);

      // Record failed mint but still give database rewards
      await this.prisma.transaction.create({
        data: {
          userId,
          transactionType: 'reward',
          amount,
          status: 'confirmed',
          metadata: {
            reason,
            mintError: error.message,
            databaseOnly: true
          }
        }
      });
    }
  }

  private async getWalletForUser(userId: string): Promise<ethers.Wallet> {
    // In production, retrieve encrypted private key from secure storage
    const { encryptedKey, password } = await this.getStoredEncryptedKey(userId);
    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, password);
    return wallet.connect(this.provider);
  }

  private async getAdminWallet(): Promise<ethers.Wallet> {
    const adminPrivateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');
    if (!adminPrivateKey) {
      throw new Error('Admin private key not configured');
    }
    return new ethers.Wallet(adminPrivateKey, this.provider);
  }

  private calculateStakingRewardRate(duration: number): number {
    // Biblical duration-based reward rates
    switch (duration) {
      case 7: return 0.05;    // 5% for weekly commitment
      case 40: return 0.15;   // 15% for wilderness period
      case 50: return 0.20;   // 20% for Jubilee period
      case 180: return 0.30;  // 30% for half-year commitment
      case 365: return 0.50;  // 50% for full year commitment
      default: return 0.03;   // Default 3%
    }
  }

  private async calculateUSDValue(dominionAmount: string): Promise<number> {
    // In production, fetch from price oracle or DEX
    // For now, use fixed rate: 1 DMCN = $0.10
    const rate = 0.10;
    return parseFloat(dominionAmount) * rate;
  }

  private generateSecurePassword(): string {
    // Generate a secure password for wallet encryption
    // In production, use proper key derivation from user's master password
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async storeEncryptedKey(userId: string, encryptedKey: string, password: string): Promise<void> {
    // In production, store in HSM or secure vault like AWS KMS, HashiCorp Vault, etc.
    // For development, could store in secure database table with additional encryption
    console.log(`Storing encrypted key for user ${userId} (implement secure storage)`);
  }

  private async getStoredEncryptedKey(userId: string): Promise<{ encryptedKey: string; password: string }> {
    // In production, retrieve from secure storage
    // For development, implement secure key retrieval
    throw new Error('Secure key storage not implemented');
  }
}