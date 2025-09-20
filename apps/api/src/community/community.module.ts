import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { CommunityGateway } from './community.gateway';

@Module({
  providers: [CommunityService, CommunityGateway],
  controllers: [CommunityController],
  exports: [CommunityService]
})
export class CommunityModule {}
