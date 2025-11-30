import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Veritabanı temizleniyor...');

  // Sıralama ÖNEMLİDİR (Önce çocuklar, sonra ebeveynler silinir)
  
  // 1. Önce Oranlar ve Bahisler (En uçtaki veriler)
  await prisma.odds.deleteMany({});
  await prisma.bet.deleteMany({});
  
  // 2. Kuponlar ve Maç İstatistikleri
  await prisma.coupon.deleteMany({});
  await prisma.playerMatchStats.deleteMany({});
  
  // 3. Maçlar
  await prisma.match.deleteMany({});
  
  // 4. Oyuncular
  await prisma.player.deleteMany({});
  
  // 5. Takımlar
  await prisma.team.deleteMany({});
  
  // 6. Ligler
  await prisma.league.deleteMany({});

  // 7. İşlemler (Transactions) ve Kullanıcılar (Opsiyonel: Kullanıcıları silmek istemezsen burayı yoruma al)
  // await prisma.transaction.deleteMany({});
  // await prisma.user.deleteMany({});

  console.log('✨ Veritabanı tertemiz oldu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });