import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- BU VAR MI?
import { AuthModule } from './auth/auth.module';
import { MatchesModule } from './matches/matches.module';
import { CouponsModule } from './coupons/coupons.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SyncModule } from './sync/sync.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 1. BU KISIM ÇOK ÖNEMLİ (ENV Dosyasını Yükler)
    ConfigModule.forRoot({
      isGlobal: true,    // Her yerden erişilsin
      envFilePath: '.env', // Dosya yolunu zorla göster
    }),
    
    AuthModule,
    MatchesModule,
    CouponsModule,
    TransactionsModule,
    SyncModule,
    PrismaModule,
  ],
})
export class AppModule {}