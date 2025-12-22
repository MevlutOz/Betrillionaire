import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; 

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) throw new HttpException('Geçersiz ID', HttpStatus.BAD_REQUEST);

    const user = await this.prisma.user.findUnique({ where: { user_id: userId } });

    if (!user) throw new HttpException('Kullanıcı bulunamadı', HttpStatus.NOT_FOUND);

    return { ...user, balance: user.balance.toString() };
  }
}