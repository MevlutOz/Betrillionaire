import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // GET http://localhost:3000/sync/fixtures
  @Get('fixtures')
  async syncFixtures() {
    // İşlem uzun sürdüğü için log ekleyelim
    console.log("Fikstür senkronizasyonu tetiklendi...");
    return await this.syncService.syncFixtures();
  }

  // GET http://localhost:3000/sync/clear
  @Get('clear')
  async clearFixtures() {
    console.log("Temizlik işlemi tetiklendi...");
    return await this.syncService.clearFixtures();
  }
}