import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}
  
  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Frontend'in beklediği formatta (String olarak) bakiye dönüyoruz
    return {
      userId: user.user_id,
      name: user.name, 
      balance: user.balance.toString()
    };
  }
  // 1. PARA YATIRMA (DEPOSIT)
  async deposit(userId: number, amount: number) {
  if (amount <= 0) {
    throw new BadRequestException('Miktar 0 dan büyük olmalı');
  }

  return this.prisma.$transaction(async (tx) => {
    // 1️⃣ Bakiyeyi artır + UPDATED USER'I AL
    const updatedUser = await tx.user.update({
      where: { user_id: userId },
      data: {
        balance: { increment: amount },
      },
    });

    // 2️⃣ Transaction logu at (sadece kayıt amaçlı)
    await tx.transaction.create({
      data: {
        user_id: userId,
        amount,
        type: TransactionType.DEPOSIT,
      },
    });

    // 3️⃣ FRONTEND'E USER DÖN
    return updatedUser;
  });
  }


  // 2. PARA ÇEKME (WITHDRAW)
  async withdraw(userId: number, amount: number) {
    if (amount <= 0) throw new BadRequestException('Miktar 0 dan büyük olmalı');

    return this.prisma.$transaction(async (tx) => {
      // Önce bakiyeyi kontrol et (Race Condition önlemi)
      const user = await tx.user.findUnique({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException('Kullanıcı bulunamadı');
      }
      if (user.balance.toNumber() < amount) {
        throw new BadRequestException('Yetersiz Bakiye');
      }

      // Bakiyeyi Düş
      await tx.user.update({
        where: { user_id: userId },
        data: { balance: { decrement: amount } },
      });

      // Kayıt At
      return await tx.transaction.create({
        data: {
          user_id: userId,
          amount: amount,
          type: TransactionType.WITHDRAW,
        },
      });
    });
  }

  // 3. GEÇMİŞİ GETİR (History)
  async findAllByUser(userId: number) {
    return this.prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }, 
    });
  }
}