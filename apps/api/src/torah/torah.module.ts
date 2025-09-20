import { Module } from '@nestjs/common';
import { TorahController } from './torah.controller';
import { TorahService } from './torah.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  controllers: [TorahController],
  providers: [TorahService]
})
export class TorahModule {}
