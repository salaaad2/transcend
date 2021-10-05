import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchService } from '../match/match.service';
import { UsersService } from '..//users/users.service';
import { ChatService } from '../chat/chat.service';
import { PongService } from '../pong/pong.service';
import { Room } from '../match/room.interface';

@WebSocketGateway({cors: true})
export class ServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  /////////////////
  // Connection //
  ////////////////

  @SubscribeMessage('connection')
  async handleConnection(socket: Socket) {
    socket.emit('connection', null);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(socket: Socket) {
    const username = Object.keys(this.tab).find(k => this.tab[k] === socket);
    if (username) {
    console.log(username + ' disconnected');
    delete this.tab[username];
    const user = await this.userService.getByUsername(username);
    user.status = 'offline';
    await this.userService.save(user);
    this.server.emit('status',{username, status:'offline'});
    }
  }

  @SubscribeMessage('login')
  async handleLogin(@MessageBody() username: string, @ConnectedSocket() socket: Socket) {
    if (!(username in this.tab))
    {
      this.tab[username] = socket;
      console.log(username + ' logged in');
      const user = await this.userService.getByUsername(username);
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
      const user = await this.userService.getByUsername(username);
      user.status = 'offline';
      await this.userService.save(user);
      this.server.emit('status', {username, status: 'offline'});
    }
  }

  ////////////
  //Profile//
  //////////

  @SubscribeMessage('request_set_username')
  async setUsername(@MessageBody() data: { realname:string, username:string },
                   @ConnectedSocket() socket: Socket) {
    try
    {
      await this.userService.setUsername(data.realname, data.username);
      this.server.emit('send_username_set', {
        realname: data.realname,
        username: data.username,
      })
    }
    catch(err)
    {
      socket.emit('send_error', err);
    }
  }

  @SubscribeMessage('addfriend')
  async handleAddFriend(@MessageBody() username: string, @ConnectedSocket() socket: Socket) {
    const f_socket = this.tab[username];
    const user = Object.keys(this.tab).find(k => this.tab[k] === socket);
    const f_user = await this.userService.getByUsername(username);

    if (f_socket) {
      f_socket.emit('notifications', ['friendrequest', user]);
    }
    this.userService.Request(f_user, 'friendrequest', user);
  }

  @SubscribeMessage('accept_friend')
  async AcceptFriend(@MessageBody() data: {username: string, notif: string}, @ConnectedSocket() socket: Socket) {
    const f_socket: Socket = this.tab[data.notif];
    const user = await this.userService.getByUsername(Object.keys(this.tab).find(k => this.tab[k] === socket));
    if (user.friendrequests.length == 0)
      socket.emit('notifications', ['clear_notifs', ""]);
    if (f_socket)
      f_socket.emit('notifications', ['accept_friend', data.username]);
  }

  @SubscribeMessage('reject_friend')
  async RejectFriend(@MessageBody() data: {username: string, notif: string}, @ConnectedSocket() socket: Socket) {
    const user = await this.userService.getByUsername(data.username);
    user.friendrequests.splice(user.friendrequests.findIndex(element => {return element == data.notif}, 1));
    this.userService.save(user);
    if (user.friendrequests.length == 0)
      socket.emit('notifications', ['clear_notifs', ""]);
  }

  @SubscribeMessage('gamerequest')
  async GameRequest(@MessageBody() data: any[], @ConnectedSocket() socket: Socket) {
    const f_socket: Socket = this.tab[data[0]];
    const user = Object.keys(this.tab).find(k => this.tab[k] === socket);

    f_socket.emit('notifications', ['game_request', user, data[1], data[2]]);
  }

  //////////
  // CHAT //
  //////////

  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() data: {
      channel: string,
      content: string
    },
    @ConnectedSocket() socket: Socket) {
    const username = Object.keys(this.tab).find((k) => this.tab[k] === socket);
    try{
      const res = await this.chatService.saveMessage({
        channel: data.channel,
        content: data.content
      }, username);
      this.server.sockets.emit('receive_message', res);
    }
    catch(e) {
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_all_messages')
  async requestAllMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: string) {
    const messages = await this.chatService.getAllMessages(channel);
    socket.emit('send_all_messages', messages);
  }

  @SubscribeMessage('request_join_channel')
  async joinChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { username: string, channel: string, password: string}) {
    try {
      const chan = await this.chatService.joinChannel({
        username: data.username,
        channel: data.channel,
        password: data.password
      });
      this.server.emit('send_channel_joined', chan.name, data.username, chan.owner,
                       chan.admin, chan.mutelist);
    }
    catch(e) {
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_join_private_channel')
  async joinPrivateChannel(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { src: string, dst: string }) {
    try {
      const chan = await this.chatService.joinPrivateChannel({
        src: data.src,
        dst: data.dst
      });
      this.server.emit('send_private_channel_joined', data.src, data.dst, chan.name);
    }
    catch(e) {
      socket.emit('send_error', e);
    }
  }

   @SubscribeMessage('request_get_channels')
  async getChannels(
    @ConnectedSocket() socket: Socket,
    @MessageBody() username: string) {
    const chanlist = await this.chatService.getChannels(username);
    socket.emit('send_channels', chanlist);
   }

   @SubscribeMessage('request_get_private_channels')
  async getPrivateChannels(
    @ConnectedSocket() socket: Socket,
    @MessageBody() username: string) {
    const chanlist = await this.chatService.getPrivateChannels(username);
    socket.emit('send_private_channels', chanlist);
   }

  @SubscribeMessage('request_get_channel_clients')
  async getChannelClients(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: string) {
    const clientsList = await this.chatService.getChannelClients(channel);
    socket.emit('send_channel_clients', clientsList);
  }

  @SubscribeMessage('request_promote_client')
  async promoteClient(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, client: string }) {
    try {
      await this.chatService.promoteClient(data);
      this.server.emit('send_promoted_client', data.channel, data.client);
    }
    catch(e){
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_demote_client')
  async demoteClient(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, client: string }) {
    try {
      await this.chatService.demoteClient(data);
      this.server.emit('send_demoted_client', data.channel, data.client);
    }
    catch(e){
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_mute_client')
  async muteClient(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, client: string }) {
    try {
      await this.chatService.muteClient(data);
      this.server.emit('send_muted_client', data.channel, data.client);
    }
    catch(e){
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_unmute_client')
  async unmutedClient(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, client: string }) {
    try {
      await this.chatService.unmuteClient(data);
      this.server.emit('send_unmuted_client', data.channel, data.client);
    }
    catch(e){
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_ban_client')
  async banClient(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, client: string }) {
    try {
      await this.chatService.banClient(data);
      this.server.emit('send_banned_client', data.channel, data.client);
    }
    catch(e){
      socket.emit('send_error', e);
    }
  }

  @SubscribeMessage('request_leave_channel')
  async kickClient(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, username:string }) {
    try {
      await this.chatService.leaveChannel({
        channel: data.channel,
        username: data.username
      });
      this.server.emit('send_left_channel', data.channel, data.username);
    }
    catch(e){
      socket.emit('send_error', e);
    }
  }

  ///////////
  // LOBBY //
  ///////////

  @SubscribeMessage('newplayer')
  async newplayer(@MessageBody() playername: string) {
    this.players.push(playername);
    if (this.players.length == 1) {
      this.id++;
      this.rooms[this.id] = ({id: this.id, start: false, end: false, Players: ["", ""],
                       ingame: false, p1position: 40, p2position: 40, p1direction: 0,
                       p2direction: 0, p1score: 0, p2score: 0,
                       countdown: 150, speed: 1, powerups: false, powerspecs: {
                         type: 0, x: -100, y: -100
                       }, spectators: [],
                       ballposition: {
                         x: 50, y: 50, dir: 1, coeff: 2
                       }
                      })
    }
    this.server.emit('nb_players', this.players.length);
  }

  @SubscribeMessage('newplayer2')
  async newplayer2(@MessageBody() data: any[]) {
    const socket1 = this.tab[data[0]];
    const socket2 = this.tab[data[1]];

    this.id++;
    this.rooms[this.id] = ({id: this.id, start: false, end: false, Players: [data[0], data[1]],
    ingame: false, p1position: 40, p2position: 40, p1direction: 0,
    p2direction: 0, p1score: 0, p2score: 0,
    countdown: 150, speed: data[3], powerups: data[2], powerspecs: {
      type: 0, x: -100, y: -100
    },spectators: [],
    ballposition: {
      x: 50, y: 50, dir: 1, coeff: 2
    }
   })
   socket1.emit('start_duel', this.id);
   socket2.emit('start_duel', this.id);
  }

  @SubscribeMessage('player_leave')
  async playerLeave(@MessageBody() playername: string) {
    this.players.splice(this.players.findIndex(element => element == playername), 1);
    this.server.emit('nb_players', this.players.length);
  }

  @SubscribeMessage('game_on')
  async GameOn(@MessageBody() playername: string) {
    let nb: number = this.players.findIndex(element => element == playername) % 2;
    let index: number = nb % 2;
    this.rooms[this.id].Players[index] = playername;
    let id = this.id;
    this.server.emit('active_players', {playername, index, id});
  }

  @SubscribeMessage('rm_from_lobby')
  async RemovePlayers(@MessageBody() playername: string) {
    this.players.splice(this.players.findIndex(element => element == playername), 1);
  }

  //////////
  // GAME //
  //////////

  @SubscribeMessage('game_start')
  async GiveRole(@ConnectedSocket() socket: Socket,
                 @MessageBody() data: {username: string, room: number}) {
    let rm: number = data.room;
    if (this.rooms[rm]) {
      let players: string[] = this.rooms[rm].Players;
      let avatars = [(await this.userService.getByUsername(players[0])).avatar, (await this.userService.getByUsername(players[1])).avatar]
      this.rooms[rm].ingame = true;
      if (this.rooms[rm].Players[0] == data.username)
        socket.emit('role', {players: players, role: 'player1', avatars: avatars});
      else if (this.rooms[rm].Players[1] == data.username)
        socket.emit('role', {players: players, role: 'player2', avatars: avatars});
      else {
        socket.emit('role', {players: players, role: 'spectator', avatars: avatars});
        this.rooms[rm].spectators.push(data.username);
      }
    }
  }

  @SubscribeMessage('send_key')
  async KeyEvent(@ConnectedSocket() socket: Socket,
                 @MessageBody() data: {key: string, role: string, room: number}) {
    let current = data.room;
    if (this.rooms[current] && data.role == 'player1' &&
      data.key == 'ArrowUp' &&
      this.rooms[current].p1position > 0) {
      this.rooms[current].p1position -= 1;
      this.rooms[current].p1direction = -1;
    }
    else if (this.rooms[current] && data.role == 'player1' &&
      data.key == 'ArrowDown' &&
      this.rooms[current].p1position < 80 - (this.rooms[current].powerspecs.type == -21 ? 10 : 0)) {
      this.rooms[current].p1position += 1;
      this.rooms[current].p1direction = 1;
    }
    else if (this.rooms[current] && data.role == 'player2' &&
      data.key == 'ArrowUp' &&
      this.rooms[current].p2position > 0) {
      this.rooms[current].p2position -= 1;
      this.rooms[current].p2direction = -1;
    }
    else if (this.rooms[current] && data.role == 'player2' &&
      data.key == 'ArrowDown' &&
      this.rooms[current].p2position < 80 - (this.rooms[current].powerspecs.type == -22 ? 10 : 0)) {
      this.rooms[current].p2position += 1;
      this.rooms[current].p2direction = 1;
    }
    else if (this.rooms[current] && data.role == 'player1' && data.key == 'f') {

      this.rooms[current].p2score = 5;
      this.rooms[current].countdown = 100;
      this.matchService.putmatch(this.rooms[current].Players[0], this.rooms[current].Players[1], this.rooms[current].p1score, this.rooms[current].p2score);
      this.rooms[current].ingame = false;
      this.rooms[current].end = true;
    }
    else if (this.rooms[current] && data.role == 'player2' && data.key == 'f') {
      this.rooms[current].p1score = 5;
      this.rooms[current].countdown = 100;
      this.matchService.putmatch(this.rooms[current].Players[0], this.rooms[current].Players[1], this.rooms[current].p1score, this.rooms[current].p2score);
      this.rooms[current].ingame = false;
      this.rooms[current].end = true;
    }
  }

  @SubscribeMessage('quit_game')
  async QuitGame(@MessageBody() data: any[]) {
    if (this.rooms[data[1]]) {
      data[0] == this.rooms[data[1]].Players[0] ? this.rooms[data[1]].p2score = 5 : this.rooms[data[1]].p1score = 5;
      this.rooms[data[1]].countdown = 100;
      this.matchService.putmatch(this.rooms[data[1]].Players[0], this.rooms[data[1]].Players[1], this.rooms[data[1]].p1score, this.rooms[data[1]].p2score);
      this.rooms[data[1]].ingame = false;
      this.rooms[data[1]].end = true;
    }
  }

  @SubscribeMessage('keyup')
  async KeyUp(@ConnectedSocket() socket: Socket,
    @MessageBody() data: {key: string, role: string, room: number}) {
    let current = data.room;
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
    }
  }

  @SubscribeMessage('game_info')
  async GameInfo(@MessageBody() room: number) {
    if (!this.interval[room]) {
      this.interval[room] = setInterval(() => {
        this.pongService.calculateBallPosition(this.rooms[room]);
        if (this.rooms[room].powerups)
          this.pongService.calculatePowerUp(this.rooms[room]);
        if (!this.rooms[room].countdown)
          this.server.emit('game', {p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
                                  bp: this.rooms[room].ballposition, pw: this.rooms[room].powerspecs})
        else
          this.server.emit('game', {p1score: this.rooms[room].p1score, start: this.rooms[room].start,
            end: this.rooms[room].end,
            p2score: this.rooms[room].p2score, countdown: this.rooms[room].countdown,
            p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
            bp: this.rooms[room].ballposition, pw: this.rooms[room].powerspecs})
      }, 10);
    }
  }

  @SubscribeMessage('stop_info')
  async GameStop(@MessageBody() room: number, @ConnectedSocket() socket: Socket) {
    const username = Object.keys(this.tab).find(k => this.tab[k] === socket);
    if (this.rooms[room] &&
      this.rooms[room].Players[0] != username &&
      this.rooms[room].Players[1] != username)
    {
      this.rooms[room].spectators.splice(
        this.rooms[room].spectators.findIndex((element) => {return (element == username)})
      )
      return ;
    }
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
