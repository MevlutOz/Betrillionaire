import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}


  // Maç Sonuçları
  @Get('results')
  getResults() {
    return this.matchesService.getRecentResults();
  }

  // Sezon Filtresi
  @Get('filter')
  findBySeason(@Query('season') season: string) {
    return this.matchesService.findBySeason(season);
  }

  // Bülten (Tüm Maçlar)
  @Get()
  findAll() {
    return this.matchesService.findAll();
  }


  
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  // Maç Sonuçlandırma (Admin)
  @Post(':id/finish')
  @UseGuards(AdminGuard)
  finishMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { homeScore: number; awayScore: number }
  ) {
    return this.matchesService.finishMatch(id, body.homeScore, body.awayScore);
  }
}