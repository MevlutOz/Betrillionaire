import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CouponsService } from '../coupons/coupons.service'; 
import axios from 'axios';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private couponsService: CouponsService
  ) {}

  // HEDEF LİGLER
  private readonly TARGET_LEAGUES = [
    { id: 271, name: 'Superliga', country: 'Denmark' },     
    { id: 501, name: 'Premiership', country: 'Scotland' },  
  ];
  /*
  async debugMatch(matchId: number) {
    const apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');
    const apiUrl = this.configService.get<string>('SPORTMONKS_API_URL');
    
    console.log(`🕵️‍♂️ TEK MAÇ SORGULANIYOR: ID ${matchId}`);
    
    try {
        // Direkt ID ile API'ye soruyoruz
        const url = `${apiUrl}/football/fixtures/${matchId}`;
        const response = await axios.get(url, {
            params: { 
                api_token: apiToken,
                include: 'scores;state;participants' // Bize lazım olanlar
            }
        });

        const data = response.data.data;
        
        console.log("------------------------------------------------");
        console.log(`🏠 Ev Sahibi: ${data.participants.find((p:any)=>p.meta.location==='home').name}`);
        console.log(`✈️ Deplasman: ${data.participants.find((p:any)=>p.meta.location==='away').name}`);
        console.log(`📅 Tarih: ${data.starting_at}`);
        console.log(`⚡ DURUM (State): ${data.state?.state}`); // En önemlisi bu!
        console.log(`⚽ SKORLAR:`, JSON.stringify(data.scores, null, 2));
        console.log("------------------------------------------------");

        return data;
    } catch (error) {
        console.error("HATA:", error.response?.data || error.message);
    }
  }
  
    */
   // SONUÇLARI GÜNCELLEME
  async syncResults() {
  const apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');
  const apiUrl = this.configService.get<string>('SPORTMONKS_API_URL');

  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 2); 
  const dateFrom = pastDate.toISOString().split('T')[0];
  const dateTo = today.toISOString().split('T')[0];

  console.log(`⚽ MATCH RESULT SYNC (${dateFrom} - ${dateTo})`);

  let totalProcessed = 0;

  // Skor fallback fonksiyonu
  const getScore = (scores: any[], participant: 'home' | 'away'): number | null => {
    if (!scores) return null;

    const scoreItem = scores.find(
      s =>
        ['CURRENT', 'FINAL', 'TOTAL'].includes(s.description) &&
        s.score?.participant === participant
    );

    return scoreItem?.score?.goals ?? null;
  };

  for (const target of this.TARGET_LEAGUES) {
    try {
      const response = await axios.get(
        `${apiUrl}/football/fixtures/between/${dateFrom}/${dateTo}`,
        {
          params: {
            api_token: apiToken,
            leagues: target.id,
            include: 'participants'
          }
        }
      );

      const fixtures = response.data.data;
      if (!fixtures || fixtures.length === 0) continue;

      for (const f of fixtures) {
        try {
          
          const fixtureResponse = await axios.get(
            `${apiUrl}/football/fixtures/${f.id}`,
            {
              params: {
                api_token: apiToken,
                include: 'scores;state;participants;season'
              }
            }
          );

          const fixture = fixtureResponse.data.data;
          if (!fixture) continue;

          const homeScore = getScore(fixture.scores, 'home');
          const awayScore = getScore(fixture.scores, 'away');

          // ⏳ Skor yoksa maç hâlâ finalize edilmemiştir
          if (homeScore === null || awayScore === null) {
            console.log(`⏳ Skor yok → atlandı (ID: ${fixture.id})`);
            continue;
          }

          // MAÇI BUL
          let existingMatch = await this.prisma.match.findUnique({
            where: { api_id: fixture.id }
          });

          if (!existingMatch) {
            const homePart = fixture.participants.find((p: any) => p.meta?.location === 'home');
            const awayPart = fixture.participants.find((p: any) => p.meta?.location === 'away');

            if (!homePart || !awayPart) continue;

            const dbHome = await this.prisma.team.findFirst({
              where: { OR: [{ api_id: homePart.id }, { name: homePart.name }] }
            });

            const dbAway = await this.prisma.team.findFirst({
              where: { OR: [{ api_id: awayPart.id }, { name: awayPart.name }] }
            });

            if (!dbHome || !dbAway) continue;

            existingMatch = await this.prisma.match.findFirst({
              where: {
                home_team_id: dbHome.team_id,
                away_team_id: dbAway.team_id,
                status: 'SCHEDULED'
              }
            });
          }

          if (!existingMatch) continue;

          const htHome =
            fixture.scores?.find(
              (s: any) =>
                s.description === '1ST_HALF' && s.score?.participant === 'home'
            )?.score?.goals ?? 0;

          const htAway =
            fixture.scores?.find(
              (s: any) =>
                s.description === '1ST_HALF' && s.score?.participant === 'away'
            )?.score?.goals ?? 0;

          console.log(
            `✅ RESULT: ${existingMatch.match_id} → ${homeScore}-${awayScore}`
          );

          await this.prisma.match.update({
            where: { match_id: existingMatch.match_id },
            data: {
              api_id: fixture.id,
              status: 'FINISHED',
              home_score: homeScore,
              away_score: awayScore,
              ht_home_score: htHome,
              ht_away_score: htAway,
              season: fixture.season?.name || '2025-2026'
            }
          });

          await this.couponsService.processMatchResults(existingMatch.match_id);

          totalProcessed++;
        } catch (innerError) {
          console.error(`❌ Fixture Error (${f.id}):`, innerError.message);
        }
      }
    } catch (error) {
      console.error(`❌ League Error (${target.name}):`, error.message);
    }
  }

  return { message: `${totalProcessed} maç başarıyla sonuçlandırıldı.` };
 }

 
  // 2. PUAN DURUMU 
  async syncStandings() {
    const apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');
    const apiUrl = this.configService.get<string>('SPORTMONKS_API_URL');
    this.logger.log("🏆 Puan Durumu Senkronizasyonu Başlıyor...");

    for (const target of this.TARGET_LEAGUES) {
      try {
        const leagueResponse = await axios.get(`${apiUrl}/football/leagues/${target.id}`, {
          params: { api_token: apiToken, include: 'currentSeason;seasons' }
        });
        const data = leagueResponse.data.data;
        let currentSeasonId = data.currentSeason?.id;
        if (!currentSeasonId && data.seasons?.length > 0) {
            currentSeasonId = data.seasons.sort((a: any, b: any) => b.id - a.id)[0].id;
        }
        if (!currentSeasonId) continue;

        const standingsResponse = await axios.get(`${apiUrl}/football/standings/seasons/${currentSeasonId}`, {
          params: { api_token: apiToken, include: 'participant;details' }
        });
        const standingsData = standingsResponse.data.data;
        if (!standingsData || standingsData.length === 0) continue;

        const dbLeague = await this.prisma.league.findFirst({ where: { name: target.name } });
        if (!dbLeague) continue;

        await this.prisma.standing.deleteMany({ where: { league_id: dbLeague.league_id } });

        for (const row of standingsData) {
            const teamName = row.participant?.name || "Bilinmeyen Takım";
            const teamLogo = row.participant?.image_path || null;
            let team = await this.prisma.team.findFirst({ where: { name: teamName } });
            if (!team) team = await this.prisma.team.create({ data: { name: teamName, logo: teamLogo, league_id: dbLeague.league_id } });
            else if (!team.logo && teamLogo) await this.prisma.team.update({ where: { team_id: team.team_id }, data: { logo: teamLogo } });

            const stats = row.overall || row.total || row;
            const getDetail = (id: number) => row.details?.find((x: any) => x.type_id === id)?.value || 0;
            const val = (key: string, detailId: number) => stats[key] ?? getDetail(detailId) ?? 0;

            const played = parseInt(val('games_played', 129));
            const won = parseInt(val('won', 130));
            const draw = parseInt(val('draw', 131));
            const lost = parseInt(val('lost', 132));
            const points = parseInt(val('points', 187) || row.points || 0);
            const goalsFor = parseInt(val('goals_scored', 133));
            const goalsAgainst = parseInt(val('goals_against', 134));
            let goalDiff = parseInt(val('goal_difference', 179));
            if (goalDiff === 0 && (goalsFor !== 0 || goalsAgainst !== 0)) goalDiff = goalsFor - goalsAgainst;

            await this.prisma.standing.create({
                data: {
                    league_id: dbLeague.league_id, team_id: team.team_id, rank: parseInt(row.position ?? 0),
                    points, form: row.form || null, played, won, draw, lost, goals_for: goalsFor, goals_against: goalsAgainst, goals_diff: goalDiff 
                }
            });
        }
        this.logger.log(`✅ ${target.name} puan durumu güncellendi.`);
      } catch (error) { this.logger.error(`Standings Error: ${error.message}`); }
    }
    return { message: "Puan durumları güncellendi." };
  }

  //3.FİKSTÜR SENKRONİZASYONU
  async syncFixtures() {
    const apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');
    const apiUrl = this.configService.get<string>('SPORTMONKS_API_URL');
    if (!apiToken) return { message: "API Token eksik." };

    
    const startObj = new Date();
    startObj.setDate(startObj.getDate() - 3); // 3 Gün Geri git
    const dateFrom = startObj.toISOString().split('T')[0];
    const endObj = new Date();
    endObj.setDate(endObj.getDate() + 14);
    const dateTo = endObj.toISOString().split('T')[0];

    let totalProcessed = 0;
    const resultsLog: string[] = [];

    this.logger.log(`Sync Başlıyor (ID Kurtarma + Fikstür) (${dateFrom} - ${dateTo})...`);

    for (const target of this.TARGET_LEAGUES) {
      try {
        const url = `${apiUrl}/football/fixtures/between/${dateFrom}/${dateTo}`;
        
        const response = await axios.get(url, { 
            params: { 
                api_token: apiToken, 
                leagues: target.id, 
                include: 'league.country;participants;odds;season' 
            } 
        });
        
        const fixtures = response.data.data;
        if (!fixtures || fixtures.length === 0) continue;

        let leagueCount = 0;
        for (const item of fixtures) {
          const homeParticipant = item.participants.find((p: any) => p.meta?.location === 'home');
          const awayParticipant = item.participants.find((p: any) => p.meta?.location === 'away');
          if (!homeParticipant || !awayParticipant) continue;

          const homeName = homeParticipant.name; 
          const awayName = awayParticipant.name;
          const homeLogo = homeParticipant.image_path; 
          const awayLogo = awayParticipant.image_path;
          const matchDateRaw = item.starting_at;
          const leagueName = item.league?.name || target.name;
          const countryName = item.league?.country?.name || target.country; 
          const leagueLogo = item.league?.image_path;
          const seasonName = item.season?.name || '2025-2026';

          // 1.LIG
          let league = await this.prisma.league.findFirst({ 
              where: { OR: [{ api_id: target.id }, { name: leagueName }] } 
          });
          if (!league) {
              league = await this.prisma.league.create({ data: { api_id: target.id, name: leagueName, country: countryName, logo: leagueLogo } });
          } else {
              await this.prisma.league.update({ where: { league_id: league.league_id }, data: { api_id: target.id } });
          }

          // 2.TAKIMLAR
          // Ev Sahibi
          let homeTeam = await this.prisma.team.findFirst({ where: { OR: [{ api_id: homeParticipant.id }, { name: homeName }] } });
          if (!homeTeam) {
              homeTeam = await this.prisma.team.create({ data: { api_id: homeParticipant.id, name: homeName, logo: homeLogo, league_id: league.league_id } });
          } else if (!homeTeam.api_id) {
              await this.prisma.team.update({ where: { team_id: homeTeam.team_id }, data: { api_id: homeParticipant.id } });
          }

          // Deplasman
          let awayTeam = await this.prisma.team.findFirst({ where: { OR: [{ api_id: awayParticipant.id }, { name: awayName }] } });
          if (!awayTeam) {
              awayTeam = await this.prisma.team.create({ data: { api_id: awayParticipant.id, name: awayName, logo: awayLogo, league_id: league.league_id } });
          } else if (!awayTeam.api_id) {
              await this.prisma.team.update({ where: { team_id: awayTeam.team_id }, data: { api_id: awayParticipant.id } });
          }

          // 3.MAÇ 
          const matchDate = new Date(matchDateRaw);

          // A.ID ile ara
          let existingMatch = await this.prisma.match.findUnique({
              where: { api_id: item.id }
          });

          // B.ID yoksa, İsim ve Tarih ile ara 
          if (!existingMatch) {
              existingMatch = await this.prisma.match.findFirst({
                  where: {
                      home_team_id: homeTeam.team_id,
                      away_team_id: awayTeam.team_id,
                      match_date: {
                          // Gün bazında arama yapıyoruz
                          gte: new Date(new Date(matchDate).setHours(0,0,0,0)),
                          lte: new Date(new Date(matchDate).setHours(23,59,59,999))
                      }
                  }
              });
          }

          if (existingMatch) {
            console.log(`♻️ ID GÜNCELLENİYOR: ${homeName} vs ${awayName} -> ID: ${item.id}`);
            
            await this.prisma.match.update({
                where: { match_id: existingMatch.match_id },
                data: {
                    api_id: item.id, 
                    match_date: matchDate,
                    season: seasonName,
                    // Eğer maç API'de bitmişse burada durumu da güncelleyebiliriz ama
                    // SyncResults zaten ID gelince bunu halledecek. Biz sadece ID'yi verelim yeter.
                }
            });
          } else {
            const newMatch = await this.prisma.match.create({
              data: {
                api_id: item.id,
                league_id: league.league_id,
                home_team_id: homeTeam.team_id,
                away_team_id: awayTeam.team_id,
                match_date: matchDate,
                status: 'SCHEDULED', 
                home_score: 0,
                away_score: 0,
                season: seasonName
              }
            });

            const realOdds = await this.processRealOdds(newMatch.match_id, item.odds);
            if (!realOdds) await this.generateSmartOdds(newMatch.match_id);
            
            leagueCount++; 
            totalProcessed++;
          }
        }
        resultsLog.push(`${target.name}: ${leagueCount} processed`);
      } catch (error) { this.logger.error(`HATA (${target.name}): ${error.message}`); }
    }
    return { message: 'Sync Completed (Recovery Mode)', details: resultsLog, totalProcessed: totalProcessed };
  }

  // YARDIMCI METOTLAR
  async clearFixtures() {
    try {
      await this.prisma.odds.deleteMany({}); await this.prisma.bet.deleteMany({}); await this.prisma.coupon.deleteMany({});
      await this.prisma.playerMatchStats.deleteMany({}); await this.prisma.standing.deleteMany({}); await this.prisma.match.deleteMany({ where: { status: 'SCHEDULED' } });
      return { message: 'Temizlik yapıldı.' };
    } catch (error) { throw new Error(error.message); }
  }

  async hardReset() {
    await this.prisma.odds.deleteMany({}); await this.prisma.bet.deleteMany({}); await this.prisma.coupon.deleteMany({});
    await this.prisma.standing.deleteMany({}); await this.prisma.match.deleteMany({}); await this.prisma.team.deleteMany({}); await this.prisma.league.deleteMany({});
    return { message: "Reset Başarılı." };
  }

  async deleteLeagueByName(name: string) {
    const league = await this.prisma.league.findFirst({ where: { name } });
    if (!league) return { message: "Bulunamadı" };
    await this.prisma.standing.deleteMany({ where: { league_id: league.league_id } });
    const matches = await this.prisma.match.findMany({ where: { league_id: league.league_id } });
    for(const m of matches) { await this.prisma.odds.deleteMany({where: {match_id: m.match_id}}); await this.prisma.bet.deleteMany({where: {match_id: m.match_id}}); }
    await this.prisma.match.deleteMany({ where: { league_id: league.league_id } });
    await this.prisma.team.deleteMany({ where: { league_id: league.league_id } });
    await this.prisma.league.delete({ where: { league_id: league.league_id } });
    return { message: "Silindi." };
  }

  private async processRealOdds(matchId: number, oddsData: any[]): Promise<boolean> {
    if (!oddsData || oddsData.length === 0) return false;
    const matchWinner = oddsData.find((o: any) => o.market_id === 1 || o.name === '3Way Result' || o.name === 'Match Winner');
    if (!matchWinner?.values) return false;
    let h, d, a;
    matchWinner.values.forEach((v: any) => {
        const lbl = v.label || v.value; const val = parseFloat(v.value || v.odd);
        if (lbl === '1' || lbl === 'Home') h = val; if (lbl === 'X' || lbl === 'Draw') d = val; if (lbl === '2' || lbl === 'Away') a = val;
    });
    if (!h || !d || !a) return false;
    await this.prisma.odds.createMany({ data: [ { match_id: matchId, bet_type: 'Mac Sonucu 1', odd_value: h }, { match_id: matchId, bet_type: 'Mac Sonucu X', odd_value: d }, { match_id: matchId, bet_type: 'Mac Sonucu 2', odd_value: a } ] });
    return true;
  }

  private async generateSmartOdds(matchId: number) {
    const rand = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
    const scenario = Math.random() > 0.5 ? 'FAV' : 'BAL';
    let o1, oX, o2, iy1, iyX, iy2, alt, ust, kgV, kgY;
    if (scenario === 'FAV') {
        const fav = rand(1.15, 1.50); const surp = rand(5.0, 9.0); const dr = rand(3.5, 5.0);
        if (Math.random()>0.5) { o1=fav; oX=dr; o2=surp; iy1=rand(1.5,2.0); iyX=rand(2.2,2.5); iy2=rand(6,8); }
        else { o1=surp; oX=dr; o2=fav; iy1=rand(6,8); iyX=rand(2.2,2.5); iy2=rand(1.5,2.0); }
        ust=rand(1.4,1.7); alt=rand(2.1,2.5); kgV=rand(1.8,2.1); kgY=rand(1.6,1.9);
    } else {
        o1=rand(2.3,2.8); o2=rand(2.3,2.8); oX=rand(2.9,3.3); iy1=rand(3,3.5); iy2=rand(3,3.5); iyX=rand(1.9,2.2); alt=rand(1.6,1.8); ust=rand(1.9,2.2); kgV=rand(1.5,1.7); kgY=rand(2.0,2.3);
    }
    const odds = [ { match_id: matchId, bet_type: 'Mac Sonucu 1', odd_value: o1 }, { match_id: matchId, bet_type: 'Mac Sonucu X', odd_value: oX }, { match_id: matchId, bet_type: 'Mac Sonucu 2', odd_value: o2 }, { match_id: matchId, bet_type: 'IY 1', odd_value: iy1 }, { match_id: matchId, bet_type: 'IY X', odd_value: iyX }, { match_id: matchId, bet_type: 'IY 2', odd_value: iy2 }, { match_id: matchId, bet_type: 'Alt 2.5', odd_value: alt }, { match_id: matchId, bet_type: 'Ust 2.5', odd_value: ust }, { match_id: matchId, bet_type: 'KG Var', odd_value: kgV }, { match_id: matchId, bet_type: 'KG Yok', odd_value: kgY } ];
    await this.prisma.odds.createMany({ data: odds });
  }
}