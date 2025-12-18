import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsModule } from '../coupons/coupons.module';
import { AuthModule } from '../auth/auth.module'; // EKLE
import { PrismaService } from '../prisma/prisma.service'; 

@Module({
  imports: [
    PrismaModule, 
    CouponsModule, 
    AuthModule 
  ], 
  controllers: [MatchesController],
  providers: [MatchesService, PrismaService],
})
export class MatchesModule {}