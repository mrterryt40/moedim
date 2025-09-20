import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { BlockchainService, WalletCreationResult, WalletBalance, TransferResult, StakeResult } from './blockchain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

interface TransferCoinsDto {
  toAddress: string;
  amount: string;
  memo?: string;
}

interface StakeCoinsDto {
  amount: string;
  duration: number; // in days: 7, 40, 50, 180, 365
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('create')
  async createWallet(@GetUser() user: any): Promise<WalletCreationResult> {
    return this.blockchainService.createWallet(user.id);
  }

  @Get('balance')
  async getBalance(@GetUser() user: any): Promise<WalletBalance> {
    return this.blockchainService.getBalance(user.id);
  }

  @Post('transfer')
  async transferCoins(
    @GetUser() user: any,
    @Body() transferDto: TransferCoinsDto
  ): Promise<TransferResult> {
    const { toAddress, amount, memo } = transferDto;

    if (!toAddress || !amount) {
      throw new Error('To address and amount are required');
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    // Validate amount is positive number
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    return this.blockchainService.transferCoins(user.id, toAddress, amount, memo);
  }

  @Post('stake')
  async stakeCoins(
    @GetUser() user: any,
    @Body() stakeDto: StakeCoinsDto
  ): Promise<StakeResult> {
    const { amount, duration } = stakeDto;

    if (!amount || !duration) {
      throw new Error('Amount and duration are required');
    }

    // Validate amount
    const stakeAmount = parseFloat(amount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Validate biblical durations
    const validDurations = [7, 40, 50, 180, 365];
    if (!validDurations.includes(duration)) {
      throw new Error('Duration must be a biblical period: 7, 40, 50, 180, or 365 days');
    }

    return this.blockchainService.stakeCoins(user.id, amount, duration);
  }

  @Post('unstake')
  async unstakeCoins(@GetUser() user: any): Promise<TransferResult> {
    return this.blockchainService.unstakeCoins(user.id);
  }

  @Get('transactions')
  async getTransactions(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new Error('Invalid pagination parameters');
    }

    return this.blockchainService.getUserTransactions(user.id, pageNum, limitNum);
  }

  @Get('staking-info')
  async getStakingInfo(@GetUser() user: any) {
    // Get current staking information
    const balance = await this.blockchainService.getBalance(user.id);

    return {
      stakedAmount: balance.stakedAmount,
      availableBalance: balance.availableBalance,
      stakingOptions: [
        {
          duration: 7,
          period: '7 days',
          rewardRate: 0.05,
          biblicalSignificance: 'Weekly Sabbath Cycle',
          description: 'Commit to a week of study and devotion'
        },
        {
          duration: 40,
          period: '40 days',
          rewardRate: 0.15,
          biblicalSignificance: 'Wilderness Testing Period',
          description: 'Follow the path of Moses and Jesus in the wilderness'
        },
        {
          duration: 50,
          period: '50 days',
          rewardRate: 0.20,
          biblicalSignificance: 'Jubilee Period',
          description: 'Experience freedom and restoration'
        },
        {
          duration: 180,
          period: '6 months',
          rewardRate: 0.30,
          biblicalSignificance: 'Half-Year Commitment',
          description: 'Dedicate yourself to extended spiritual growth'
        },
        {
          duration: 365,
          period: '1 year',
          rewardRate: 0.50,
          biblicalSignificance: 'Annual Cycle',
          description: 'Complete commitment to the biblical year'
        }
      ]
    };
  }

  @Get('transaction/:hash')
  async getTransactionDetails(
    @GetUser() user: any,
    @Param('hash') transactionHash: string
  ) {
    if (!transactionHash || !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      throw new Error('Invalid transaction hash format');
    }

    // Get transaction from database
    const transaction = await this.blockchainService['prisma'].transaction.findFirst({
      where: {
        userId: user.id,
        transactionHash
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  @Post('send-to-user')
  async sendToUser(
    @GetUser() user: any,
    @Body() body: { username: string; amount: string; memo?: string }
  ): Promise<TransferResult> {
    const { username, amount, memo } = body;

    if (!username || !amount) {
      throw new Error('Username and amount are required');
    }

    // Find recipient by username
    const recipient = await this.blockchainService['prisma'].user.findUnique({
      where: { username },
      select: { walletAddress: true, username: true }
    });

    if (!recipient?.walletAddress) {
      throw new Error('Recipient not found or has no wallet');
    }

    return this.blockchainService.transferCoins(user.id, recipient.walletAddress, amount, memo);
  }

  @Get('portfolio')
  async getPortfolio(@GetUser() user: any): Promise<WalletBalance> {
    const balance = await this.blockchainService.getBalance(user.id);
    const transactions = await this.blockchainService.getUserTransactions(user.id, 1, 10);

    // Calculate portfolio metrics
    const recentTransactions = transactions.transactions;
    const totalEarned = recentTransactions
      .filter(tx => tx.amount.toNumber() > 0)
      .reduce((sum, tx) => sum + tx.amount.toNumber(), 0);

    const totalSpent = recentTransactions
      .filter(tx => tx.amount.toNumber() < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount.toNumber()), 0);

    return {
      balance,
      metrics: {
        totalEarned,
        totalSpent,
        netGain: totalEarned - totalSpent,
        transactionCount: recentTransactions.length
      },
      recentActivity: recentTransactions.slice(0, 5),
      achievementEligible: {
        firstTransaction: recentTransactions.length > 0,
        stakingBeginner: parseFloat(balance.stakedAmount) > 0,
        earlyAdopter: totalEarned >= 100,
        benefactor: totalSpent >= 50
      }
    };
  }

  @Get('rewards-summary')
  async getRewardsSummary(@GetUser() user: any) {
    const rewardTransactions = await this.blockchainService['prisma'].transaction.findMany({
      where: {
        userId: user.id,
        transactionType: 'reward'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const rewardsByType = rewardTransactions.reduce((acc, tx) => {
      const reason = tx.metadata?.['reason'] as string || 'unknown';
      if (!acc[reason]) {
        acc[reason] = { count: 0, total: 0 };
      }
      acc[reason].count++;
      acc[reason].total += tx.amount.toNumber();
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const totalRewards = rewardTransactions.reduce((sum, tx) => sum + tx.amount.toNumber(), 0);

    return {
      totalRewards,
      rewardsByType,
      recentRewards: rewardTransactions.slice(0, 10),
      milestones: {
        firstReward: rewardTransactions.length > 0,
        hundredCoins: totalRewards >= 100,
        thousandCoins: totalRewards >= 1000,
        consistent: rewardsByType['daily_torah']?.count >= 7 || false,
        scholar: rewardsByType['hebrew_review']?.count >= 50 || false
      }
    };
  }
}