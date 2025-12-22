import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() 
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // DİKKAT: Bunu yazmazsan AuthModule servisi göremez!
})
export class PrismaModule {}