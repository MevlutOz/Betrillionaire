import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Bu modülü Global yaparak her seferinde import etme zahmetinden kurtulabilirsin (Opsiyonel ama önerilir)
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // DİKKAT: Bunu yazmazsan AuthModule servisi göremez!
})
export class PrismaModule {}