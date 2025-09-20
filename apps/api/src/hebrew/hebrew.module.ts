import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HebrewController } from './hebrew.controller';
import { HebrewService } from './hebrew.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'srs',
    }),
    BlockchainModule,
  ],
  controllers: [HebrewController],
  providers: [HebrewService],
  exports: [HebrewService]
})
export class HebrewModule {}
