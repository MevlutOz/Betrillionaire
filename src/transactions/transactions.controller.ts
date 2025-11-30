import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Para Yatır -> POST /transactions/deposit
  @Post('deposit')
  deposit(@Body() body: { userId: number; amount: number }) {
    return this.transactionsService.deposit(body.userId, body.amount);
  }

  // Para Çek -> POST /transactions/withdraw
  @Post('withdraw')
  withdraw(@Body() body: { userId: number; amount: number }) {
    return this.transactionsService.withdraw(body.userId, body.amount);
  }

  // Geçmişi Gör -> GET /transactions/user/1
  @Get('user/:userId')
  findAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.findAllByUser(userId);
  }
}