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
    if (content.content !== "")
    {
      const message = this.messagesRepository.create({
        ...messageDto,
        channel: channel
      });
      await this.messagesRepository.save(message);
      return message;
    }
    else
      throw 'You cannot send blank message';
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
    const chanlist: Channel[] = [];
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

  async createChannel(data: { owner: string, name: string, password: string}) {
    const channel = new Channel();
    channel.name = data.name;
    channel.owner = data.owner;
    channel.admin = [data.owner];
    channel.password = data.password;
    channel.clients = [data.owner];
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

    if (!chan)
    {
      if (data.channel === "")
      {
        throw 'You cannot create a channel with a blank name';
      }
      await this.createChannel({ owner: data.username, name: data.channel, password: data.password });
    }
    else if (chan.clients.includes(data.username))
    {
      ;
    }
    else if ((!chan.clients.includes(data.username)) &&
      (!chan.password || (chan.password === data.password)))
    {
        chan.clients.push(data.username);
        await this.chanRepository.save(chan);
    }
    else if (chan.password && chan.password !== data.password)
    {
      throw 'Wrong password to join ' + data.channel;
    }
    if (!user.chanslist.includes(data.channel))
    {
      user.chanslist[user.chanslist.length] = data.channel;
    }
    await this.usersRepository.save(user);
    return (await this.chanRepository.findOne({ name: data.channel }));
  }

  async leaveChannel(data: { channel: string, username: string }) {
    const chan = await this.chanRepository.findOne({ name: data.channel });
    const user = await this.userService.getByUsername(data.username);
    if (chan && user)
    {
      chan.clients.splice(chan.clients.indexOf(data.username), 1);
      user.chanslist.splice(user.chanslist.indexOf(data.channel), 1);
      await this.usersRepository.save(user);
      await this.chanRepository.save(chan);
    }
    else
      throw data.username + ' is not part of ' + data.channel;
  }

  async promoteClient(data: { channel: string, client: string }) {
    const chan = await this.chanRepository.findOne({ name: data.channel });
    const user = await this.userService.getByUsername(data.client);
    if (chan && user)
    {
      if (!chan.admin.includes(data.client))
         chan.admin.push((data.client));
      await this.chanRepository.save(chan);
    }
    else
      throw data.client + ' is not part of ' + data.channel;
  }

  async demoteClient(data: { channel: string, client: string }) {
    const chan = await this.chanRepository.findOne({ name: data.channel });
    const user = await this.userService.getByUsername(data.client);
    if (chan && user)
    {
      if (chan.admin.includes(data.client))
        chan.admin.splice(chan.admin.indexOf(data.client), 1);
      await this.chanRepository.save(chan);
    }
    else
      throw data.client + ' is not part of ' + data.channel;
  }
  async muteClient(data: { channel: string, client: string }) {
    const chan = await this.chanRepository.findOne({ name: data.channel });
    const user = await this.userService.getByUsername(data.client);
    if (chan && user)
    {
      if (!chan.mutelist.includes(data.client))
         chan.mutelist.push((data.client));
      await this.chanRepository.save(chan);
    }
    else
      throw data.client + ' is not part of ' + data.channel;
  }

  async unmuteClient(data: { channel: string, client: string }) {
    const chan = await this.chanRepository.findOne({ name: data.channel });
    const user = await this.userService.getByUsername(data.client);
    if (chan && user)
    {
      if (chan.mutelist.includes(data.client))
        chan.mutelist.splice(chan.mutelist.indexOf(data.client), 1);
      await this.chanRepository.save(chan);
    }
    else
      throw data.client + ' is not part of ' + data.channel;
  }
}
