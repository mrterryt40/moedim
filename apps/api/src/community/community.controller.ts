import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CommunityService, CircleWithStats } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

interface CreateCircleDto {
  name: string;
  description?: string;
  maxMembers?: number;
  isPrivate?: boolean;
}

interface SendMessageDto {
  content: string;
  messageType?: 'text' | 'image' | 'audio';
}

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('circles')
  async getUserCircles(@GetUser() user: any): Promise<CircleWithStats[]> {
    return this.communityService.getUserCircles(user.id);
  }

  @Post('circles')
  async createCircle(
    @GetUser() user: any,
    @Body() createCircleDto: CreateCircleDto
  ) {
    return this.communityService.createCircle(user.id, createCircleDto);
  }

  @Post('circles/:id/join')
  async joinCircle(
    @GetUser() user: any,
    @Param('id') circleId: string
  ) {
    await this.communityService.joinCircle(user.id, circleId);
    return { message: 'Successfully joined circle' };
  }

  @Delete('circles/:id/leave')
  async leaveCircle(
    @GetUser() user: any,
    @Param('id') circleId: string
  ) {
    await this.communityService.leaveCircle(user.id, circleId);
    return { message: 'Successfully left circle' };
  }

  @Get('circles/:id/messages')
  async getCircleMessages(
    @GetUser() user: any,
    @Param('id') circleId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 50;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new Error('Invalid pagination parameters');
    }

    return this.communityService.getCircleMessages(circleId, user.id, pageNum, limitNum);
  }

  @Post('circles/:id/messages')
  async sendMessage(
    @GetUser() user: any,
    @Param('id') circleId: string,
    @Body() messageDto: SendMessageDto
  ) {
    return this.communityService.sendMessage(user.id, circleId, messageDto);
  }

  @Get('circles/:id/members')
  async getCircleMembers(
    @GetUser() user: any,
    @Param('id') circleId: string
  ) {
    return this.communityService.getCircleMembers(circleId, user.id);
  }

  @Put('circles/:id')
  async updateCircle(
    @GetUser() user: any,
    @Param('id') circleId: string,
    @Body() updateData: Partial<CreateCircleDto>
  ) {
    return this.communityService.updateCircle(user.id, circleId, updateData);
  }

  @Post('circles/:id/promote')
  async promoteUser(
    @GetUser() user: any,
    @Param('id') circleId: string,
    @Body() body: { targetUserId: string; newRole: 'admin' | 'moderator' | 'member' }
  ) {
    const { targetUserId, newRole } = body;

    if (!targetUserId || !newRole) {
      throw new Error('Target user ID and new role are required');
    }

    if (!['admin', 'moderator', 'member'].includes(newRole)) {
      throw new Error('Invalid role. Must be admin, moderator, or member');
    }

    return this.communityService.promoteUser(user.id, circleId, targetUserId, newRole);
  }

  @Get('search')
  async searchCircles(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (!query) {
      throw new Error('Search query is required');
    }

    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      throw new Error('Invalid pagination parameters');
    }

    return this.communityService.searchCircles(query, pageNum, limitNum);
  }

  @Get('popular')
  async getPopularCircles() {
    // Get popular public circles
    return this.communityService.searchCircles('', 1, 10);
  }

  @Get('circles/:id/info')
  async getCircleInfo(
    @GetUser() user: any,
    @Param('id') circleId: string
  ) {
    const members = await this.communityService.getCircleMembers(circleId, user.id);
    const recentMessages = await this.communityService.getCircleMessages(circleId, user.id, 1, 5);

    return {
      members,
      recentActivity: recentMessages.messages,
      stats: {
        totalMembers: members.length,
        onlineMembers: members.filter(m => m.isOnline).length,
        totalMessages: recentMessages.pagination.total
      }
    };
  }

  @Get('my-activity')
  async getMyActivity(@GetUser() user: any): Promise<{
    totalCircles: number;
    activeCircles: number;
    totalUnread: number;
    recentCircles: CircleWithStats[];
    achievements: {
      socialButterfly: boolean;
      communityBuilder: boolean;
      activeParticipant: boolean;
    };
  }> {
    // Get user's recent activity across all circles
    const circles = await this.communityService.getUserCircles(user.id);

    // Calculate activity metrics
    const totalUnread = circles.reduce((sum, circle) => sum + circle.unreadCount, 0);
    const activeCircles = circles.filter(circle => circle.unreadCount > 0).length;
    const totalCircles = circles.length;

    return {
      totalCircles,
      activeCircles,
      totalUnread,
      recentCircles: circles.slice(0, 5),
      achievements: {
        socialButterfly: totalCircles >= 5,
        communityBuilder: circles.filter(c => c.userRole === 'admin').length >= 2,
        activeParticipant: totalUnread < 10 && totalCircles > 0
      }
    };
  }

  @Get('circle-suggestions')
  async getCircleSuggestions(@GetUser() user: any) {
    // Suggest circles based on user's interests and activity
    const userCircles = await this.communityService.getUserCircles(user.id);
    const userCircleIds = userCircles.map(c => c.id);

    // For now, return popular circles the user isn't in
    const suggestions = await this.communityService.searchCircles('', 1, 10);

    return {
      suggested: suggestions.circles.filter(circle => !userCircleIds.includes(circle.id)),
      reasons: [
        'Popular in your area',
        'Based on your study interests',
        'Members with similar goals',
        'Active community'
      ]
    };
  }
}