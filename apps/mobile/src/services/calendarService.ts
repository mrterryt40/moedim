// Mo'edim Calendar Service
// Handles Hebrew calendar, feasts, and dates

import { apiService } from './api';
import type {
  HebrewDate,
  Feast,
  CalendarDay,
  ApiResponse
} from '../types';

class CalendarService {
  // Get current Hebrew date info
  async getCurrentDate(): Promise<{
    hebrewDate: HebrewDate;
    gregorianDate: string;
    isShabbat: boolean;
    feasts: Feast[];
  }> {
    try {
      const response = await apiService.get<{
        hebrewDate: HebrewDate;
        gregorianDate: string;
        isShabbat: boolean;
        feasts: Feast[];
      }>('/calendar/current');

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get current date');
    } catch (error) {
      console.error('Get current date error:', error);
      throw error;
    }
  }

  // Get Hebrew date for specific date
  async getHebrewDate(date?: string): Promise<HebrewDate> {
    try {
      const endpoint = date ? `/calendar/hebrew-date?date=${date}` : '/calendar/hebrew-date';
      const response = await apiService.get<HebrewDate>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get Hebrew date');
    } catch (error) {
      console.error('Get Hebrew date error:', error);
      throw error;
    }
  }

  // Get Sabbath times
  async getSabbathTimes(location?: {
    latitude: number;
    longitude: number;
  }): Promise<{
    candles: string;
    havdalah: string;
    isShabbat: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (location) {
        params.append('lat', location.latitude.toString());
        params.append('lng', location.longitude.toString());
      }

      const endpoint = `/calendar/sabbath-times${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get<{
        candles: string;
        havdalah: string;
        isShabbat: boolean;
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get Sabbath times');
    } catch (error) {
      console.error('Get Sabbath times error:', error);
      throw error;
    }
  }

  // Get upcoming feasts
  async getUpcomingFeasts(): Promise<Feast[]> {
    try {
      const response = await apiService.get<Feast[]>('/calendar/upcoming-feasts');

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get upcoming feasts');
    } catch (error) {
      console.error('Get upcoming feasts error:', error);
      throw error;
    }
  }

  // Get feasts for specific year
  async getFeastsForYear(year: number): Promise<Feast[]> {
    try {
      const response = await apiService.get<Feast[]>(`/calendar/feasts/${year}`);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get feasts for year');
    } catch (error) {
      console.error('Get feasts for year error:', error);
      throw error;
    }
  }

  // Check if current day is Sabbath
  async isShabbat(): Promise<boolean> {
    try {
      const response = await apiService.get<{ isShabbat: boolean }>('/calendar/is-sabbath');

      if (response.success && response.data) {
        return response.data.isShabbat;
      }
      throw new Error(response.message || 'Failed to check Sabbath status');
    } catch (error) {
      console.error('Check Sabbath error:', error);
      throw error;
    }
  }

  // Check if current day is New Moon
  async isNewMoon(): Promise<boolean> {
    try {
      const response = await apiService.get<{ isNewMoon: boolean }>('/calendar/is-new-moon');

      if (response.success && response.data) {
        return response.data.isNewMoon;
      }
      throw new Error(response.message || 'Failed to check New Moon status');
    } catch (error) {
      console.error('Check New Moon error:', error);
      throw error;
    }
  }

  // Get specific feast information
  async getFeast(name: string): Promise<Feast> {
    try {
      const response = await apiService.get<Feast>(`/calendar/feast/${encodeURIComponent(name)}`);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Feast not found');
    } catch (error) {
      console.error('Get feast error:', error);
      throw error;
    }
  }

  // Save Hebrew date entry
  async saveHebrewDatePreferences(data: {
    hebrewDate: string;
    gregorianDate: string;
    isSabbath: boolean;
    isFeast: boolean;
    feastName?: string;
  }): Promise<void> {
    try {
      const response = await apiService.post('/calendar/save-hebrew-date', data, true);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save Hebrew date');
      }
    } catch (error) {
      console.error('Save Hebrew date error:', error);
      throw error;
    }
  }

  // Get comprehensive today info
  async getTodayInfo(): Promise<{
    hebrewDate: HebrewDate;
    gregorianDate: string;
    isShabbat: boolean;
    isNewMoon: boolean;
    feasts: Feast[];
    sabbathTimes?: {
      candles: string;
      havdalah: string;
    };
    nextFeast?: Feast;
    parasha?: {
      name: string;
      nameHebrew: string;
    };
  }> {
    try {
      const response = await apiService.get<{
        hebrewDate: HebrewDate;
        gregorianDate: string;
        isShabbat: boolean;
        isNewMoon: boolean;
        feasts: Feast[];
        sabbathTimes?: {
          candles: string;
          havdalah: string;
        };
        nextFeast?: Feast;
        parasha?: {
          name: string;
          nameHebrew: string;
        };
      }>('/calendar/today-info');

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get today info');
    } catch (error) {
      console.error('Get today info error:', error);
      throw error;
    }
  }

  // Get month view with Hebrew dates
  async getMonthView(options: {
    year?: number;
    month?: number; // 1-12
  } = {}): Promise<{
    year: number;
    month: number;
    days: {
      gregorianDate: string;
      day: number;
      hebrewDate: HebrewDate;
      isSabbath: boolean;
      isNewMoon: boolean;
    }[];
  }> {
    try {
      const params = new URLSearchParams();
      if (options.year) params.append('year', options.year.toString());
      if (options.month) params.append('month', options.month.toString());

      const endpoint = `/calendar/month-view${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiService.get<{
        year: number;
        month: number;
        days: {
          gregorianDate: string;
          day: number;
          hebrewDate: HebrewDate;
          isSabbath: boolean;
          isNewMoon: boolean;
        }[];
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get month view');
    } catch (error) {
      console.error('Get month view error:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();
export { CalendarService };