import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '10mb' }));
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.API_BASE_URL_FRONTEND || 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(4000);
}
bootstrap();
