import { Controller, Get, Query, Param } from '@nestjs/common';
import { TorahService } from './torah.service';

@Controller('torah')
export class TorahController {
  constructor(private readonly torahService: TorahService) {}

  @Get('daily')
  async getDailyPortion(@Query('date') date?: string) {
    return this.torahService.getDailyPortion(date);
  }

  @Get('portions')
  async getAllPortions() {
    return this.torahService.getAllPortions();
  }

  @Get('portions/:id')
  async getPortionById(@Param('id') id: string) {
    return this.torahService.getPortionById(id);
  }

  @Get('calendar/current-week')
  async getCurrentWeekReading() {
    return this.torahService.getCurrentWeekReading();
  }

  @Get('search')
  async searchTorah(@Query('q') query: string, @Query('language') language: string = 'both') {
    return this.torahService.searchTorah(query, language);
  }
}
