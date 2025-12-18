import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsModule } from '../coupons/coupons.module';
import { AuthModule } from '../auth/auth.module'; // EKLE

@Module({
  imports: [
    PrismaModule, 
    CouponsModule, 
    AuthModule // BURAYA EKLE (Artık JwtService'i tanıyacak)
  ], 
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}