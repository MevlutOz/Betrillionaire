import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config'; // <-- 1. KÜTÜPHANE BU
import axios from 'axios';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService // <-- 2. BURADA TANIMLIYORUZ
  ) {}

  // SPORTMONKS LIG ID'leri
  private readonly TARGET_LEAGUES = [
    { id: 271, name: 'Superliga' },    // denmark
    { id: 501, name: 'Premiership' },       // scotland
  ];

  async syncFixtures() {
    // 3. İŞTE .ENV OKUMA KISMI BURASI
    const apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');
    const apiUrl = this.configService.get<string>('SPORTMONKS_API_URL');

    // --- DEBUG ---
    console.log("------------------------------------------------");
    console.log("DEBUG: SportMonks Token:", apiToken ? `${apiToken.substring(0, 5)}...` : "YOK! (.env okunamadı)");
    console.log("------------------------------------------------");

    if (!apiToken) {
      this.logger.error("HATA: .env dosyasında SPORTMONKS_API_TOKEN bulunamadı!");
      return { message: "API Token eksik. Lütfen .env dosyasını kontrol et." };
    }

    const today = new Date().toISOString().split('T')[0];
    const next14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let totalProcessed = 0;
    const resultsLog: string[] = [];

    this.logger.log(`SportMonks senkronizasyonu başlıyor (${today} - ${next14Days})...`);

    for (const target of this.TARGET_LEAGUES) {
      try {
        this.logger.log(`İstek atılıyor: ${target.name} (ID: ${target.id})...`);

        // SportMonks URL Yapısı
        const url = `${apiUrl}/football/fixtures/between/${today}/${next14Days}`;
        
        const response = await axios.get(url, {
          params: {
            api_token: apiToken,
            leagues: target.id,
            include: 'league;participants;scores'
          }
        });

        const fixtures = response.data.data;

        if (!fixtures || fixtures.length === 0) {
          this.logger.warn(`${target.name} için maç bulunamadı.`);
          resultsLog.push(`${target.name}: 0 matches`);
          continue;
        }

        let leagueCount = 0;

        for (const item of fixtures) {
          // GÜVENLİK KONTROLÜ: Participants var mı?
          if (!item.participants || item.participants.length < 2) continue;

          const leagueName = item.league?.name || target.name;
          const countryName = item.league?.country?.name || 'World';
          
          const homeTeamData = item.participants.find((p: any) => p.meta.location === 'home');
          const awayTeamData = item.participants.find((p: any) => p.meta.location === 'away');

          if (!homeTeamData || !awayTeamData) continue;

          const homeTeamName = homeTeamData.name;
          const awayTeamName = awayTeamData.name;
          const matchDateRaw = item.starting_at;

          // 1. Lig Kaydet
          let league = await this.prisma.league.findFirst({ where: { name: leagueName } });
          if (!league) {
            league = await this.prisma.league.create({
              data: { name: leagueName, country: countryName }
            });
          }

          // 2. Takımları Kaydet
          let homeTeam = await this.prisma.team.findFirst({ where: { name: homeTeamName } });
          if (!homeTeam) {
            homeTeam = await this.prisma.team.create({
              data: { name: homeTeamName, league_id: league.league_id }
            });
          }

          let awayTeam = await this.prisma.team.findFirst({ where: { name: awayTeamName } });
          if (!awayTeam) {
            awayTeam = await this.prisma.team.create({
              data: { name: awayTeamName, league_id: league.league_id }
            });
          }

          // 3. Maçı Kaydet
          const matchDate = new Date(matchDateRaw);
          const existingMatch = await this.prisma.match.findFirst({
            where: { 
              home_team_id: homeTeam.team_id,
              away_team_id: awayTeam.team_id,
              match_date: matchDate
            }
          });

          if (!existingMatch) {
            const newMatch = await this.prisma.match.create({
              data: {
                league_id: league.league_id,
                home_team_id: homeTeam.team_id,
                away_team_id: awayTeam.team_id,
                match_date: matchDate,
                status: 'SCHEDULED',
                home_score: 0,
                away_score: 0,
                season: '2025-2026'
              }
            });

            await this.generateRandomOdds(newMatch.match_id);
            leagueCount++;
            totalProcessed++;
          }
        }
        
        this.logger.log(`💾 ${leagueCount} maç eklendi: ${target.name}`);
        resultsLog.push(`${target.name}: ${leagueCount} new`);
        
        // Rate Limit (Bekleme)
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        this.logger.error(`HATA (${target.name}): ${error.message}`);
        // API'den dönen hatayı detaylı gör
        if (error.response) {
            this.logger.error(`API DETAYI: ${JSON.stringify(error.response.data)}`);
        }
      }
    }

    return { 
      message: 'SportMonks Sync Completed', 
      details: resultsLog,
      totalNewMatches: totalProcessed 
    };
  }

  // --- TEMİZLİK ---
  async clearFixtures() {
    try {
      await this.prisma.odds.deleteMany({});
      await this.prisma.bet.deleteMany({});
      await this.prisma.coupon.deleteMany({});
      await this.prisma.playerMatchStats.deleteMany({});
      await this.prisma.match.deleteMany({ where: { status: 'SCHEDULED' } });
      return { message: 'Gelecek maçlar temizlendi.' };
    } catch (error) {
      throw new Error('Temizlik hatası: ' + error.message);
    }
  }

  // --- ORAN ÜRETİCİ ---
  private async generateRandomOdds(matchId: number) {
    const randomOdd = () => (Math.random() * (3.5 - 1.1) + 1.1).toFixed(2);
    await this.prisma.odds.createMany({
        data: [
            { match_id: matchId, bet_type: 'Mac Sonucu 1', odd_value: parseFloat(randomOdd()) },
            { match_id: matchId, bet_type: 'Mac Sonucu X', odd_value: parseFloat(randomOdd()) },
            { match_id: matchId, bet_type: 'Mac Sonucu 2', odd_value: parseFloat(randomOdd()) },
        ]
    });
  }
}