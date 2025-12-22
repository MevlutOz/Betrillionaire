import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';  
import { CouponsModule } from '../coupons/coupons.module'; 


@Module({
  imports: [
    PrismaModule, 
    ConfigModule,
    CouponsModule 
  ], 
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}