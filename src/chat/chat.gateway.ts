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
import { MatchService } from 'src/match/match.service';
import { UsersService } from 'src/users/users.service';
import { ChatService } from './chat.service';
import { PongService } from './pong.service';

interface Room {
  id: number;
  start: boolean;
  end: boolean;
  Players : string[];
  ingame: boolean;
  p1position: number;
  p2position: number;
  p1score: number;
  p2score: number;
  p1direction: number;
  p2direction: number;
  countdown: number;
  spectators: string[];
  ballposition: {
    x: number;
    y: number;
    dir: number;
    coeff: number;
  };
}

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UsersService,
    private readonly pongService: PongService,
    private readonly matchService: MatchService,
  ) {
  }

  public tab: {[key: string]: Socket} = {}
  public players: string[] = [];
  public rooms: {[key: number]: Room} = {}
  public interval: any[] = [];
  public id: number = 0;

  /////////////
  // GENERAL //
  /////////////

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

  //////////
  // CHAT //
  //////////

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

  ///////////
  // LOBBY //
  ///////////

  @SubscribeMessage('newplayer')
  async newplayer(@MessageBody() playername: string) {
    this.players.push(playername);
    console.log(this.players, this.players.length);
    if (this.players.length == 1) {
      this.id++;
      this.rooms[this.id] = ({id: this.id, start: false, end: false, Players: ["", ""], 
                       ingame: false, p1position: 40, p2position: 40, p1direction: 0, 
                       p2direction: 0, p1score: 0, p2score: 0,
                       countdown: 150, spectators: [],
                       ballposition: {
                         x: 50, y: 50, dir: 1, coeff: 2
                       }
                      })
    }
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
    this.rooms[this.id].Players[index] = playername;
    var id = this.id;
    this.server.emit('active_players', {playername, index, id});
  }

  @SubscribeMessage('rm_from_lobby')
  async RemovePlayers(@MessageBody() playername: string) {
    console.log('remove');
    this.players.splice(this.players.findIndex(element => element == playername), 1);
  }

  //////////
  // GAME //
  //////////

  @SubscribeMessage('game_start')
  async GiveRole(@ConnectedSocket() socket: Socket,
                 @MessageBody() data: {username: string, room: number}) {
    var rm: number = data.room;
    if (this.rooms[rm]) {
      console.log('room', this.rooms[rm]);
      var players: string[] = this.rooms[rm].Players;
      this.rooms[rm].ingame = true;
      if (this.rooms[rm].Players[0] == data.username)
        socket.emit('role', {players: players, role: 'player1'});
      else if (this.rooms[rm].Players[1] == data.username)
        socket.emit('role', {players: players, role: 'player2'});
      else {
        socket.emit('role', {players: players, role: 'spectator'});
        this.rooms[rm].spectators.push(data.username);
      }
    }
  }

  @SubscribeMessage('send_key')
  async KeyEvent(@ConnectedSocket() socket: Socket,
                 @MessageBody() data: {key: string, role: string, room: number}) {
    let current = data.room;
    if (data.role == 'player1' &&
      data.key == 'ArrowUp' &&
      this.rooms[current].p1position > 0) {
      this.rooms[current].p1position -= 1;
      this.rooms[current].p1direction = -1;
    }
    if (data.role == 'player1' &&
      data.key == 'ArrowDown' &&
      this.rooms[current].p1position < 80) {
      this.rooms[current].p1position += 1;
      this.rooms[current].p1direction = 1;
    }
    if (data.role == 'player2' &&
      data.key == 'ArrowUp' &&
      this.rooms[current].p2position > 0) {
      this.rooms[current].p2position -= 1;
      this.rooms[current].p2direction = -1;
    }
    if (data.role == 'player2' &&
      data.key == 'ArrowDown' &&
      this.rooms[current].p2position < 80) {
      this.rooms[current].p2position += 1;
      this.rooms[current].p2direction = 1;
    }
    if (data.role == 'player1' && data.key == 'f') {

      this.rooms[current].p2score = 5;
      this.rooms[current].countdown = 100;
      this.matchService.putmatch(this.rooms[current].Players[0], this.rooms[current].Players[1], this.rooms[current].p1score, this.rooms[current].p2score);
      this.rooms[current].ingame = false;
      this.rooms[current].end = true;
    }
    if (data.role == 'player2' && data.key == 'f') {
      this.rooms[current].p1score = 5;
      this.rooms[current].countdown = 100;
      this.matchService.putmatch(this.rooms[current].Players[0], this.rooms[current].Players[1], this.rooms[current].p1score, this.rooms[current].p2score);
      this.rooms[current].ingame = false;
      this.rooms[current].end = true;
    }
  }

  @SubscribeMessage('keyup')
  async KeyUp(@ConnectedSocket() socket: Socket,
    @MessageBody() data: {key: string, role: string, room: number}) {
    let current = data.room;
    console.log(data);
    if (data.role == 'player1' &&
      (data.key == 'ArrowUp' || data.key == 'ArrowDown')) {
        this.rooms[current].p1direction = 0;
    }
    if (data.role == 'player2' &&
    (data.key == 'ArrowUp' || data.key == 'ArrowDown')) {
      this.rooms[current].p2direction = 0;
    }
    }


  @SubscribeMessage('countdown')
  async Countdown(@MessageBody() room: number) {
    while (this.rooms[room].countdown) {
      setTimeout(() => this.rooms[room].countdown -= 1);
      console.log(this.rooms[room].countdown);
    }
  }

  @SubscribeMessage('game_info')
  async GameInfo(@MessageBody() room: number) {
    if (!this.interval[room]) {
      this.interval[room] = setInterval(() => {
        this.pongService.calculateBallPosition(this.rooms[room]);
        if (!this.rooms[room].countdown)
          this.server.emit('game', {p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
                                  bp: this.rooms[room].ballposition})
        else
          this.server.emit('game', {p1score: this.rooms[room].p1score, start: this.rooms[room].start,
            end: this.rooms[room].end,
            p2score: this.rooms[room].p2score, countdown: this.rooms[room].countdown,
            p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
            bp: this.rooms[room].ballposition})
      }, 20);
    }
  }

  @SubscribeMessage('stop_info')
  async GameStop(@MessageBody() room: number, @ConnectedSocket() socket: Socket) {
    var username = Object.keys(this.tab).find(k => this.tab[k] === socket);
    if (this.rooms[room] && 
      this.rooms[room].Players[0] != username && 
      this.rooms[room].Players[1] != username)
    {
      this.rooms[room].spectators.splice(
        this.rooms[room].spectators.findIndex((element) => {return (element == username)})
      )
      return ;
    }
    console.log('erase');
    clearInterval(this.interval[room]);

    if (this.rooms[room]) {
      this.server.emit('game', {p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
        bp: this.rooms[room].ballposition, countdown: -1});
      delete this.rooms[room];
    }
  }

  ///////////////
  // SPECTATOR //
  ///////////////

  @SubscribeMessage('get_games')
  async GetGames(@ConnectedSocket() socket: Socket) {
    socket.emit('live', this.rooms);
    setInterval(() => {
      socket.emit('live', this.rooms);
    }, 2000);
  }

  @SubscribeMessage('get_spectators')
  async GetSpectators(@ConnectedSocket() socket: Socket, @MessageBody() room: number) {
    if (this.rooms[room]) {
      socket.emit('spectators', this.rooms[room].spectators);
      setInterval(() => {
        if (this.rooms[room])
        socket.emit('spectators', this.rooms[room].spectators);
      }, 2000)
    }
  }
}
