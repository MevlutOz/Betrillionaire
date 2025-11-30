import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsModule } from '../coupons/coupons.module'; // EKLE

@Module({
  imports: [PrismaModule, CouponsModule], // CouponsModule'ü buraya ekle
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}