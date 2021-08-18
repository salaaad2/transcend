import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({
    skipMissingProperties: true }));
  app.use(cookieParser());
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
