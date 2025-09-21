// Mo'edim Hebrew Learning Service
// Handles Hebrew spaced-repetition card system

import { apiService } from './api';
import type {
  ReviewCard,
  HebrewStats,
  HebrewCategory,
  ReviewResult,
  ApiResponse
} from '../types';

class HebrewService {
  // Get cards due for review
  async getReviewCards(limit: number = 20): Promise<ReviewCard[]> {
    try {
      const response = await apiService.get<ReviewCard[]>(`/hebrew/review-cards?limit=${limit}`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch review cards');
    } catch (error) {
      console.error('Get review cards error:', error);
      throw error;
    }
  }

  // Submit card review
  async submitReview(cardId: string, quality: number): Promise<ReviewResult> {
    try {
      const response = await apiService.post<ReviewResult>('/hebrew/review', { cardId, quality }, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to submit review');
    } catch (error) {
      console.error('Submit review error:', error);
      throw error;
    }
  }

  // Get new cards to learn
  async getNewCards(limit: number = 5): Promise<ReviewCard[]> {
    try {
      const response = await apiService.get<ReviewCard[]>(`/hebrew/new-cards?limit=${limit}`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch new cards');
    } catch (error) {
      console.error('Get new cards error:', error);
      throw error;
    }
  }

  // Get user's study statistics
  async getStats(): Promise<HebrewStats> {
    try {
      const response = await apiService.get<HebrewStats>('/hebrew/stats', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get study stats');
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  // Get all available cards (optionally filtered by category)
  async getAllCards(category?: string): Promise<ReviewCard[]> {
    try {
      const endpoint = category ? `/hebrew/cards?category=${category}` : '/hebrew/cards';
      const response = await apiService.get<ReviewCard[]>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch cards');
    } catch (error) {
      console.error('Get all cards error:', error);
      throw error;
    }
  }

  // Create new card (admin function)
  async createCard(cardData: {
    wordHebrew: string;
    wordEnglish: string;
    transliteration: string;
    difficultyLevel: number;
    category: string;
    gematriaValue?: number;
    audioUrl?: string;
  }): Promise<ReviewCard> {
    try {
      const response = await apiService.post<ReviewCard>('/hebrew/cards', cardData, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to create card');
    } catch (error) {
      console.error('Create card error:', error);
      throw error;
    }
  }

  // Get available learning categories
  async getCategories(): Promise<HebrewCategory[]> {
    try {
      const response = await apiService.get<HebrewCategory[]>('/hebrew/categories');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch categories');
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  }

  // Helper method to get progress data for dashboard
  async getProgress(): Promise<{
    dueCards: number;
    newCards: number;
    reviewedToday: number;
    totalCards: number;
    masteredCards: number;
    completionPercentage: number;
    wordsLearned: number;
    streakDays: number;
    accuracy: number;
  }> {
    try {
      const stats = await this.getStats();

      // Map backend stats to expected progress format
      return {
        dueCards: stats.dueCards || 0,
        newCards: stats.newCards || 0,
        reviewedToday: stats.reviewedToday || 0,
        totalCards: stats.totalCards || 0,
        masteredCards: stats.masteredCards || 0,
        completionPercentage: stats.completionPercentage || 0,
        wordsLearned: stats.wordsLearned || 0,
        streakDays: stats.streakDays || 0,
        accuracy: stats.accuracy || 0,
      };
    } catch (error) {
      console.error('Get progress error:', error);
      throw error;
    }
  }

  // Update progress (compatibility method)
  async updateProgress(progressData: {
    lessonId: string;
    completed: boolean;
    score?: number;
    timeSpent?: number;
  }): Promise<any> {
    // Convert lesson-based progress to card review
    if (progressData.score !== undefined) {
      return this.submitReview(progressData.lessonId, progressData.score);
    }
    throw new Error('Invalid progress data - requires score for card review');
  }
}

export const hebrewService = new HebrewService();
export { HebrewService };