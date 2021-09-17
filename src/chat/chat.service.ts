import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { InjectRepository } from '@nestjs/typeorm';
import Message from './message.entity';
import User from '../users/user.entity';
import { Connection, Repository, createConnection } from 'typeorm';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';
import Channel from './channel.entity';
import { UsersService } from 'src/users/users.service';
import { runInThisContext } from 'vm';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
 
@Injectable()
export class ChatService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly userService: UsersService,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Channel)
    private chanRepository: Repository<Channel>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
  }
 
  async saveMessage(content: {
    'channel': string,
    'content': string
  }, username: string) {

    const messageDto = {
      'author': username,
      'content': content.content
    }
    const channel = await this.chanRepository.findOne({name: content.channel})
    const message = await this.messagesRepository.create({
      ...messageDto,
      channel: channel
    });
    await this.messagesRepository.save(message);
    return message;
  }

  async getAllMessages(params: string) {
    const channel = await this.chanRepository.find({relations: ['message']});
    const found = channel.find(element => element.name == params);
    if (found)
      return found.message;
    else
      return undefined;
  }

  async getChannels(username: string) {
    const user = this.userService.getByUsername(username);
    let chanlist: Channel[] = [];
    const channel = await this.chanRepository.find({select: ['name', 'id']});
    let found;
    for (const c of (await user).chanslist)
    {
      found = channel.find(element => element.name == c);
      if (found)
        chanlist.push(found);
    }
    return chanlist;
  }

  async createChannel(data: { admin: string, name: string, password: string}) {
    const channel = new Channel();
    channel.name = data.name;
    channel.admin = data.admin;
    channel.password = data.password;
    channel.message = [];
    await this.chanRepository.save(channel);
  }

  async joinChannel(data: { username: string, channel: string }) {
    const user = await this.userService.getByUsername(data.username);
    user.chanslist[user.chanslist.length] = data.channel;
    await this.usersRepository.save(user);
  }
}
