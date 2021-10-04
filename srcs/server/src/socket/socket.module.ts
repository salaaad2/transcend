import { Module } from '@nestjs/common';
import { ServerGateway } from './socket.gateway';
import { PongService } from '../pong/pong.service';
import { MatchService } from '../match/match.service';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Channel from '../chat/channel.entity';
import User from '../users/user.entity';
import Message from '../chat/message.entity';
import Match from '../match/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message]),
            TypeOrmModule.forFeature([Channel]), TypeOrmModule.forFeature([User]),
           TypeOrmModule.forFeature([Match])],
  controllers: [],
  providers: [ServerGateway, UsersService, ChatService, PongService, MatchService],
})

export class SocketModule {}
