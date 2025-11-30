import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  // 1. FİKSTÜR SENKRONİZASYONU (Premier League - ID: 177)
  async syncFixtures() {
    const apiKey = process.env.ALLSPORTS_API_KEY;
    const apiUrl = process.env.ALLSPORTS_API_URL;

    // Tarih: Bugün ve önümüzdeki 14 gün
    const today = new Date().toISOString().split('T')[0];
    const next14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Loglarda bulduğumuz ID: 177
    const leagueId = 177;

    try {
      // Sadece ID 177'yi istiyoruz
      const requestUrl = `${apiUrl}/?met=Fixtures&APIkey=${apiKey}&from=${today}&to=${next14Days}&leagueId=${leagueId}`;
      
      this.logger.log(`ID 177 (Premier League) için istek atılıyor...`);

      const response = await axios.get(requestUrl);
      const fixtures = response.data.result;
      
      if (!fixtures || fixtures.length === 0) {
        return { message: 'ID 177 için maç bulunamadı.' };
      }

      this.logger.log(`${fixtures.length} adet maç bulundu. Veritabanına işleniyor...`);
      
      let processedCount = 0;

      for (const item of fixtures) {
        
        // 1. Ligi Bul veya Oluştur
        // Ülkeyi API'den ne geliyorsa o yapalım (Gana veya İngiltere olabilir)
        let league = await this.prisma.league.findFirst({ where: { name: item.league_name } });
        if (!league) {
            league = await this.prisma.league.create({
                data: { 
                    name: item.league_name, 
                    country: item.country_name || 'Dünya' 
                }
            });
        }

        // 2. Takımları Bul veya Oluştur
        // EV SAHİBİ
        let homeTeam = await this.prisma.team.findFirst({ where: { name: item.event_home_team } });
        if (!homeTeam) {
          homeTeam = await this.prisma.team.create({
            data: { name: item.event_home_team, league_id: league.league_id }
          });
        }

        // DEPLASMAN
        let awayTeam = await this.prisma.team.findFirst({ where: { name: item.event_away_team } });
        if (!awayTeam) {
          awayTeam = await this.prisma.team.create({
            data: { name: item.event_away_team, league_id: league.league_id }
          });
        }

        // 3. Maçı Kaydet
        const matchDate = new Date(`${item.event_date}T${item.event_time}`);
        
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
                    away_score: 0
                }
            });

            // 4. Oranları Oluştur
            await this.generateRandomOdds(newMatch.match_id);
            
            processedCount++;
        }
      }

      return { message: `Başarılı! Premier League (ID: 177) için ${processedCount} yeni maç eklendi.` };

    } catch (error) {
      this.logger.error(error);
      throw new Error('API Hatası: ' + error.message);
    }
  }

  // 2. TEMİZLEME
  async clearFixtures() {
    try {
      await this.prisma.odds.deleteMany({});
      await this.prisma.bet.deleteMany({});
      await this.prisma.coupon.deleteMany({});
      await this.prisma.match.deleteMany({});
      // Temiz bir başlangıç için takımları da silebiliriz (Opsiyonel)
      // await this.prisma.team.deleteMany({});
      return { message: 'Veritabanı temizlendi.' };
    } catch (error) {
      throw new Error('Temizleme hatası: ' + error.message);
    }
  }

  // 3. ORAN ÜRETİCİ
  private async generateRandomOdds(matchId: number) {
    const randomOdd = () => (Math.random() * (4.5 - 1.1) + 1.1).toFixed(2);
    await this.prisma.odds.createMany({
        data: [
            { match_id: matchId, bet_type: 'Mac Sonucu 1', odd_value: parseFloat(randomOdd()) },
            { match_id: matchId, bet_type: 'Mac Sonucu X', odd_value: parseFloat(randomOdd()) },
            { match_id: matchId, bet_type: 'Mac Sonucu 2', odd_value: parseFloat(randomOdd()) },
        ]
    });
  }
}