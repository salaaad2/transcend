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

  async getChannelClients(name: string) {
      const chan = await this.chanRepository.findOne({name: name});
    if (chan)
      return(chan.clients);
    else
      return([""]);
  }

  async createChannel(data: { admin: string, name: string, password: string}) {
    const channel = new Channel();
    channel.name = data.name;
    channel.admin = data.admin;
    channel.password = data.password;
    channel.clients = [data.admin];
    channel.message = [];
    await this.chanRepository.save(channel);
  }

  /*
   * lookup user, then find out if he is in a channel
   * if the chan doesn't exist, create it, if not, join it with the correct password
   */
  async joinChannel(data: { username: string, channel: string , password: string}) {
    const user = await this.userService.getByUsername(data.username);
    const chan = await this.chanRepository.findOne({ name: data.channel});
    let auth = false;

    if (!chan)
    {
      await this.createChannel({ admin: data.username, name: data.channel, password: data.password });
      auth = true;
    }
    else if (chan.clients.includes(data.username))
    {
      ;
    }
    else if ((!chan.clients.includes(data.username)) &&
      (!chan.password || (chan.password === data.password)) )
    {
        chan.clients.push(data.username);
        await this.chanRepository.save(chan);
        auth = true;
    }
    else
    {
      return null;
    }
    if (!user.chanslist.includes(data.channel))
    {
      user.chanslist[user.chanslist.length] = data.channel;
    }
    await this.usersRepository.save(user);
    return (await this.chanRepository.findOne({ name: data.channel }));
  }

  async kickClient(data: { channel: string, username: string, tokick: string }) {
    const chan = await this.chanRepository.findOne({ name: data.channel });
    const user = await this.userService.getByUsername(data.tokick);
    if (chan.clients.includes(data.tokick))
    if (!chan || chan.admin !== data.username || !chan.clients.includes(data.tokick))
      throw 'You cannot perform this action';
    else
    {
      chan.clients.splice(chan.clients.indexOf(data.tokick), 1);
      if (user)
      {
        user.chanslist.splice(user.chanslist.indexOf(data.channel), 1);
        this.usersRepository.save(user);
      }
      this.chanRepository.save(chan);
    }
  }
}
