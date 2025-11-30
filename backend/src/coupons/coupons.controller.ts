import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  // POST http://localhost:3000/coupons
  @Post()
  create(@Body() createCouponDto: any) {
    return this.couponsService.create(createCouponDto);
  }

  // GET http://localhost:3000/coupons/user/1
  @Get('user/:userId')
  findAllByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.couponsService.findAllByUser(userId);
  }
}