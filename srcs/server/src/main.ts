import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
      origin: [ "http://localhost:4000", "http://client:4000" ],
      methods: 'GET, PUT, POST, DELETE, OPTIONS',
      allowedHeaders: 'Content-Type, Authorization, Origin',
      credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: true }));
  app.use(cookieParser());
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
  await app.listen(3000);
}
bootstrap();
