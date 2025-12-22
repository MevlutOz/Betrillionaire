import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // --- MAÇ BİTİNCE TETİKLENEN FONKSİYON ---
  async processMatchResults(matchId: number) {
    console.log(`🎫 Maç ID: ${matchId} için kuponlar taranıyor...`);

    const affectedCoupons = await this.prisma.coupon.findMany({
      where: {
        status: 'PENDING',
        bets: {
          some: { match_id: matchId }
        }
      }
    });

    console.log(`🎫 ${affectedCoupons.length} adet etkilenen kupon bulundu.`);

    for (const coupon of affectedCoupons) {
      await this.evaluateCoupon(coupon.coupon_id);
    }
  }

  // --- KUPON OLUŞTURMA (Create) ---
  async create(createCouponDto: any) {
    // 1. Gelen veriyi destructure et
    const { userId, stake, bets } = createCouponDto;

    // 2. Basit Validasyonlar
    if (!userId) {
      throw new BadRequestException('userId zorunlu (Frontend veriyi göndermiyor)');
    }
    if (!stake || stake <= 0) {
      throw new BadRequestException('Geçersiz bahis tutarı');
    }
    if (!bets || bets.length === 0) {
      throw new BadRequestException('Kuponda hiç maç yok');
    }

    try {
      // 3. Transaction Başlat
      return await this.prisma.$transaction(async (tx) => {
        
        // Kullanıcıyı bul
        const user = await tx.user.findUnique({
          where: { user_id: userId } // Prisma modelindeki alan adı (genelde user_id)
        });

        if (!user) throw new BadRequestException('Kullanıcı bulunamadı');

        // Decimal dönüşümleri (Finansal işlemler için şart)
        const stakeDecimal = new Prisma.Decimal(stake);

        // Bakiye Kontrolü
        if (new Prisma.Decimal(user.balance).lessThan(stakeDecimal)) {
          throw new BadRequestException(`Yetersiz bakiye! Mevcut: ${user.balance}, İstenen: ${stake}`);
        }

        // Toplam Oran Hesaplama
        let totalOdds = new Prisma.Decimal(1);
        for (const bet of bets) {
          totalOdds = totalOdds.mul(new Prisma.Decimal(bet.odd_value));
        }

        // Olası Kazanç
        const potentialWin = stakeDecimal.mul(totalOdds);

        // A. Kullanıcı Bakiyesini Düş
        await tx.user.update({
          where: { user_id: userId },
          data: {
            balance: { decrement: stakeDecimal }
          }
        });

        // B. İşlem Geçmişi (Transaction Log) Oluştur
        await tx.transaction.create({
          data: {
            user_id: userId,
            amount: stakeDecimal,
            type: 'BET_STAKE'
          }
        });

        // C. Kuponu ve Bahisleri Oluştur
        const newCoupon = await tx.coupon.create({
          data: {
            user_id: userId,
            stake: stakeDecimal,
            total_odds: totalOdds,
            potential_win: potentialWin,
            status: 'PENDING',
            bets: {
              create: bets.map((bet: any) => ({
                match_id: Number(bet.match_id), // String gelme ihtimaline karşı Number()
                bet_type: bet.bet_type,
                odd_value: new Prisma.Decimal(bet.odd_value),
                selected_option: bet.selected_option,
                status: 'PENDING'
              }))
            }
          },
          include: { bets: true }
        });

        return newCoupon;
      });

    } catch (err) {
      console.error('❌ Kupon Oluşturma Hatası:', err);
      // Eğer hata bizim attığımız BadRequest ise aynen fırlat
      if (err instanceof BadRequestException) {
        throw err;
      }
      // Değilse genel hata fırlat
      throw new InternalServerErrorException('Kupon oluşturulurken sunucu hatası: ' + err.message);
    }
  }

  // --- KULLANICI KUPONLARI ---
  async findAllByUser(userId: number) {
    return this.prisma.coupon.findMany({
      where: { user_id: userId },
      include: { 
        bets: { 
          include: { 
            match: { 
              include: { homeTeam: true, awayTeam: true } 
            } 
          } 
        } 
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // --- KUPON DEĞERLENDİRME ---
  async evaluateCoupon(couponId: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { coupon_id: couponId },
      include: { bets: { include: { match: true } } }
    });

    if (!coupon || coupon.status !== 'PENDING') return;

    let allWon = true;
    let anyLost = false;

    await this.prisma.$transaction(async (tx) => {
      
      for (const bet of coupon.bets) {
        const match = bet.match;
        
        if (match.status !== 'FINISHED') {
          allWon = false; 
          continue; 
        }

        const isBetWon = this.checkBetResult(
            bet.bet_type, 
            Number(match.home_score ?? 0), 
            Number(match.away_score ?? 0),
            Number(match.ht_home_score ?? 0), 
            Number(match.ht_away_score ?? 0)  
        );
        
        if (bet.status === 'PENDING') {
            await tx.bet.update({
                where: { bet_id: bet.bet_id },
                data: { status: isBetWon ? 'WON' : 'LOST' }
            });
        }

        if (!isBetWon) {
          anyLost = true;
        }
      }

      if (anyLost) {
        await tx.coupon.update({
          where: { coupon_id: couponId },
          data: { status: 'LOST' }
        });
        console.log(`❌ Kupon ID ${couponId} KAYBETTİ.`);

      } else if (allWon) {
        await tx.coupon.update({
          where: { coupon_id: couponId },
          data: { status: 'WON' }
        });

        await tx.user.update({
          where: { user_id: coupon.user_id },
          data: { balance: { increment: coupon.potential_win } }
        });

        await tx.transaction.create({
          data: {
            user_id: coupon.user_id,
            amount: coupon.potential_win,
            type: 'WIN_PAYOUT'
          }
        });
        console.log(`✅ Kupon ID ${couponId} KAZANDI! Ödeme yapıldı.`);
      }
    });
  }

  // --- BAHİS MANTIĞI ---
  private checkBetResult(
      betType: string, 
      home: number, 
      away: number, 
      htHome: number, 
      htAway: number
  ): boolean {
    const totalGoals = home + away;

    if (betType === 'Mac Sonucu 1') return home > away;
    if (betType === 'Mac Sonucu X') return home === away;
    if (betType === 'Mac Sonucu 2') return away > home;

    if (betType === 'IY 1') return htHome > htAway;
    if (betType === 'IY X') return htHome === htAway;
    if (betType === 'IY 2') return htAway > htHome;
    
    if (betType === 'Alt 2.5') return totalGoals < 2.5;
    if (betType === 'Ust 2.5') return totalGoals > 2.5;

    if (betType === 'KG Var') return home > 0 && away > 0;
    if (betType === 'KG Yok') return home === 0 || away === 0;

    return false;
  }
}