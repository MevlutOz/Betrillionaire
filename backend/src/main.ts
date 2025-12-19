import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('⏳ Uygulama başlatılıyor...');
    
    const app = await NestFactory.create(AppModule);
    
    // Frontend'den gelen isteklere izin ver (CORS)
    app.enableCors();

    // Cloud Run PORT değişkeni (Genelde 8080 verir)
    const port = process.env.PORT || 3000;
    
    console.log(`🔌 Port belirlendi: ${port}`);
    console.log(`🌍 Dinleme adresi: 0.0.0.0 (Tüm IP'ler)`);

    // DİKKAT: '0.0.0.0' çok kritik!
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Uygulama başarıyla açıldı: ${await app.getUrl()}`);
    
  } catch (error) {
    // İŞTE SESSİZ HATAYI YAKALAYAN KISIM BURASI
    console.error('❌❌❌ KRİTİK HATA (FATAL ERROR) ❌❌❌');
    console.error('Uygulama başlatılamadı. Hata detayı:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();