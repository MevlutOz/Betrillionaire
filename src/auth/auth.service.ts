import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. KAYIT OLMA (REGISTER)
  async register(registerDto: RegisterDto) {
    // Email kontrolü: Daha önce alınmış mı?
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Bu email zaten kullanımda.');
    }

    // Şifreyi Hashle (Saltlama işlemi)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Kullanıcıyı veritabanına kaydet
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password_hash: hashedPassword,
        name: registerDto.name,
        // Balance default 0 gelir, is_admin false gelir
      },
    });

    return { message: 'Kayıt başarılı', userId: user.user_id };
  }

  // 2. GİRİŞ YAPMA (LOGIN)
  async login(loginDto: LoginDto) {
    // Kullanıcıyı bul
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Şifreyi kontrol et (Hash kıyaslama)
    const isMatch = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Token (JWT) oluştur
    const payload = { sub: user.user_id, email: user.email, role: user.is_admin ? 'admin' : 'user' };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.user_id,
        name: user.name,
        balance: user.balance
      }
    };
  }
}