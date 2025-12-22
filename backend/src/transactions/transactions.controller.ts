import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions') 
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  @Get('balance/:userId')
  getBalance(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.getBalance(userId);
  }
  @Post('deposit')
  deposit(@Body() body: { userId: number; amount: number }) {
    return this.transactionsService.deposit(body.userId, body.amount);
  }

  @Post('withdraw')
  withdraw(@Body() body: { userId: number; amount: number }) {
    return this.transactionsService.withdraw(body.userId, body.amount);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.transactionsService.findAllByUser(userId);
  }


}