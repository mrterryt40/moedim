// Mo'edim Numbers/Gematria Service
// Handles numerology, gematria calculations, and number meanings

import { apiService } from './api';
import type {
  GematriaResult,
  NumberMeaning,
  NumberCalculation,
  ApiResponse
} from '../types';

class NumbersService {
  // Calculate gematria value
  async calculateGematria(text: string, method?: string): Promise<GematriaResult> {
    try {
      const params = new URLSearchParams();
      params.append('text', text);
      if (method) params.append('method', method);

      const endpoint = `/numbers/gematria?${params.toString()}`;
      const response = await apiService.get<GematriaResult>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to calculate gematria');
    } catch (error) {
      console.error('Calculate gematria error:', error);
      throw error;
    }
  }

  // Get numerology meaning for a number
  async getNumerologyMeaning(number: number): Promise<NumberMeaning> {
    try {
      const response = await apiService.get<NumberMeaning>(`/numbers/numerology/${number}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Number meaning not found');
    } catch (error) {
      console.error('Get numerology meaning error:', error);
      throw error;
    }
  }

  // Get biblical cycles information
  async getBiblicalCycles(): Promise<{
    cycles: { name: string; days: number; description: string }[];
    currentCycle?: string;
  }> {
    try {
      const response = await apiService.get<{
        cycles: { name: string; days: number; description: string }[];
        currentCycle?: string;
      }>('/numbers/biblical-cycles');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get biblical cycles');
    } catch (error) {
      console.error('Get biblical cycles error:', error);
      throw error;
    }
  }

  // Find number patterns in text
  async findNumberPatterns(text: string): Promise<{
    patterns: { pattern: string; significance: string; count: number }[];
    summary: string;
  }> {
    try {
      const response = await apiService.get<{
        patterns: { pattern: string; significance: string; count: number }[];
        summary: string;
      }>(`/numbers/patterns?text=${encodeURIComponent(text)}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to find patterns');
    } catch (error) {
      console.error('Find patterns error:', error);
      throw error;
    }
  }

  // Calculate Hebrew numerology for a word
  async calculateHebrewNumerology(word: string): Promise<{
    word: string;
    value: number;
    breakdown: { letter: string; value: number }[];
    meaning: string;
  }> {
    try {
      const response = await apiService.get<{
        word: string;
        value: number;
        breakdown: { letter: string; value: number }[];
        meaning: string;
      }>(`/numbers/hebrew-numerology?word=${encodeURIComponent(word)}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to calculate Hebrew numerology');
    } catch (error) {
      console.error('Calculate Hebrew numerology error:', error);
      throw error;
    }
  }

  // Compare gematria values of two texts
  async compareGematria(text1: string, text2: string): Promise<{
    text1: { text: string; value: number };
    text2: { text: string; value: number };
    difference: number;
    relationship: string;
    significance?: string;
  }> {
    try {
      const response = await apiService.get<{
        text1: { text: string; value: number };
        text2: { text: string; value: number };
        difference: number;
        relationship: string;
        significance?: string;
      }>(`/numbers/compare?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to compare gematria');
    } catch (error) {
      console.error('Compare gematria error:', error);
      throw error;
    }
  }

  // Get sacred numbers
  async getSacredNumbers(): Promise<{
    numbers: { number: number; name: string; significance: string; verses: string[] }[];
    categories: string[];
  }> {
    try {
      const response = await apiService.get<{
        numbers: { number: number; name: string; significance: string; verses: string[] }[];
        categories: string[];
      }>('/numbers/sacred-numbers');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get sacred numbers');
    } catch (error) {
      console.error('Get sacred numbers error:', error);
      throw error;
    }
  }

  // Get Hebrew letter meanings
  async getHebrewLetterMeanings(): Promise<{
    letters: { letter: string; name: string; value: number; meaning: string; symbolism: string }[];
  }> {
    try {
      const response = await apiService.get<{
        letters: { letter: string; name: string; value: number; meaning: string; symbolism: string }[];
      }>('/numbers/letter-meanings');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get letter meanings');
    } catch (error) {
      console.error('Get letter meanings error:', error);
      throw error;
    }
  }

  // Calculate date gematria
  async calculateDateGematria(date: string): Promise<{
    date: string;
    hebrewDate: string;
    gematria: number;
    significance: string;
    biblicalEvents: string[];
  }> {
    try {
      const response = await apiService.get<{
        date: string;
        hebrewDate: string;
        gematria: number;
        significance: string;
        biblicalEvents: string[];
      }>(`/numbers/calculate-date?date=${date}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to calculate date gematria');
    } catch (error) {
      console.error('Calculate date gematria error:', error);
      throw error;
    }
  }

  // Analyze word for comprehensive numerical information
  async analyzeWord(word: string): Promise<{
    word: string;
    gematria: number;
    letterCount: number;
    vowelCount: number;
    consonantCount: number;
    numerology: number;
    breakdown: { letter: string; value: number; position: number }[];
    patterns: string[];
    significance: string;
    relatedWords: { word: string; gematria: number; relationship: string }[];
  }> {
    try {
      const response = await apiService.get<{
        word: string;
        gematria: number;
        letterCount: number;
        vowelCount: number;
        consonantCount: number;
        numerology: number;
        breakdown: { letter: string; value: number; position: number }[];
        patterns: string[];
        significance: string;
        relatedWords: { word: string; gematria: number; relationship: string }[];
      }>(`/numbers/word-analysis?word=${encodeURIComponent(word)}`);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to analyze word');
    } catch (error) {
      console.error('Analyze word error:', error);
      throw error;
    }
  }
}

export const numbersService = new NumbersService();
export { NumbersService };