import { PrismaClient, MatchStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// Tarih Formatlayıcı
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

// Sezon Formatlayıcı (2025 -> "2024-2025")
function formatSeason(yearStr: string): string {
  if (!yearStr) return "2024-2025";
  const endYear = parseInt(yearStr);
  if (!isNaN(endYear)) {
    return `${endYear - 1}-${endYear}`;
  }
  return yearStr;
}

async function main() {
  const filePath = path.join(__dirname, '../final_matches.csv');
  console.log(`📂 CSV Dosyası okunuyor...`);

  const results: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`📊 Toplam ${results.length} satır işleniyor...`);

      // İngiltere Premier Ligi'ni Bul veya Oluştur
      let league = await prisma.league.findFirst({ where: { name: 'Premier League' } });
      if (!league) {
        league = await prisma.league.create({
          data: { name: 'Premier League', country: 'İngiltere' }
        });
      }

      let count = 0;

      for (const row of results) {
        // DUPLICATE KONTROLÜ: Sadece Ev Sahibi (Home) satırını al
        if (row.venue !== 'Home') continue;

        const matchDate = parseDate(row.date);
        const homeName = row.team;
        const awayName = row.opponent;
        const homeScore = parseInt(row.gf);
        const awayScore = parseInt(row.ga);
        const season = formatSeason(row.season);

        if (!matchDate || isNaN(homeScore)) continue;

        // Takımları Bul/Oluştur
        let homeTeam = await prisma.team.findFirst({ where: { name: homeName } });
        if (!homeTeam) homeTeam = await prisma.team.create({ data: { name: homeName, league_id: league.league_id } });

        let awayTeam = await prisma.team.findFirst({ where: { name: awayName } });
        if (!awayTeam) awayTeam = await prisma.team.create({ data: { name: awayName, league_id: league.league_id } });

        // Maçı Kaydet
        await prisma.match.create({
          data: {
            league_id: league.league_id,
            home_team_id: homeTeam.team_id,
            away_team_id: awayTeam.team_id,
            match_date: matchDate,
            status: MatchStatus.FINISHED,
            home_score: homeScore,
            away_score: awayScore,
            season: season
          }
        });

        count++;
        if (count % 200 === 0) console.log(`${count} maç eklendi...`);
      }

      console.log(`✅ ${count} maç başarıyla arşive eklendi!`);
    });
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());