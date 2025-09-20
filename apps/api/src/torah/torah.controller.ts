import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { TorahService } from './torah.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

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

  @UseGuards(JwtAuthGuard)
  @Get('progress/:portionId')
  async getPortionProgress(
    @GetUser() user: any,
    @Param('portionId') portionId: string
  ) {
    return this.torahService.getPortionProgress(user.id, portionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete/:portionId')
  async markPortionComplete(
    @GetUser() user: any,
    @Param('portionId') portionId: string,
    @Body() body: { notes?: string }
  ) {
    return this.torahService.markPortionComplete(user.id, portionId, body.notes);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getTorahStats(@GetUser() user: any) {
    return this.torahService.getTorahStats(user.id);
  }
}
