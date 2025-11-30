import { PrismaClient, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Tohumlama (Seeding) başlıyor...');

  // --- 1. LİGLERİ OLUŞTUR ---
  const superLig = await prisma.league.create({
    data: { name: 'Trendyol Süper Lig', country: 'Türkiye' },
  });

  const premierLeague = await prisma.league.create({
    data: { name: 'Premier League', country: 'İngiltere' },
  });

  console.log('✅ Ligler oluşturuldu.');

  // --- 2. TAKIMLARI OLUŞTUR (Süper Lig) ---
  const gs = await prisma.team.create({
    data: { name: 'Galatasaray', league_id: superLig.league_id },
  });
  const fb = await prisma.team.create({
    data: { name: 'Fenerbahçe', league_id: superLig.league_id },
  });
  const bjk = await prisma.team.create({
    data: { name: 'Beşiktaş', league_id: superLig.league_id },
  });
  const ts = await prisma.team.create({
    data: { name: 'Trabzonspor', league_id: superLig.league_id },
  });

  // --- 2.1 TAKIMLARI OLUŞTUR (Premier Lig) ---
  const city = await prisma.team.create({
    data: { name: 'Manchester City', league_id: premierLeague.league_id },
  });
  const arsenal = await prisma.team.create({
    data: { name: 'Arsenal', league_id: premierLeague.league_id },
  });

  console.log('✅ Takımlar oluşturuldu.');

  // --- 3. GELECEK MAÇLARI OLUŞTUR ---
  // Maç 1: GS vs FB (Derbi) - 3 gün sonra
  const derbyMatch = await prisma.match.create({
    data: {
      league_id: superLig.league_id,
      home_team_id: gs.team_id,
      away_team_id: fb.team_id,
      match_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // Şu andan 3 gün sonra
      status: MatchStatus.SCHEDULED,
      home_score: 0,
      away_score: 0,
    },
  });

  // Maç 2: City vs Arsenal - 1 gün sonra
  const eplMatch = await prisma.match.create({
    data: {
      league_id: premierLeague.league_id,
      home_team_id: city.team_id,
      away_team_id: arsenal.team_id,
      match_date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000),
      status: MatchStatus.SCHEDULED,
    },
  });

  console.log('✅ Maçlar fikstüre eklendi.');

  // --- 4. ORANLARI (ODDS) EKLE ---
  // GS - FB Oranları
  await prisma.odds.createMany({
    data: [
      { match_id: derbyMatch.match_id, bet_type: 'Mac Sonucu 1', odd_value: 2.10 },
      { match_id: derbyMatch.match_id, bet_type: 'Mac Sonucu X', odd_value: 3.20 },
      { match_id: derbyMatch.match_id, bet_type: 'Mac Sonucu 2', odd_value: 2.80 },
      { match_id: derbyMatch.match_id, bet_type: 'Alt 2.5', odd_value: 1.95 },
      { match_id: derbyMatch.match_id, bet_type: 'Ust 2.5', odd_value: 1.75 },
    ],
  });

  // City - Arsenal Oranları
  await prisma.odds.createMany({
    data: [
      { match_id: eplMatch.match_id, bet_type: 'Mac Sonucu 1', odd_value: 1.85 },
      { match_id: eplMatch.match_id, bet_type: 'Mac Sonucu X', odd_value: 3.50 },
      { match_id: eplMatch.match_id, bet_type: 'Mac Sonucu 2', odd_value: 3.10 },
    ],
  });

  console.log('✅ Bahis oranları eklendi.');
  console.log('🌱 Tohumlama tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });