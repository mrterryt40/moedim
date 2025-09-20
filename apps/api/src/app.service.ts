import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return JSON.stringify({
      message: 'Mo\'edim API is running! 🏛️',
      version: '1.0.0',
      description: 'Israelite platform API with beautiful design system',
      endpoints: {
        torah: '/torah',
        calendar: '/calendar',
        hebrew: '/hebrew',
        community: '/community',
        marketplace: '/marketplace',
        auth: '/auth',
        users: '/users',
        wallet: '/wallet',
        numbers: '/numbers'
      },
      status: 'healthy',
      timestamp: new Date().toISOString()
    }, null, 2);
  }
}
