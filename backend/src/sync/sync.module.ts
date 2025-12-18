import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';  

@Module({
  imports: [
    PrismaModule, 
    ConfigModule 
  ], 
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}