import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // 1. Maçları Çek (Fixtures)
  @Get('fixtures')
  async syncFixtures() {
    console.log("⏳ Fikstür senkronizasyonu başladı...");
    return await this.syncService.syncFixtures();
  }

  // 2. Puan Durumunu Çek (Standings) - BU EKSİKTİ
  @Get('standings')
  async syncStandings() {
    console.log("⏳ Puan durumu senkronizasyonu başladı...");
    return await this.syncService.syncStandings();
  }

  // 3. Temizlik
  @Get('clear')
  async clearFixtures() {
    console.log("🧹 Temizlik başladı...");
    return await this.syncService.clearFixtures();
  }
  // MAÇ SONUÇLARINI ÇEK
  @Get('results')
  async syncResults() {
    return await this.syncService.syncResults();
  }
}