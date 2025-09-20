import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityGateway } from './community.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'moedim-secret',
      signOptions: { expiresIn: '24h' },
    })
  ],
  providers: [CommunityService, CommunityGateway],
  controllers: [CommunityController],
  exports: [CommunityService]
})
export class CommunityModule {}
