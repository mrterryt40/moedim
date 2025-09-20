import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService]
})
export class MarketplaceModule {}
