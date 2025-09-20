import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TorahModule } from './torah/torah.module';
import { HebrewModule } from './hebrew/hebrew.module';
import { CalendarModule } from './calendar/calendar.module';
import { CommandmentsModule } from './commandments/commandments.module';
import { CommunityModule } from './community/community.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { NumbersModule } from './numbers/numbers.module';

@Module({
  imports: [AuthModule, UsersModule, TorahModule, HebrewModule, CalendarModule, CommandmentsModule, CommunityModule, MarketplaceModule, BlockchainModule, NumbersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
