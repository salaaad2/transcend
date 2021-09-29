import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
      origin: "*",
      methods: 'GET, PUT, POST, DELETE',
      allowedHeaders: 'Content-Type, Authorization',
      credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: true }));
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
