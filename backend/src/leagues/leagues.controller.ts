import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LeaguesService } from './leagues.service';

@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Get()
  findAll() {
    return this.leaguesService.findAll();
  }

  @Get(':id/standings')
  getStandings(@Param('id', ParseIntPipe) id: number) {
    return this.leaguesService.getStandings(id);
  }
}