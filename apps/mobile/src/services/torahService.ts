// Mo'edim Torah Service
// Handles Torah portions, daily readings, and study progress

import { apiService } from './api';
import type {
  TorahPortion,
  TorahProgress,
  TorahStats,
  ApiResponse
} from '../types';

class TorahService {
  // Get daily Torah portion
  async getDailyPortion(date?: string): Promise<TorahPortion> {
    try {
      const endpoint = date ? `/torah/daily?date=${date}` : '/torah/daily';
      const response = await apiService.get<TorahPortion>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get daily portion');
    } catch (error) {
      console.error('Get daily portion error:', error);
      throw error;
    }
  }

  // Get all Torah portions
  async getAllPortions(): Promise<TorahPortion[]> {
    try {
      const response = await apiService.get<TorahPortion[]>('/torah/portions');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get portions');
    } catch (error) {
      console.error('Get all portions error:', error);
      throw error;
    }
  }

  // Get specific Torah portion by ID
  async getPortionById(id: string): Promise<TorahPortion> {
    try {
      const response = await apiService.get<TorahPortion>(`/torah/portions/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Portion not found');
    } catch (error) {
      console.error('Get portion by ID error:', error);
      throw error;
    }
  }

  // Get current week's Torah reading
  async getCurrentWeekReading(): Promise<TorahPortion> {
    try {
      const response = await apiService.get<TorahPortion>('/torah/calendar/current-week');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get current week reading');
    } catch (error) {
      console.error('Get current week reading error:', error);
      throw error;
    }
  }

  // Search Torah content
  async searchTorah(query: string, language: string = 'both'): Promise<{
    portions: TorahPortion[];
    verses: any[];
    totalResults: number;
  }> {
    try {
      const response = await apiService.get<{
        portions: TorahPortion[];
        verses: any[];
        totalResults: number;
      }>(`/torah/search?q=${encodeURIComponent(query)}&language=${language}`);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Search failed');
    } catch (error) {
      console.error('Search Torah error:', error);
      throw error;
    }
  }

  // Get user's progress on a specific portion
  async getPortionProgress(portionId: string): Promise<TorahProgress> {
    try {
      const response = await apiService.get<TorahProgress>(`/torah/progress/${portionId}`, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get portion progress');
    } catch (error) {
      console.error('Get portion progress error:', error);
      throw error;
    }
  }

  // Mark Torah portion as complete
  async markPortionComplete(portionId: string, notes?: string): Promise<TorahProgress> {
    try {
      const response = await apiService.post<TorahProgress>(`/torah/complete/${portionId}`, { notes }, true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to mark portion complete');
    } catch (error) {
      console.error('Mark portion complete error:', error);
      throw error;
    }
  }

  // Get user's Torah study statistics
  async getTorahStats(): Promise<TorahStats> {
    try {
      const response = await apiService.get<TorahStats>('/torah/stats', true);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get Torah stats');
    } catch (error) {
      console.error('Get Torah stats error:', error);
      throw error;
    }
  }

  // Get Torah portions for specific year/cycle
  async getPortionsForYear(year?: number): Promise<TorahPortion[]> {
    try {
      const endpoint = year ? `/torah/portions?year=${year}` : '/torah/portions';
      const response = await apiService.get<TorahPortion[]>(endpoint);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get portions for year');
    } catch (error) {
      console.error('Get portions for year error:', error);
      throw error;
    }
  }

  // Get Torah reading schedule
  async getReadingSchedule(): Promise<{
    currentWeek: TorahPortion;
    nextWeek: TorahPortion;
    upcomingPortions: TorahPortion[];
  }> {
    try {
      const response = await apiService.get<{
        currentWeek: TorahPortion;
        nextWeek: TorahPortion;
        upcomingPortions: TorahPortion[];
      }>('/torah/schedule');

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get reading schedule');
    } catch (error) {
      console.error('Get reading schedule error:', error);
      throw error;
    }
  }

  // Get user's reading history
  async getReadingHistory(): Promise<{
    completedPortions: TorahPortion[];
    totalCompleted: number;
    currentStreak: number;
    lastRead: Date;
  }> {
    try {
      const response = await apiService.get<{
        completedPortions: TorahPortion[];
        totalCompleted: number;
        currentStreak: number;
        lastRead: Date;
      }>('/torah/history', true);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get reading history');
    } catch (error) {
      console.error('Get reading history error:', error);
      throw error;
    }
  }
}

export const torahService = new TorahService();
export { TorahService };