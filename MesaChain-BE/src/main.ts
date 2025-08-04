import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 app.use(json({ limit: '10mb' }));
 
 // Enable CORS for frontend
 app.enableCors({
   origin: process.env.API_BASE_URL_FRONTEND || 'http://localhost:4000',
   credentials: true,
 });
 
 const port = process.env.PORT || 4000;
 await app.listen(port);
 
 console.log('🚀 MesaChain Backend is running!');
 console.log(`📡 Server: http://localhost:${port}`);
 console.log(`📊 Health: http://localhost:${port}/health`);
 console.log(`📈 Metrics: http://localhost:${port}/metrics`);
}
bootstrap();