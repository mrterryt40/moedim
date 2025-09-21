// Mo'edim Blockchain/Wallet Service
// Handles wallet operations, transactions, and staking

import { apiService } from './api';
import type {
  Wallet,
  Transaction,
  StakingInfo,
  Portfolio,
  ApiResponse
} from '../types';

class BlockchainService {
  // Create wallet
  async createWallet(): Promise<Wallet> {
    try {
      const response = await apiService.post<Wallet>('/wallet/create', {}, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create wallet');
    } catch (error) {
      console.error('Create wallet error:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getBalance(): Promise<{ balance: number; address: string }> {
    try {
      const response = await apiService.get<{ balance: number; address: string }>('/wallet/balance', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get balance');
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  }

  // Transfer tokens
  async transfer(transferData: {
    to: string;
    amount: number;
    note?: string;
  }): Promise<Transaction> {
    try {
      const response = await apiService.post<Transaction>('/wallet/transfer', transferData, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to transfer tokens');
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }

  // Stake tokens
  async stake(amount: number, duration: number = 7): Promise<{ success: boolean; transactionHash: string }> {
    try {
      const response = await apiService.post<{ success: boolean; transactionHash: string }>('/wallet/stake', {
        amount: amount.toString(),
        duration
      }, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to stake tokens');
    } catch (error) {
      console.error('Stake error:', error);
      throw error;
    }
  }

  // Stake tokens with specific duration (for biblical durations: 7, 40, 50, 180, 365)
  async stakeWithDuration(amount: string, duration: number): Promise<{ success: boolean; transactionHash: string }> {
    try {
      const response = await apiService.post<{ success: boolean; transactionHash: string }>('/wallet/stake', {
        amount,
        duration
      }, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to stake tokens');
    } catch (error) {
      console.error('Stake with duration error:', error);
      throw error;
    }
  }

  // Unstake tokens
  async unstake(amount: number): Promise<{ success: boolean; transactionHash: string }> {
    try {
      const response = await apiService.post<{ success: boolean; transactionHash: string }>('/wallet/unstake', { amount }, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to unstake tokens');
    } catch (error) {
      console.error('Unstake error:', error);
      throw error;
    }
  }

  // Get transactions
  async getTransactions(options: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.type) params.append('type', options.type);

      const endpoint = `/wallet/transactions${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get<Transaction[]>(endpoint, true);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch transactions');
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }

  // Get staking info
  async getStakingInfo(): Promise<StakingInfo> {
    try {
      const response = await apiService.get<StakingInfo>('/wallet/staking-info', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get staking info');
    } catch (error) {
      console.error('Get staking info error:', error);
      throw error;
    }
  }

  // Get transaction by hash
  async getTransaction(hash: string): Promise<Transaction> {
    try {
      const response = await apiService.get<Transaction>(`/wallet/transaction/${hash}`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Transaction not found');
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  }

  // Send to user by username
  async sendToUser(userData: {
    username: string;
    amount: number;
    note?: string;
  }): Promise<Transaction> {
    try {
      const response = await apiService.post<Transaction>('/wallet/send-to-user', userData, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to send to user');
    } catch (error) {
      console.error('Send to user error:', error);
      throw error;
    }
  }

  // Get portfolio
  async getPortfolio(): Promise<Portfolio> {
    try {
      const response = await apiService.get<Portfolio>('/wallet/portfolio', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get portfolio');
    } catch (error) {
      console.error('Get portfolio error:', error);
      throw error;
    }
  }

  // Get rewards summary
  async getRewardsSummary(): Promise<{
    totalRewards: number;
    weeklyRewards: number;
    monthlyRewards: number;
    stakingRewards: number;
    activityRewards: number;
  }> {
    try {
      const response = await apiService.get<{
        totalRewards: number;
        weeklyRewards: number;
        monthlyRewards: number;
        stakingRewards: number;
        activityRewards: number;
      }>('/wallet/rewards-summary', true);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get rewards summary');
    } catch (error) {
      console.error('Get rewards summary error:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();
export { BlockchainService };