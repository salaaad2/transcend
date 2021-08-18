import { Module } from '@nestjs/common';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Message from './message.entity';
import { UsersModule } from '../users/users.module'
import { AppModule } from 'src/app.module';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
    imports: [AuthenticationModule, UsersModule, TypeOrmModule.forFeature([Message])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}