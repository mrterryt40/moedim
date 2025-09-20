import { Injectable } from '@nestjs/common';
import { PrismaClient, QueryMode } from '@prisma/client';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TorahService {
  private prisma = new PrismaClient();

  constructor(private blockchainService?: BlockchainService) {}

  async getDailyPortion(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const hebrewDate = this.convertToHebrewDate(targetDate);

    // Get current Torah portion based on Hebrew calendar
    const portion = await this.prisma.torahPortion.findFirst({
      where: {
        startDate: {
          lte: targetDate
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    if (!portion) {
      return this.createSampleDailyPortion(hebrewDate, targetDate);
    }

    return {
      ...portion,
      hebrewDate,
      gregorianDate: targetDate.toISOString().split('T')[0],
      isSabbath: targetDate.getDay() === 6, // Saturday
      nextReading: await this.getNextReading(targetDate)
    };
  }

  async getAllPortions() {
    return this.prisma.torahPortion.findMany({
      orderBy: {
        startDate: 'asc'
      }
    });
  }

  async getPortionById(id: string) {
    return this.prisma.torahPortion.findUnique({
      where: { id }
    });
  }

  async getCurrentWeekReading() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

    return this.prisma.torahPortion.findFirst({
      where: {
        startDate: {
          gte: startOfWeek,
          lte: now
        }
      }
    });
  }

  async searchTorah(query: string, language: string = 'both') {
    // Enhanced search with content search
    const whereClause = {
      OR: [
        { nameEnglish: { contains: query, mode: QueryMode.insensitive } },
        { nameHebrew: { contains: query } },
        { parasha: { contains: query, mode: QueryMode.insensitive } }
      ]
    };

    // Content search temporarily disabled due to Prisma type issues

    return this.prisma.torahPortion.findMany({
      where: whereClause,
      orderBy: { startDate: 'asc' }
    });
  }

  async getPortionProgress(userId: string, portionId: string) {
    return this.prisma.userStudyProgress.findFirst({
      where: {
        userId,
        contentId: portionId,
        contentType: 'torah'
      }
    });
  }

  async markPortionComplete(userId: string, portionId: string, notes?: string) {
    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingProgress = await this.prisma.userStudyProgress.findFirst({
      where: {
        userId,
        contentId: portionId,
        contentType: 'torah',
        completedAt: {
          gte: today
        }
      }
    });

    if (existingProgress) {
      return { message: 'Torah portion already completed today', coinsEarned: 0 };
    }

    // Calculate coins earned (base 1.0 for Torah reading)
    const coinsEarned = 1.0;

    // Create progress record
    await this.prisma.userStudyProgress.create({
      data: {
        userId,
        contentId: portionId,
        contentType: 'torah',
        completedAt: new Date(),
        score: 5, // Perfect score for reading
        coinsEarned,
        notes
      }
    });

    // Update user total coins
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalCoins: {
          increment: coinsEarned
        }
      }
    });

    // Update streak
    await this.updateTorahStreak(userId);

    // Mint blockchain rewards if service is available
    if (this.blockchainService) {
      try {
        await this.blockchainService.mintReward(userId, coinsEarned, 'daily_torah');
      } catch (error) {
        console.error('Blockchain reward failed:', error);
      }
    }

    return { message: 'Torah portion completed!', coinsEarned };
  }

  async getTorahStats(userId: string) {
    const totalPortionsRead = await this.prisma.userStudyProgress.count({
      where: {
        userId,
        contentType: 'torah'
      }
    });

    const readToday = await this.prisma.userStudyProgress.count({
      where: {
        userId,
        contentType: 'torah',
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      totalPortionsRead,
      readToday,
      currentStreak: user.streakDays
    };
  }

  private async updateTorahStreak(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const readToday = await this.prisma.userStudyProgress.findFirst({
      where: {
        userId,
        contentType: 'torah',
        completedAt: {
          gte: today
        }
      }
    });

    const readYesterday = await this.prisma.userStudyProgress.findFirst({
      where: {
        userId,
        contentType: 'torah',
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

    if (!user) {
      throw new Error('User not found');
    }

    let newStreak = user.streakDays;

    if (readToday) {
      if (readYesterday || user.streakDays === 0) {
        newStreak = user.streakDays + 1;
      }
    } else if (!readYesterday && user.streakDays > 0) {
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

  private convertToHebrewDate(gregorianDate: Date): string {
    // Simplified Hebrew date calculation
    // In production, use a proper Hebrew calendar library
    const hebrewYear = gregorianDate.getFullYear() + 3760;
    const months = [
      'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
      'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
    ];
    const month = months[gregorianDate.getMonth()];
    const day = gregorianDate.getDate();

    return `${day} ${month} ${hebrewYear}`;
  }

  private async getNextReading(currentDate: Date) {
    return this.prisma.torahPortion.findFirst({
      where: {
        startDate: {
          gt: currentDate
        }
      },
      orderBy: {
        startDate: 'asc'
      },
      select: {
        nameEnglish: true,
        nameHebrew: true,
        startDate: true
      }
    });
  }

  private createSampleDailyPortion(hebrewDate: string, targetDate: Date) {
    // Sample data when no portion exists in database
    return {
      id: 'sample',
      nameEnglish: 'Bereishit',
      nameHebrew: 'בראשית',
      parasha: 'In the beginning',
      content: {
        english: 'In the beginning God created the heavens and the earth...',
        hebrew: 'בראשית ברא אלהים את השמים ואת הארץ...',
        verses: 'Genesis 1:1-6:8',
        theme: 'Creation and the early generations of mankind',
        lessons: [
          'God as Creator of all things',
          'Human responsibility as stewards of creation',
          'The consequences of disobedience'
        ],
        commentary: 'This portion introduces the fundamental concepts of creation and divine sovereignty.',
        questions: [
          'What does it mean that humans are made in the image of God?',
          'How does the Sabbath relate to creation?',
          'What lessons can we learn from the story of Cain and Abel?'
        ]
      },
      hebrewDate,
      gregorianDate: targetDate.toISOString().split('T')[0],
      isSabbath: targetDate.getDay() === 6,
      audioUrl: null,
      createdAt: new Date()
    };
  }
}
