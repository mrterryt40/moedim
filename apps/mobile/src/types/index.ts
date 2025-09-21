// Mo'edim Platform Type Definitions
// Comprehensive types for all API models and responses

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ==============================================
// AUTH & USER TYPES
// ==============================================

export interface User {
  id: string;
  email: string;
  username: string;
  walletAddress?: string;
  hebrewLevel: number;
  streakDays: number;
  totalCoins: number;
  timezone?: string;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ==============================================
// TORAH TYPES
// ==============================================

export interface TorahPortion {
  id: string;
  nameEnglish: string;
  nameHebrew: string;
  parasha: string;
  content: {
    english: string;
    hebrew: string;
    verses: string;
    theme: string;
    lessons: string[];
    transliteration?: string;
    commentary?: string;
  };
  hebrewDate: string;
  gregorianDate: string;
  isSabbath: boolean;
  nextReading?: {
    nameEnglish: string;
    nameHebrew: string;
    startDate: string;
  };
}

export interface TorahProgress {
  portionId: string;
  userId: string;
  completed: boolean;
  completedAt?: Date;
  coinsEarned: number;
}

export interface TorahStats {
  totalPortionsRead: number;
  currentStreak: number;
  longestStreak: number;
  favoriteParasha: string;
  totalCoinsEarned: number;
  averageReadingTime: number;
  completionPercentage: number;
}

export interface UserProgress {
  streakDays: number;
  totalCoins: number;
  totalReadings: number;
  isCompletedToday: boolean;
}

// ==============================================
// HEBREW LEARNING TYPES
// ==============================================

export interface HebrewCard {
  id: string;
  wordHebrew: string;
  wordEnglish: string;
  transliteration: string;
  difficultyLevel: number;
  gematriaValue?: number;
  category: string;
  audioUrl?: string;
  lastReviewed?: Date;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface ReviewResult {
  cardId: string;
  quality: number; // 0-5 rating
  timeSpent: number;
  correct: boolean;
}

export interface LearningProgress {
  dueCards?: number;
  newCards?: number;
  reviewedToday: number;
  streakDays: number;
  totalCards: number;
  masteredCards: number;
  completionPercentage?: number;
  wordsLearned?: number;
  totalWords?: number;
  studiedToday?: number;
  dueForReview?: number;
  masteredWords?: number;
  currentLevel?: number;
  nextReviewTime?: string;
  accuracy?: number;
}

export interface ReviewCard {
  id: string;
  wordHebrew: string;
  wordEnglish: string;
  transliteration: string;
  difficultyLevel: number;
  gematriaValue?: number;
  category: string;
  audioUrl?: string;
  lastReviewed?: Date;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface HebrewStats {
  dueCards?: number;
  newCards?: number;
  reviewedToday?: number;
  totalCards?: number;
  masteredCards?: number;
  completionPercentage?: number;
  wordsLearned?: number;
  streakDays?: number;
  accuracy?: number;
  longestStreak?: number;
  averageReviewTime?: number;
}

export interface HebrewCategory {
  id: string;
  name: string;
  description: string;
}

export interface ReviewResult {
  success: boolean;
  newStreak?: number;
  coinsEarned?: number;
  nextReviewDate?: Date;
  message?: string;
}

// ==============================================
// CALENDAR TYPES
// ==============================================

export interface HebrewDate {
  day: number;
  month: string;
  year: number;
  hebrewName?: string;
  gregorianDate: string;
  isShabbat: boolean;
  isNewMoon: boolean;
  dayOfWeek: string;
}

export interface Feast {
  id: string;
  name: string;
  nameHebrew: string;
  date: string;
  description: string;
  significance: string;
  observances: string[];
  daysUntil?: number;
}

export interface CalendarDay {
  date: Date;
  hebrewDate: string;
  isShabbat: boolean;
  isNewMoon: boolean;
  feasts: Feast[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

// ==============================================
// MARKETPLACE TYPES
// ==============================================

export interface Product {
  id: string;
  name: string;
  hebrewName?: string;
  description: string;
  price: number;
  salePrice?: number;
  priceInCoins?: number;
  category: string;
  images: string[];
  tags?: string[];
  sellerId: string;
  seller: {
    id: string;
    name?: string;
    username: string;
    rating: number;
    verified?: boolean;
  };
  inStock: boolean;
  stock?: number;
  kosher?: boolean;
  certified?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'stripe' | 'paypal' | 'coins';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

// ==============================================
// COMMUNITY TYPES
// ==============================================

export interface Community {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  memberCount: number;
  ownerId: string;
  createdAt: Date;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'audio';
  createdAt: Date;
}

export interface CommunityMember {
  id: string;
  username: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
}

// ==============================================
// BLOCKCHAIN/WALLET TYPES
// ==============================================

export interface Wallet {
  address: string;
  balance: number;
  privateKey?: string; // Only for creation response
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: number;
  type: 'transfer' | 'stake' | 'unstake' | 'reward';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: number;
  gasPrice?: number;
}

export interface StakingInfo {
  totalStaked: number;
  rewards: number;
  stakingPower: number;
  nextRewardDate: Date;
}

export interface Portfolio {
  totalValue: number;
  tokens: {
    symbol: string;
    name: string;
    balance: number;
    value: number;
  }[];
  transactions: Transaction[];
}

// ==============================================
// NUMBERS/GEMATRIA TYPES
// ==============================================

export interface GematriaResult {
  word: string;
  value: number;
  method: 'standard' | 'ordinal' | 'reduced';
  letterBreakdown: {
    letter: string;
    value: number;
  }[];
}

export interface BiblicalNumber {
  number: number;
  significance: string;
  verses: string[];
  examples: string[];
}

export interface WordAnalysis {
  word: string;
  gematria: GematriaResult;
  numerology: any;
  biblicalReferences: string[];
  spiritualMeaning: string;
}

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

// ==============================================
// NUMBERS & GEMATRIA TYPES
// ==============================================

export interface GematriaResult {
  text: string;
  value: number;
  method: 'standard' | 'ordinal' | 'reduced';
  breakdown: { letter: string; value: number }[];
  meanings?: string[];
}

export interface NumberMeaning {
  number: number;
  meaning: string;
  significance: string;
  biblicalReferences: string[];
  hebrewLetters?: string[];
}

export interface NumberCalculation {
  number: number;
  isPrime: boolean;
  primeFactors: number[];
  digitalRoot: number;
  sumOfDigits: number;
  romanNumeral: string;
  hebrewRepresentation?: string;
}

// ==============================================
// COMMON UTILITY TYPES
// ==============================================

export interface SearchQuery {
  q: string;
  category?: string;
  limit?: number;
  page?: number;
}

export interface FilterOptions {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
}