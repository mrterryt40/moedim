import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TorahService {
  private prisma = new PrismaClient();

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
      return this.createSampleDailyPortion(hebrewDate);
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
    // Simple text search - can be enhanced with MeiliSearch later
    return this.prisma.torahPortion.findMany({
      where: {
        OR: [
          { nameEnglish: { contains: query, mode: 'insensitive' } },
          { nameHebrew: { contains: query } },
          { parasha: { contains: query, mode: 'insensitive' } }
        ]
      }
    });
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

  private createSampleDailyPortion(hebrewDate: string) {
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
        ]
      },
      hebrewDate,
      gregorianDate: new Date().toISOString().split('T')[0],
      isSabbath: new Date().getDay() === 6,
      audioUrl: null,
      createdAt: new Date()
    };
  }
}
