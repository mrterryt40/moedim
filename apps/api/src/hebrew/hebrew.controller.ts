import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { HebrewService, ReviewCard } from './hebrew.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('hebrew')
@UseGuards(JwtAuthGuard)
export class HebrewController {
  constructor(private readonly hebrewService: HebrewService) {}

  @Get('review-cards')
  async getReviewCards(
    @GetUser() user: any,
    @Query('limit') limit?: string
  ): Promise<ReviewCard[]> {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.hebrewService.getReviewCards(user.id, limitNum);
  }

  @Post('review')
  async submitReview(
    @GetUser() user: any,
    @Body() body: { cardId: string; quality: number }
  ) {
    const { cardId, quality } = body;
    const result = await this.hebrewService.submitReview(user.id, cardId, quality);

    // Update streak after review
    const newStreak = await this.hebrewService.updateUserStreak(user.id);

    return {
      ...result,
      newStreak
    };
  }

  @Get('new-cards')
  async getNewCards(
    @GetUser() user: any,
    @Query('limit') limit?: string
  ): Promise<ReviewCard[]> {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.hebrewService.getNewCards(user.id, limitNum);
  }

  @Get('stats')
  async getStudyStats(@GetUser() user: any) {
    return this.hebrewService.getStudyStats(user.id);
  }

  @Get('cards')
  async getAllCards(@Query('category') category?: string) {
    return this.hebrewService.getAllCards(category);
  }

  @Post('cards')
  async createCard(@Body() cardData: {
    wordHebrew: string;
    wordEnglish: string;
    transliteration: string;
    difficultyLevel: number;
    category: string;
    gematriaValue?: number;
    audioUrl?: string;
  }) {
    return this.hebrewService.createCard(cardData);
  }

  @Get('categories')
  async getCategories() {
    // Return available Hebrew learning categories
    return [
      { id: 'vocabulary', name: 'Vocabulary', description: 'Basic Hebrew words' },
      { id: 'biblical', name: 'Biblical Terms', description: 'Words from Torah and Tanakh' },
      { id: 'modern', name: 'Modern Hebrew', description: 'Contemporary vocabulary' },
      { id: 'prayers', name: 'Prayer Vocabulary', description: 'Words used in Israelite prayers' },
      { id: 'holidays', name: 'Holiday Terms', description: 'Festival and holiday vocabulary' },
      { id: 'family', name: 'Family Terms', description: 'Family relationship words' },
      { id: 'numbers', name: 'Numbers', description: 'Hebrew numerals and counting' },
      { id: 'colors', name: 'Colors', description: 'Color vocabulary' },
      { id: 'time', name: 'Time', description: 'Days, months, seasons' },
      { id: 'food', name: 'Food & Kosher', description: 'Food-related vocabulary' }
    ];
  }
}
