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
import { UsersService } from 'src/users/users.service';
import Channel from './channel.entity';
import { ChatController } from './chat.controller';
import { PongService } from './pong.service';
import { MatchService } from 'src/match/match.service';
import Match from 'src/match/match.entity';

@Module({
        imports: [AuthenticationModule, UsersModule, TypeOrmModule.forFeature([Message]), 
                  TypeOrmModule.forFeature([Channel]), TypeOrmModule.forFeature([Match])],
    controllers: [ChatController],
      providers: [ChatGateway, ChatService, PongService, MatchService],
})
export class ChatModule {}