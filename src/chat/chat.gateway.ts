import { StringSchema } from '@hapi/joi';
import { Param } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { useContainer } from 'class-validator';
import { SocketAddress } from 'net';
import { use } from 'passport';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';

interface Room {
  id: number;
  Players : string[];
  ingame: boolean;
  p1position: number;
  p2position: number;
  ballposition: number[];
}

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UsersService,
  ) {
  }

  public tab: {[key: string]: Socket} = {}
  public players: string[] = [];
  public rooms: Room[] = [];
  public interval: any[] = [];

  @SubscribeMessage('connection')
  async handleConnection(socket: Socket) {
    console.log('new client connected');
    socket.emit('connection', null);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(socket: Socket) {
    var username = Object.keys(this.tab).find(k => this.tab[k] === socket);
    if (username) {
    console.log(username + ' disconnected');
    delete this.tab[username];
    var user = await this.userService.getByUsername(username);
    user.status = 'offline';
    await this.userService.save(user);
    this.server.emit('status',{username, status:'offline'});
    }
    else
      console.log('disconnect');
  }

  @SubscribeMessage('login')
  async handleLogin(@MessageBody() username: string, @ConnectedSocket() socket: Socket) {
    if (!(username in this.tab))
    {
      this.tab[username] = socket;
      console.log(username + ' logged in');
      var user = await this.userService.getByUsername(username);
      user.status = 'online';
      await this.userService.save(user);
      this.server.emit('status', {username, status:'online'});
    }
  }

  @SubscribeMessage('logout')
  async handleLogout(@MessageBody() username: string, @ConnectedSocket() socket: Socket) {
    if ((username in this.tab))
    {
      delete this.tab[username];
      console.log(username + ' logged out');
      var user = await this.userService.getByUsername(username);
      user.status = 'offline';
      await this.userService.save(user);
      this.server.emit('status', {username, status: 'offline'});
    }
  }


  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() message: {
      channel: string,
      content: string
    },
    @ConnectedSocket() socket: Socket,
  ) {
    var username = Object.keys(this.tab).find(k => this.tab[k] === socket);
    const res = await this.chatService.saveMessage(message, username);
    console.log(res);
    this.server.sockets.emit('receive_message', res);
  }

  @SubscribeMessage('request_all_messages')
  async requestAllMessages(
    @ConnectedSocket() socket: Socket, 
    @MessageBody() channel: string
  ) {
    const messages = await this.chatService.getAllMessages(channel);
 
    console.log(messages);
    socket.emit('send_all_messages', messages);
  }

  @SubscribeMessage('create_channel')
  async createChannel(@MessageBody() data: { admin: string, name: string, password: string}) {
    await this.chatService.createChannel(data);
    this.server.emit('channel_created', data);
  }

  @SubscribeMessage('newplayer')
  async newplayer(@MessageBody() playername: string) {
    this.players.push(playername);
    console.log(this.players, this.players.length);
    this.server.emit('nb_players', this.players.length);
  }

  @SubscribeMessage('player_leave')
  async playerLeave(@MessageBody() playername: string) {
    console.log('leave: ', playername);
    console.log('index: ', this.players.findIndex(element => element == playername));
    this.players.splice(this.players.findIndex(element => element == playername), 1);
    console.log('after leave: ', this.players);
    this.server.emit('nb_players', this.players.length);
  }

  @SubscribeMessage('game_on')
  async GameOn(@MessageBody() playername: string) {
    var nb: number = this.players.findIndex(element => element == playername) % 2;
    var index: number = nb % 2;
    console.log('player: ', playername, index);
    if (this.rooms.length == 0) {
      for (var i = 0 ; i < 512 ; i++) {
        this.rooms.push({id: i + 1, Players: ["", ""], 
        ingame: false, p1position: 40, p2position: 40, ballposition: [50, 50]});
      }
    }
    for (var i = 0; i < this.rooms.length ; i++) {
      if (this.rooms[i].ingame == false) {
        this.rooms[i].Players[index] = playername;
        i++;
        this.server.emit('active_players', {playername, index, i});
        return ;
      }
    }
  }

  @SubscribeMessage('rm_from_lobby')
  async RemovePlayers(@MessageBody() playername: string) {
    console.log('remove');
    this.players.splice(this.players.findIndex(element => element == playername), 1);
  }

  @SubscribeMessage('game_start')
  async GiveRole(@ConnectedSocket() socket: Socket,
                @MessageBody() data: {username: string, room: number}) {
    var rm: number = data.room - 1;
    var players: string[] = this.rooms[rm].Players;
    this.rooms[rm].ingame = true;
    if (this.rooms[rm].Players[0] == data.username)
      socket.emit('role', {players: players, role: 'player1'});
    else if (this.rooms[rm].Players[1] == data.username)
      socket.emit('role', {players: players, role: 'player2'});
    else
      socket.emit('role', {players: players, role: 'spectator'});
  }

  @SubscribeMessage('send_key')
  async KeyEvent(@ConnectedSocket() socket: Socket,
                  @MessageBody() data: {key: string, role: string, room: number}) {
    let current = data.room;
    if (data.role == 'player1' && data.key == 'ArrowUp' && this.rooms[current].p1position > 0)
      --this.rooms[current].p1position;
    if (data.role == 'player1' && data.key == 'ArrowDown' && this.rooms[current].p1position < 80)
      ++this.rooms[current].p1position;
    if (data.role == 'player2' && data.key == 'ArrowUp' && this.rooms[current].p2position > 0)
      --this.rooms[current].p2position, 2;
    if (data.role == 'player2' && data.key == 'ArrowDown' && this.rooms[current].p2position < 80)
      ++this.rooms[current].p2position, 2;
  }

  @SubscribeMessage('game_info')
  async GameInfo(@MessageBody() room: number) {
    if (!this.interval[room]) {
    this.interval[room] = setInterval(() => {
      this.server.emit('game', {p1: this.rooms[room].p1position, p2: this.rooms[room].p2position, 
        bp: this.rooms[room].ballposition})
    }, 20);
    }
  }

  @SubscribeMessage('stop_info')
  async GameStop(@MessageBody() room: number) {
    clearInterval(this.interval[room]);
  }

  // @SubscribeMessage('get_channels')
  // async getChannels() {
  //   await this.chatService.getChannels();
  // }

  // @SubscribeMessage('test')
  // async test1(
  //   @MessageBody() content: string, @ConnectedSocket() socket: Socket
  // )
  // {
  //   console.log(content)
  //   this.server.emit('test', content);
  // }
}