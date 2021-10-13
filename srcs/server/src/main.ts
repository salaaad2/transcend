import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import makeid from './utils/randomString';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const session = require('express-session');
  app.use(session({secret: makeid(16),
                  resave: true,
                  saveUninitialized: true}));
  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: true }));
  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(passport.session());
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
  await app.listen(3000);
}
bootstrap();
