import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  // GET http://localhost:3000/sync/fixtures
  @Get('fixtures')
  syncFixtures() {
    return this.syncService.syncFixtures();
  }
}