import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Prisma modülünü import et
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule, // Veritabanı erişimi için
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secretKey', // .env'den okur
      signOptions: { expiresIn: '1d' }, // Token 1 gün geçerli
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}