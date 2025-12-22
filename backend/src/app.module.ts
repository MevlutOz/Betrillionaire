import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MatchesModule } from './matches/matches.module';
import { CouponsModule } from './coupons/coupons.module';
import { SyncModule } from './sync/sync.module';
import { PrismaModule } from './prisma/prisma.module';
import { LeaguesModule } from './leagues/leagues.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersController } from './users.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   
    }),
    
    AuthModule,
    MatchesModule,
    CouponsModule,
    TransactionsModule,
    SyncModule,
    PrismaModule,
    LeaguesModule,
    
  ],
  controllers: [
    AppController, 
    UsersController
  ],
  providers: [AppService],
})
export class AppModule {}