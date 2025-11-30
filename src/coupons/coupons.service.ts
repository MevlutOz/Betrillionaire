import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: any) {
    const { userId, stake, bets } = createCouponDto;

    // PRISMA TRANSACTION (Atomicity)
    // Tüm işlemler tek bir paket halinde yapılır. Hata olursa hepsi geri alınır (Rollback).
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Kullanıcının güncel bakiyesini kitle ve oku
      const user = await tx.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) throw new BadRequestException('Kullanıcı bulunamadı');
      
      // Bakiye Yeterli mi?
      if (user.balance.toNumber() < stake) {
        throw new BadRequestException('Yetersiz Bakiye!');
      }

      // 2. Toplam Oranı Hesapla (Güvenlik için backend'de tekrar hesaplanır)
      // Şimdilik Frontend'den gelen oranı kabul ediyoruz ama normalde DB'den çekilmeli.
      let totalOdds = 1.0;
      bets.forEach(b => { totalOdds *= b.odd_value });

      const potentialWin = stake * totalOdds;

      // 3. Bakiyeyi Düş (Update Balance)
      await tx.user.update({
        where: { user_id: userId },
        data: { balance: { decrement: stake } }, // Atomic Decrement
      });

      // 4. Finansal Kayıt At (Transaction Table)
      await tx.transaction.create({
        data: {
          user_id: userId,
          amount: stake,
          type: 'BET_STAKE', // Enum: Kupon Ücreti
        },
      });

      // 5. Kuponu ve İçindeki Bahisleri Oluştur
      const newCoupon = await tx.coupon.create({
        data: {
          user_id: userId,
          stake: stake,
          total_odds: totalOdds,
          potential_win: potentialWin,
          status: 'PENDING',
          bets: {
            create: bets.map((bet) => ({
              match_id: bet.match_id,
              bet_type: bet.bet_type,
              odd_value: bet.odd_value,
              selected_option: bet.selected_option,
            })),
          },
        },
        include: { bets: true } // Geriye oluşturulan bahisleri de dön
      });

      return newCoupon;
    });
  }

  // Kullanıcının kuponlarını getir (Geçmiş)
  async findAllByUser(userId: number) {
    return this.prisma.coupon.findMany({
      where: { user_id: userId },
      include: { bets: { include: { match: { include: { homeTeam: true, awayTeam: true } } } } },
      orderBy: { created_at: 'desc' }
    });
  }

  // ... (mevcut kodlar) ...

  // KUPON DEĞERLENDİRME (Algorithm)
  async evaluateCoupon(couponId: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { coupon_id: couponId },
      include: { bets: { include: { match: true } } }
    });

    if (!coupon || coupon.status !== 'PENDING') return;

    let allWon = true;
    let anyLost = false;

    // Kupondaki her bahsi kontrol et
    for (const bet of coupon.bets) {
      const match = bet.match;

      // Eğer maç hala oynanmadıysa, kupon sonuçlanamaz
      if (match.status !== 'FINISHED') {
        allWon = false; 
        continue;
      }

      // Bahis kazandı mı?
      const isBetWon = this.checkBetResult(bet.bet_type, match.home_score ?? 0, match.away_score ?? 0);
      
      if (!isBetWon) {
        anyLost = true; // Tek maçtan yatmak
        break; // Döngüyü kır, daha bakmaya gerek yok
      }
    }

    // SONUÇLANDIRMA
    if (anyLost) {
      // KAYBETTİ
      await this.prisma.coupon.update({
        where: { coupon_id: couponId },
        data: { status: 'LOST' }
      });
    } else if (allWon) {
      // KAZANDI (Tüm maçlar bitmiş ve hepsi tutmuş)
      // Transaction başlat: Statüyü güncelle VE parayı yatır
      await this.prisma.$transaction(async (tx) => {
        await tx.coupon.update({
          where: { coupon_id: couponId },
          data: { status: 'WON' }
        });

        // Kullanıcıya ödeme yap
        await tx.user.update({
          where: { user_id: coupon.user_id },
          data: { balance: { increment: coupon.potential_win } }
        });

        // Log at
        await tx.transaction.create({
          data: {
            user_id: coupon.user_id,
            amount: coupon.potential_win,
            type: 'WIN_PAYOUT'
          }
        });
      });
    }
  }

  // Yardımcı Fonksiyon: Skor kontrolü
  private checkBetResult(betType: string, home: number, away: number): boolean {
    if (betType === 'Mac Sonucu 1') return home > away;
    if (betType === 'Mac Sonucu X') return home === away;
    if (betType === 'Mac Sonucu 2') return away > home;
    // Diğer bahis türleri buraya eklenebilir (Alt/Üst vs.)
    return false;
  }
}