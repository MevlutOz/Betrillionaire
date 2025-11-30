import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // GET http://localhost:3000/matches
  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  // GET http://localhost:3000/matches/1
  // ParseIntPipe: URL'den gelen "1" stringini sayıya (int) çevirir (Type Casting)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.matchesService.findOne(id);
  }

  // POST http://localhost:3000/matches/1/finish
  @Post(':id/finish')
  finishMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { homeScore: number; awayScore: number }
  ) {
    return this.matchesService.finishMatch(id, body.homeScore, body.awayScore);
  }
}