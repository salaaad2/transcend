import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Message from './message.entity';
import { UsersModule } from '../users/users.module'
import Channel from './channel.entity';
import { ChatController } from './chat.controller';
import User from 'src/users/user.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Message]),
            TypeOrmModule.forFeature([Channel]), TypeOrmModule.forFeature([User])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
