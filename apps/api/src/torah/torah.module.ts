import { Module } from '@nestjs/common';
import { TorahController } from './torah.controller';
import { TorahService } from './torah.service';

@Module({
  controllers: [TorahController],
  providers: [TorahService]
})
export class TorahModule {}
