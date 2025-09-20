import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface HebrewDate {
  day: number;
  month: string;
  year: number;
  formatted: string;
}

export interface SunsetTimes {
  candleLighting: Date;
  havdalah: Date;
}

export interface BiblicalFeast {
  name: string;
  nameHebrew: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  type: 'major' | 'minor' | 'fast';
  commandments: string[];
}

@Injectable()
export class CalendarService {
  private prisma = new PrismaClient();

  // Hebrew months
  private hebrewMonths = [
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
    'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
  ];

  // Hebrew months in Hebrew
  private hebrewMonthsHebrew = [
    'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר',
    'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
  ];

  async getCurrentHebrewDate(): Promise<HebrewDate> {
    const gregorianDate = new Date();
    return this.convertToHebrewDate(gregorianDate);
  }

  async getHebrewDate(gregorianDate: Date): Promise<HebrewDate> {
    return this.convertToHebrewDate(gregorianDate);
  }

  async getSabbathTimes(latitude: number, longitude: number, date?: Date): Promise<SunsetTimes> {
    const targetDate = date || new Date();

    // Find the upcoming Friday
    const dayOfWeek = targetDate.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(targetDate);
    friday.setDate(targetDate.getDate() + daysUntilFriday);

    // Calculate sunset time for Friday (candle lighting - 18 minutes before sunset)
    const sunset = this.calculateSunset(friday, latitude, longitude);
    const candleLighting = new Date(sunset.getTime() - 18 * 60 * 1000); // 18 minutes before

    // Calculate sunset for Saturday (Havdalah - after 3 stars appear, ~42 minutes after sunset)
    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);
    const saturdaySunset = this.calculateSunset(saturday, latitude, longitude);
    const havdalah = new Date(saturdaySunset.getTime() + 42 * 60 * 1000); // 42 minutes after

    return {
      candleLighting,
      havdalah
    };
  }

  async getUpcomingFeasts(count: number = 5): Promise<BiblicalFeast[]> {
    const currentYear = new Date().getFullYear();
    const feasts = this.calculateBiblicalFeasts(currentYear);

    const now = new Date();
    const upcomingFeasts = feasts
      .filter(feast => feast.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, count);

    return upcomingFeasts;
  }

  async getFeastsForYear(year: number): Promise<BiblicalFeast[]> {
    return this.calculateBiblicalFeasts(year);
  }

  async isSabbath(date?: Date): Promise<boolean> {
    const targetDate = date || new Date();
    return targetDate.getDay() === 6; // Saturday
  }

  async isNewMoon(date?: Date): Promise<boolean> {
    const targetDate = date || new Date();
    // Simplified new moon calculation
    // In production, use proper astronomical calculations
    const referenceNewMoon = new Date('2024-01-11'); // Known new moon
    const daysSinceReference = Math.floor((targetDate.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24));
    const lunarCycle = 29.53; // Average lunar month in days
    const currentCycle = daysSinceReference % lunarCycle;

    return Math.abs(currentCycle) < 1 || Math.abs(currentCycle - lunarCycle) < 1;
  }

  async getFeastByName(name: string): Promise<BiblicalFeast | null> {
    const currentYear = new Date().getFullYear();
    const feasts = this.calculateBiblicalFeasts(currentYear);

    return feasts.find(feast =>
      feast.name.toLowerCase().includes(name.toLowerCase()) ||
      feast.nameHebrew.includes(name)
    ) || null;
  }

  async saveHebrewDate(hebrewDate: string, gregorianDate: Date, isSabbath: boolean, isFeast: boolean, feastName?: string) {
    const sunsetTime = isSabbath ? this.calculateSunset(gregorianDate, 31.7683, 35.2137) : null; // Jerusalem coordinates

    return this.prisma.hebrewDate.create({
      data: {
        hebrewDate,
        gregorianDate,
        isSabbath,
        isFeast,
        feastName,
        sunsetTime
      }
    });
  }

  private convertToHebrewDate(gregorianDate: Date): HebrewDate {
    // Simplified Hebrew date calculation
    // In production, use proper Hebrew calendar library like @hebcal/core

    // Approximate conversion (this is simplified)
    const hebrewEpoch = new Date('1900-01-01'); // Approximation
    const daysSinceEpoch = Math.floor((gregorianDate.getTime() - hebrewEpoch.getTime()) / (1000 * 60 * 60 * 24));

    // Simplified calculation - in reality, Hebrew calendar is complex with leap years, etc.
    const hebrewYear = 5660 + Math.floor(daysSinceEpoch / 354); // Hebrew year approximation
    const dayInYear = daysSinceEpoch % 354;
    const monthIndex = Math.floor(dayInYear / 29.5);
    const day = Math.floor(dayInYear % 29.5) + 1;

    const month = this.hebrewMonths[monthIndex % 12];

    return {
      day,
      month,
      year: hebrewYear,
      formatted: `${day} ${month} ${hebrewYear}`
    };
  }

  private calculateSunset(date: Date, latitude: number, longitude: number): Date {
    // Simplified sunset calculation
    // In production, use proper astronomical calculation library

    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const p = Math.asin(0.39795 * Math.cos(0.98563 * (dayOfYear - 173) * Math.PI / 180));
    const argument = (Math.sin(-0.83 * Math.PI / 180) - Math.sin(latitude * Math.PI / 180) * Math.sin(p)) / (Math.cos(latitude * Math.PI / 180) * Math.cos(p));
    const t = 24 - (24 / Math.PI) * Math.acos(argument);

    const sunsetHour = t - longitude / 15;
    const sunsetTime = new Date(date);
    sunsetTime.setHours(Math.floor(sunsetHour), Math.floor((sunsetHour % 1) * 60), 0, 0);

    return sunsetTime;
  }

  private calculateBiblicalFeasts(year: number): BiblicalFeast[] {
    // Simplified feast calculation
    // In production, use proper Hebrew calendar calculation

    const feasts: BiblicalFeast[] = [];

    // Rosh Hashanah (1st day of Tishrei)
    feasts.push({
      name: 'Rosh Hashanah',
      nameHebrew: 'ראש השנה',
      description: 'Israelite New Year',
      startDate: new Date(year, 8, 15), // Approximation
      endDate: new Date(year, 8, 16),
      type: 'major',
      commandments: ['Hear the shofar', 'Eat sweet foods', 'Reflect on the past year']
    });

    // Yom Kippur (10th day of Tishrei)
    feasts.push({
      name: 'Yom Kippur',
      nameHebrew: 'יום כפור',
      description: 'Day of Atonement',
      startDate: new Date(year, 8, 24), // Approximation
      type: 'major',
      commandments: ['Fast for 25 hours', 'Repent', 'Pray for forgiveness']
    });

    // Sukkot (15th day of Tishrei)
    feasts.push({
      name: 'Sukkot',
      nameHebrew: 'סוכות',
      description: 'Feast of Tabernacles',
      startDate: new Date(year, 8, 29), // Approximation
      endDate: new Date(year, 9, 6),
      type: 'major',
      commandments: ['Dwell in sukkah', 'Wave the four species', 'Rejoice']
    });

    // Passover (15th day of Nissan)
    feasts.push({
      name: 'Passover',
      nameHebrew: 'פסח',
      description: 'Festival of Freedom',
      startDate: new Date(year, 3, 15), // Approximation
      endDate: new Date(year, 3, 22),
      type: 'major',
      commandments: ['Eat matzah', 'Conduct Seder', 'Remove chametz']
    });

    // Shavut (6th day of Sivan)
    feasts.push({
      name: 'Shavut',
      nameHebrew: 'שבועות',
      description: 'Feast of Weeks/Pentecost',
      startDate: new Date(year, 4, 25), // Approximation
      type: 'major',
      commandments: ['Study Torah all night', 'Eat dairy foods', 'Bring first fruits']
    });

    // Chanukah (25th day of Kislev)
    feasts.push({
      name: 'Chanukah',
      nameHebrew: 'חנוכה',
      description: 'Festival of Lights',
      startDate: new Date(year, 11, 10), // Approximation
      endDate: new Date(year, 11, 17),
      type: 'minor',
      commandments: ['Light the menorah', 'Give gifts', 'Eat fried foods']
    });

    // Purim (14th day of Adar)
    feasts.push({
      name: 'Purim',
      nameHebrew: 'פורים',
      description: 'Festival of Lots',
      startDate: new Date(year, 2, 14), // Approximation
      type: 'minor',
      commandments: ['Read Megillah', 'Give to charity', 'Send food gifts', 'Have a feast']
    });

    return feasts.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }
}