import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service'; // Import et

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService 
  ) {}

  // 1. Tüm Maçları Getir (Bülten)
  async findAll() {
    return this.prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        odds: true,
      },
      orderBy: {
        match_date: 'asc',
      },
    });
  }

  // 2. Tek Bir Maçın Detayını Getir (ID ile)
  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { match_id: id },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
        odds: true,
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  // 3. MAÇI MANUEL BİTİR (SETTLEMENT TRIGGER)
  async finishMatch(matchId: number, homeScore: number, awayScore: number) {
    // A. Maçı Güncelle (Skor ve Statü)
    const match = await this.prisma.match.update({
      where: { match_id: matchId },
      data: {
        status: 'FINISHED',
        home_score: homeScore,
        away_score: awayScore
      }
    });

    console.log(`Maç #${matchId} bitti: ${homeScore}-${awayScore}. Kuponlar taranıyor...`);

    // --- EKSİK OLAN KISIM BURASIYDI ---
    
    // B. Bu maçı içeren ve hala "PENDING" olan kuponları bul
    const pendingCoupons = await this.prisma.coupon.findMany({
      where: {
        status: 'PENDING',
        bets: {
          some: { match_id: matchId } // İçinde bu maç olan kuponlar
        }
      }
    });

    console.log(`${pendingCoupons.length} adet kupon yeniden değerlendirilecek.`);

    // C. Her kuponu tek tek hesapla (Evaluate)
    for (const coupon of pendingCoupons) {
      await this.couponsService.evaluateCoupon(coupon.coupon_id);
    }

    return { 
      message: `Maç güncellendi. ${pendingCoupons.length} kupon değerlendirmeye alındı.`,
      match 
    };
  }
}