import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('current')
  async getCurrentHebrewDate() {
    return this.calendarService.getCurrentHebrewDate();
  }

  @Get('hebrew-date')
  async getHebrewDate(@Query('date') date: string) {
    const gregorianDate = date ? new Date(date) : new Date();
    return this.calendarService.getHebrewDate(gregorianDate);
  }

  @Get('sabbath-times')
  async getSabbathTimes(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('date') date?: string
  ) {
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const targetDate = date ? new Date(date) : undefined;

    return this.calendarService.getSabbathTimes(lat, lon, targetDate);
  }

  @Get('upcoming-feasts')
  async getUpcomingFeasts(@Query('count') count?: string) {
    const countNum = count ? parseInt(count) : 5;
    return this.calendarService.getUpcomingFeasts(countNum);
  }

  @Get('feasts/:year')
  async getFeastsForYear(@Param('year') year: string) {
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      throw new Error('Invalid year provided');
    }
    return this.calendarService.getFeastsForYear(yearNum);
  }

  @Get('is-sabbath')
  async isSabbath(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    const isSabbath = await this.calendarService.isSabbath(targetDate);
    return { isSabbath, date: targetDate || new Date() };
  }

  @Get('is-new-moon')
  async isNewMoon(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : undefined;
    const isNewMoon = await this.calendarService.isNewMoon(targetDate);
    return { isNewMoon, date: targetDate || new Date() };
  }

  @Get('feast/:name')
  async getFeastByName(@Param('name') name: string) {
    return this.calendarService.getFeastByName(name);
  }

  @Post('save-hebrew-date')
  async saveHebrewDate(@Body() data: {
    hebrewDate: string;
    gregorianDate: string;
    isSabbath: boolean;
    isFeast: boolean;
    feastName?: string;
  }) {
    const gregorianDate = new Date(data.gregorianDate);
    return this.calendarService.saveHebrewDate(
      data.hebrewDate,
      gregorianDate,
      data.isSabbath,
      data.isFeast,
      data.feastName
    );
  }

  @Get('today-info')
  async getTodayInfo(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string
  ) {
    const today = new Date();
    const hebrewDate = await this.calendarService.getCurrentHebrewDate();
    const isSabbath = await this.calendarService.isSabbath();
    const isNewMoon = await this.calendarService.isNewMoon();
    const upcomingFeasts = await this.calendarService.getUpcomingFeasts(3);

    let sabbathTimes = null;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        sabbathTimes = await this.calendarService.getSabbathTimes(lat, lon);
      }
    }

    return {
      gregorianDate: today.toISOString().split('T')[0],
      hebrewDate,
      isSabbath,
      isNewMoon,
      upcomingFeasts,
      sabbathTimes
    };
  }

  @Get('month-view')
  async getMonthView(
    @Query('year') year?: string,
    @Query('month') month?: string
  ) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const monthData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth - 1, day);
      const hebrewDate = await this.calendarService.getHebrewDate(date);
      const isSabbath = await this.calendarService.isSabbath(date);
      const isNewMoon = await this.calendarService.isNewMoon(date);

      monthData.push({
        gregorianDate: date.toISOString().split('T')[0],
        day,
        hebrewDate,
        isSabbath,
        isNewMoon
      });
    }

    return {
      year: targetYear,
      month: targetMonth,
      days: monthData
    };
  }
}