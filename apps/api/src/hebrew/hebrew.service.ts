import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BlockchainService } from '../blockchain/blockchain.service';

interface SRSResult {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: Date;
}

interface ReviewCard {
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

@Injectable()
export class HebrewService {
  private prisma = new PrismaClient();

  constructor(
    @InjectQueue('srs') private srsQueue: Queue,
    private blockchainService?: BlockchainService,
  ) {}

  async getReviewCards(userId: string, limit: number = 20): Promise<ReviewCard[]> {
    const now = new Date();

    const reviews = await this.prisma.userCardReview.findMany({
      where: {
        userId,
        nextReviewDate: {
          lte: now
        }
      },
      include: {
        card: true
      },
      orderBy: {
        nextReviewDate: 'asc'
      },
      take: limit
    });

    return reviews.map(review => ({
      id: review.card.id,
      wordHebrew: review.card.wordHebrew,
      wordEnglish: review.card.wordEnglish,
      transliteration: review.card.transliteration,
      difficultyLevel: review.card.difficultyLevel,
      gematriaValue: review.card.gematriaValue,
      category: review.card.category,
      audioUrl: review.card.audioUrl,
      lastReviewed: review.lastReviewed,
      easeFactor: Number(review.easeFactor),
      intervalDays: review.intervalDays,
      repetitions: review.repetitions
    }));
  }

  async submitReview(
    userId: string,
    cardId: string,
    quality: number
  ): Promise<{ coinsEarned: number; nextReview: Date }> {
    // Quality: 0-5 scale (0=complete blackout, 5=perfect response)
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }

    const existingReview = await this.prisma.userCardReview.findFirst({
      where: { userId, cardId }
    });

    let currentEF = existingReview ? Number(existingReview.easeFactor) : 2.5;
    let currentInterval = existingReview ? existingReview.intervalDays : 1;
    let currentReps = existingReview ? existingReview.repetitions : 0;

    const srsResult = this.calculateSRS(currentEF, currentInterval, currentReps, quality);

    // Calculate coins earned based on quality and difficulty
    const card = await this.prisma.hebrewCard.findUnique({ where: { id: cardId } });
    const coinsEarned = this.calculateCoinsEarned(quality, card.difficultyLevel);

    // Update or create review record
    await this.prisma.userCardReview.upsert({
      where: {
        userId_cardId: { userId, cardId }
      },
      update: {
        easeFactor: srsResult.easeFactor,
        intervalDays: srsResult.intervalDays,
        repetitions: srsResult.repetitions,
        nextReviewDate: srsResult.nextReviewDate,
        lastReviewed: new Date()
      },
      create: {
        userId,
        cardId,
        easeFactor: srsResult.easeFactor,
        intervalDays: srsResult.intervalDays,
        repetitions: srsResult.repetitions,
        nextReviewDate: srsResult.nextReviewDate,
        lastReviewed: new Date()
      }
    });

    // Update user coins and study progress
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalCoins: {
          increment: coinsEarned
        }
      }
    });

    await this.prisma.userStudyProgress.create({
      data: {
        userId,
        contentId: cardId,
        contentType: 'hebrew_lesson',
        completedAt: new Date(),
        score: quality,
        coinsEarned
      }
    });

    // Schedule next review reminder
    await this.srsQueue.add(
      'schedule-review-reminder',
      { userId, cardId },
      { delay: srsResult.intervalDays * 24 * 60 * 60 * 1000 }
    );

    // Mint blockchain rewards if service is available
    if (this.blockchainService && coinsEarned > 0) {
      try {
        await this.blockchainService.mintReward(userId, coinsEarned, 'hebrew_review');
      } catch (error) {
        console.error('Blockchain reward failed:', error);
      }
    }

    return {
      coinsEarned,
      nextReview: srsResult.nextReviewDate
    };
  }

  async getNewCards(userId: string, limit: number = 5): Promise<ReviewCard[]> {
    // Get cards user hasn't reviewed yet
    const newCards = await this.prisma.hebrewCard.findMany({
      where: {
        reviews: {
          none: {
            userId
          }
        }
      },
      orderBy: {
        difficultyLevel: 'asc'
      },
      take: limit
    });

    // Initialize review records for new cards
    for (const card of newCards) {
      await this.prisma.userCardReview.create({
        data: {
          userId,
          cardId: card.id,
          easeFactor: 2.5,
          intervalDays: 1,
          repetitions: 0,
          nextReviewDate: new Date()
        }
      });
    }

    return newCards.map(card => ({
      id: card.id,
      wordHebrew: card.wordHebrew,
      wordEnglish: card.wordEnglish,
      transliteration: card.transliteration,
      difficultyLevel: card.difficultyLevel,
      gematriaValue: card.gematriaValue,
      category: card.category,
      audioUrl: card.audioUrl,
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0
    }));
  }

  async getStudyStats(userId: string) {
    const totalCards = await this.prisma.userCardReview.count({
      where: { userId }
    });

    const reviewsDue = await this.prisma.userCardReview.count({
      where: {
        userId,
        nextReviewDate: {
          lte: new Date()
        }
      }
    });

    const studiedToday = await this.prisma.userStudyProgress.count({
      where: {
        userId,
        contentType: 'hebrew_lesson',
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true, hebrewLevel: true }
    });

    return {
      totalCards,
      reviewsDue,
      studiedToday,
      streakDays: user.streakDays,
      hebrewLevel: user.hebrewLevel,
      nextLevelProgress: this.calculateLevelProgress(totalCards)
    };
  }

  async getAllCards(category?: string) {
    return this.prisma.hebrewCard.findMany({
      where: category ? { category } : undefined,
      orderBy: {
        difficultyLevel: 'asc'
      }
    });
  }

  async createCard(cardData: {
    wordHebrew: string;
    wordEnglish: string;
    transliteration: string;
    difficultyLevel: number;
    category: string;
    gematriaValue?: number;
    audioUrl?: string;
  }) {
    return this.prisma.hebrewCard.create({
      data: cardData
    });
  }

  private calculateSRS(
    easeFactor: number,
    interval: number,
    repetitions: number,
    quality: number
  ): SRSResult {
    // SuperMemo 2 algorithm implementation
    let newEF = easeFactor;
    let newInterval = interval;
    let newReps = repetitions;

    if (quality >= 3) {
      // Correct response
      if (newReps === 0) {
        newInterval = 1;
      } else if (newReps === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easeFactor);
      }
      newReps += 1;
    } else {
      // Incorrect response - reset
      newReps = 0;
      newInterval = 1;
    }

    // Update ease factor
    newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEF < 1.3) newEF = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      easeFactor: Number(newEF.toFixed(2)),
      intervalDays: newInterval,
      repetitions: newReps,
      nextReviewDate
    };
  }

  private calculateCoinsEarned(quality: number, difficultyLevel: number): number {
    // Base coins based on quality (0-5 scale)
    const baseCoins = quality * 0.1;

    // Difficulty multiplier (1-5 scale)
    const difficultyMultiplier = 1 + (difficultyLevel - 1) * 0.2;

    return Number((baseCoins * difficultyMultiplier).toFixed(2));
  }

  private calculateLevelProgress(totalCards: number): number {
    // Every 50 cards increases Hebrew level
    const cardsForNextLevel = 50;
    return (totalCards % cardsForNextLevel) / cardsForNextLevel * 100;
  }

  async updateUserStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const studiedToday = await this.prisma.userStudyProgress.findFirst({
      where: {
        userId,
        contentType: 'hebrew_lesson',
        completedAt: {
          gte: today
        }
      }
    });

    const studiedYesterday = await this.prisma.userStudyProgress.findFirst({
      where: {
        userId,
        contentType: 'hebrew_lesson',
        completedAt: {
          gte: yesterday,
          lt: today
        }
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true }
    });

    let newStreak = user.streakDays;

    if (studiedToday) {
      if (studiedYesterday || user.streakDays === 0) {
        newStreak = user.streakDays + 1;
      }
    } else if (!studiedYesterday && user.streakDays > 0) {
      newStreak = 0; // Streak broken
    }

    if (newStreak !== user.streakDays) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { streakDays: newStreak }
      });
    }

    return newStreak;
  }
}
