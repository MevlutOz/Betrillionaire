import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard'; // Yolu kontrol et

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // --- 1. SEZON FİLTRESİ (YENİ EKLENEN KISIM) ---
  // GET http://localhost:3000/matches/filter?season=2024-2025
  // ÖNEMLİ: Bu fonksiyon :id'den ÖNCE gelmeli!
  @Get('filter')
  findBySeason(@Query('season') season: string) {
    return this.matchesService.findBySeason(season);
  }

  // --- 2. BÜLTEN (TÜM GELECEK MAÇLAR) ---
  // GET http://localhost:3000/matches
  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  // --- 3. MAÇ DETAYI ---
  // GET http://localhost:3000/matches/1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  // --- 4. MAÇ SONUÇLANDIRMA (ADMİN) ---
  // POST http://localhost:3000/matches/1/finish
  // --- 4. MAÇ SONUÇLANDIRMA (SADECE ADMIN) ---
  @Post(':id/finish')
  @UseGuards(AdminGuard) // <--- BEKÇİ BURADA
  finishMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { homeScore: number; awayScore: number }
  ) {
    return this.matchesService.finishMatch(id, body.homeScore, body.awayScore);
  }
}
