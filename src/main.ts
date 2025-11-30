import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Frontend'den gelen isteklere izin ver
  app.enableCors(); 
  
  await app.listen(3000);
}
bootstrap();