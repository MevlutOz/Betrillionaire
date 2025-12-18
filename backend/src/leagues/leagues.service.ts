import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaguesService {
  constructor(private prisma: PrismaService) {}

  // Tüm Ligleri Getir
  async findAll() {
    return await this.prisma.league.findMany({
      orderBy: { league_id: 'asc' }
    });
  }

  // Bir Ligin Puan Durumunu Getir
  async getStandings(leagueId: number) {
    return await this.prisma.standing.findMany({
      where: { league_id: leagueId },
      include: { team: true },
      orderBy: { rank: 'asc' } 
    });
  }
}