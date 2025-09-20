import { Module } from '@nestjs/common';
import { HebrewController } from './hebrew.controller';
import { HebrewService } from './hebrew.service';

@Module({
  controllers: [HebrewController],
  providers: [HebrewService]
})
export class HebrewModule {}
