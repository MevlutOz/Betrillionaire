import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MatchesModule } from './matches/matches.module';
import { CouponsModule } from './coupons/coupons.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [AuthModule, PrismaModule, MatchesModule, CouponsModule, TransactionsModule, SyncModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
