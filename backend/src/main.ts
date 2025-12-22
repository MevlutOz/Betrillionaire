import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  console.log("🛑🛑🛑 SÜRÜM KONTROL: BURADAYIM DAYI! (V99) 🛑🛑🛑"); 

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Uygulama ${port} portunda çalışıyor`);
}
bootstrap();