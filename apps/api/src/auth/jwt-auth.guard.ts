import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private prisma = new PrismaClient();
  private jwtService = new JwtService({ secret: process.env.JWT_SECRET || 'moedim-secret' });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7);

      // Verify and decode token
      const payload = this.jwtService.verify(token);

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub || payload.userId },
        select: {
          id: true,
          email: true,
          username: true,
          walletAddress: true,
          hebrewLevel: true,
          streakDays: true,
          totalCoins: true,
          timezone: true,
          lastActiveAt: true
        }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Update last active time
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() }
      });

      // Attach user to request
      request.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}