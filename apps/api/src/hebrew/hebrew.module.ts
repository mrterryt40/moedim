import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HebrewController } from './hebrew.controller';
import { HebrewService } from './hebrew.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'srs',
    }),
  ],
  controllers: [HebrewController],
  providers: [HebrewService],
  exports: [HebrewService]
})
export class HebrewModule {}
