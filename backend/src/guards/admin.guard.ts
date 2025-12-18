import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // EKLE

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService // Config servisini enjekte et
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new ForbiddenException('Token bulunamadı');

    try {
      // process.env YERİNE configService KULLAN
      const secret = this.configService.get<string>('JWT_SECRET');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret
      });

      if (!payload.isAdmin) {
        throw new ForbiddenException('Bu işlem için Admin yetkisi gerekiyor!');
      }

      return true;
    } catch {
      throw new ForbiddenException('Geçersiz Yetki');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}