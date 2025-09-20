import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

interface CircleWithStats {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  isPrivate: boolean;
  createdAt: Date;
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    content: string;
    createdAt: Date;
    username: string;
  };
  userRole: string;
}

@Injectable()
export class CommunityService {
  private prisma = new PrismaClient();
  private gateway: any; // Will be injected after module initialization

  setGateway(gateway: any) {
    this.gateway = gateway;
  }

  async getUserCircles(userId: string): Promise<CircleWithStats[]> {
    const memberships = await this.prisma.circleMembership.findMany({
      where: { userId },
      include: {
        circle: {
          include: {
            members: {
              select: { id: true }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                user: {
                  select: { username: true }
                }
              }
            }
          }
        }
      }
    });

    const circles: CircleWithStats[] = [];

    for (const membership of memberships) {
      const circle = membership.circle;
      const lastMessage = circle.messages[0];

      // Count unread messages
      const unreadCount = await this.prisma.message.count({
        where: {
          circleId: circle.id,
          createdAt: {
            gt: membership.joinedAt
          },
          userId: {
            not: userId
          }
        }
      });

      circles.push({
        id: circle.id,
        name: circle.name,
        description: circle.description,
        maxMembers: circle.maxMembers,
        isPrivate: circle.isPrivate,
        createdAt: circle.createdAt,
        memberCount: circle.members.length,
        unreadCount,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          username: lastMessage.user.username
        } : undefined,
        userRole: membership.role
      });
    }

    return circles.sort((a, b) => {
      // Sort by last activity
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return bTime.getTime() - aTime.getTime();
    });
  }

  async createCircle(userId: string, createCircleDto: CreateCircleDto) {
    const { name, description, maxMembers = 10, isPrivate = false } = createCircleDto;

    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Circle name is required');
    }

    if (name.length > 50) {
      throw new BadRequestException('Circle name must be 50 characters or less');
    }

    if (maxMembers < 2 || maxMembers > 100) {
      throw new BadRequestException('Max members must be between 2 and 100');
    }

    // Check if user already has too many circles (limit to prevent spam)
    const userCircleCount = await this.prisma.circleMembership.count({
      where: {
        userId,
        role: 'admin'
      }
    });

    if (userCircleCount >= 5) {
      throw new BadRequestException('You can only create up to 5 circles');
    }

    // Create circle and add creator as admin
    const circle = await this.prisma.$transaction(async (prisma) => {
      const newCircle = await prisma.circle.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          maxMembers,
          isPrivate,
          createdBy: userId
        }
      });

      // Add creator as admin
      await prisma.circleMembership.create({
        data: {
          circleId: newCircle.id,
          userId,
          role: 'admin'
        }
      });

      return newCircle;
    });

    return {
      ...circle,
      memberCount: 1,
      unreadCount: 0,
      userRole: 'admin'
    };
  }

  async joinCircle(userId: string, circleId: string): Promise<void> {
    const circle = await this.prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        members: {
          select: { userId: true }
        }
      }
    });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    if (existingMembership) {
      throw new BadRequestException('You are already a member of this circle');
    }

    // Check if circle is full
    if (circle.members.length >= circle.maxMembers) {
      throw new BadRequestException('Circle is full');
    }

    // For private circles, check if user has been invited (implement invitation system later)
    if (circle.isPrivate) {
      throw new ForbiddenException('This circle is private. You need an invitation to join.');
    }

    // Add user to circle
    await this.prisma.circleMembership.create({
      data: {
        circleId,
        userId,
        role: 'member'
      }
    });

    // Send welcome message
    await this.prisma.message.create({
      data: {
        circleId,
        userId,
        content: 'joined the circle',
        messageType: 'system'
      }
    });

    // Notify circle members via WebSocket
    if (this.gateway) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, hebrewLevel: true }
      });

      this.gateway.notifyCircleMembers(circleId, 'member-joined', {
        id: userId,
        username: user?.username,
        hebrewLevel: user?.hebrewLevel,
        role: 'member'
      });
    }
  }

  async leaveCircle(userId: string, circleId: string): Promise<void> {
    const membership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this circle');
    }

    // If user is the only admin, prevent leaving unless there are no other members
    if (membership.role === 'admin') {
      const otherAdmins = await this.prisma.circleMembership.count({
        where: {
          circleId,
          role: 'admin',
          userId: { not: userId }
        }
      });

      const totalMembers = await this.prisma.circleMembership.count({
        where: { circleId }
      });

      if (otherAdmins === 0 && totalMembers > 1) {
        throw new BadRequestException('Cannot leave circle. You are the only admin. Promote another member to admin first.');
      }
    }

    // Remove membership
    await this.prisma.circleMembership.delete({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    // Add leave message
    await this.prisma.message.create({
      data: {
        circleId,
        userId,
        content: 'left the circle',
        messageType: 'system'
      }
    });

    // Notify circle members via WebSocket
    if (this.gateway) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      });

      this.gateway.notifyCircleMembers(circleId, 'member-left', {
        id: userId,
        username: user?.username
      });
    }
  }

  async getCircleMessages(circleId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify user is a member
    const membership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this circle');
    }

    const offset = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: { circleId },
      include: {
        user: {
          select: {
            username: true,
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const total = await this.prisma.message.count({
      where: { circleId }
    });

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async sendMessage(userId: string, circleId: string, messageDto: SendMessageDto) {
    const { content, messageType = 'text' } = messageDto;

    // Verify user is a member
    const membership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this circle');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Message content is required');
    }

    if (content.length > 1000) {
      throw new BadRequestException('Message is too long (max 1000 characters)');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        circleId,
        userId,
        content: content.trim(),
        messageType
      },
      include: {
        user: {
          select: {
            username: true,
            id: true
          }
        }
      }
    });

    return message;
  }

  async getCircleMembers(circleId: string, userId: string) {
    // Verify user is a member
    const membership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this circle');
    }

    const members = await this.prisma.circleMembership.findMany({
      where: { circleId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            hebrewLevel: true,
            streakDays: true,
            lastActiveAt: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    });

    return members.map(member => ({
      id: member.user.id,
      username: member.user.username,
      hebrewLevel: member.user.hebrewLevel,
      streakDays: member.user.streakDays,
      role: member.role,
      joinedAt: member.joinedAt,
      isOnline: this.isUserOnline(member.user.lastActiveAt)
    }));
  }

  async updateCircle(userId: string, circleId: string, updateData: Partial<CreateCircleDto>) {
    // Verify user is an admin
    const membership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId }
      }
    });

    if (!membership || membership.role !== 'admin') {
      throw new ForbiddenException('Only circle admins can update circle settings');
    }

    const { name, description, maxMembers, isPrivate } = updateData;

    return this.prisma.circle.update({
      where: { id: circleId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(maxMembers && { maxMembers }),
        ...(isPrivate !== undefined && { isPrivate })
      }
    });
  }

  async promoteUser(adminUserId: string, circleId: string, targetUserId: string, newRole: 'admin' | 'moderator' | 'member') {
    // Verify admin permissions
    const adminMembership = await this.prisma.circleMembership.findUnique({
      where: {
        circleId_userId: { circleId, userId: adminUserId }
      }
    });

    if (!adminMembership || adminMembership.role !== 'admin') {
      throw new ForbiddenException('Only circle admins can change member roles');
    }

    // Update target user role
    const updatedMembership = await this.prisma.circleMembership.update({
      where: {
        circleId_userId: { circleId, userId: targetUserId }
      },
      data: { role: newRole }
    });

    // Add system message
    await this.prisma.message.create({
      data: {
        circleId,
        userId: adminUserId,
        content: `promoted a member to ${newRole}`,
        messageType: 'system'
      }
    });

    return updatedMembership;
  }

  async searchCircles(query: string, page: number = 1, limit: number = 20) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const offset = (page - 1) * limit;

    const circles = await this.prisma.circle.findMany({
      where: {
        AND: [
          { isPrivate: false }, // Only show public circles
          {
            OR: [
              { name: { contains: query.trim(), mode: 'insensitive' } },
              { description: { contains: query.trim(), mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        members: {
          select: { id: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const total = await this.prisma.circle.count({
      where: {
        AND: [
          { isPrivate: false },
          {
            OR: [
              { name: { contains: query.trim(), mode: 'insensitive' } },
              { description: { contains: query.trim(), mode: 'insensitive' } }
            ]
          }
        ]
      }
    });

    return {
      circles: circles.map(circle => ({
        id: circle.id,
        name: circle.name,
        description: circle.description,
        memberCount: circle.members.length,
        maxMembers: circle.maxMembers,
        messageCount: circle._count.messages,
        createdAt: circle.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private isUserOnline(lastActiveAt: Date): boolean {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    return lastActiveAt > fiveMinutesAgo;
  }
}