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
    delete this.tab[username];
    const user = await this.userService.getByUsername(username);
    user.status = 'offline';
    await this.userService.save(user);
    this.server.emit('status',{username, status:'offline'});
    }
  }

  @SubscribeMessage('login')
  async handleLogin(@MessageBody() username: string, @ConnectedSocket() socket: Socket) {
    const user = await this.userService.getByUsername(username);
    user.status = 'online';
    if (!(username in this.tab))
    {
      this.tab[username] = socket;
      this.server.emit('status', {username, status:'online'});
    }
    await this.userService.save(user);
  }

  @SubscribeMessage('logout')
  async handleLogout(@MessageBody() username: string, @ConnectedSocket() socket: Socket) {
    if ((username in this.tab))
    {
      delete this.tab[username];
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
  async setUsername(@MessageBody() data: { realname:string, username:string, avatar: string },
                   @ConnectedSocket() socket: Socket) {
    try
    {
      await this.userService.setUsername(data.realname, data.username);
      await this.userService.setAvatar({realname: data.realname, avatar: data.avatar});
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
    if (user.friendrequests.length == 0 && user.pv_msg_notifs.length == 0)
      socket.emit('notifications', ['clear_notifs', ""]);
    if (f_socket)
      f_socket.emit('notifications', ['accept_friend', data.username]);
  }

  @SubscribeMessage('reject_friend')
  async RejectFriend(@MessageBody() data: {username: string, notif: string}, @ConnectedSocket() socket: Socket) {
    const user = await this.userService.getByUsername(data.username);
    user.friendrequests.splice(user.friendrequests.findIndex(element => {return element == data.notif}, 1));
    this.userService.save(user);
    if (user.friendrequests.length == 0 && user.pv_msg_notifs.length == 0)
      socket.emit('notifications', ['clear_notifs', ""]);
  }

  @SubscribeMessage('gamerequest')
  async GameRequest(@MessageBody() data: any[], @ConnectedSocket() socket: Socket) {
    const f_socket: Socket = this.tab[data[0]];
    const user = Object.keys(this.tab).find(k => this.tab[k] === socket);

    if (f_socket)
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

  @SubscribeMessage('request_get_banned_clients')
  async getBannedClients(
    @ConnectedSocket() socket: Socket,
    @MessageBody() channel: string) {
    const banlist = await this.chatService.getBannedClients(channel);
    socket.emit('send_banned_clients', banlist);
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

  @SubscribeMessage('request_ban_from_chan')
  async banFromChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { channel: string, client: string, toggle: boolean }) {
    try {
      await this.chatService.banClient(data);
      this.server.emit('send_chan_banned_client', data.channel, data.client, data.toggle);
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

  @SubscribeMessage('request_destroy_channel')
  async destroyChannel(
    @ConnectedSocket() socket: Socket,
  @MessageBody() data: {channel: string}) {
    try {
      this.server.emit('send_destroy_channel', data.channel);
    }
    catch(e) {
      socket.emit('send error', e);
    }
  }

  @SubscribeMessage('pv_msg')
  async pvMsg(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const user0 = await this.userService.getByUsername(Object.keys(this.tab).find(k => this.tab[k] === socket));
    const users = data[0].split('&');
    if (user0.username === users[0]) {
      const f_socket = this.tab[users[1]];
      if (f_socket)
        f_socket.emit('notifications', ['message', users[0], data[1]]);
      const user1 = await this.userService.getByUsername(users[1]);
      if (!(user1.pv_msg_notifs.find(element => element === users[0])))
      {
        user1.pv_msg_notifs.push(users[0]);
        await this.userService.save(user1);
      }
    }
    else {
      const f_socket = this.tab[users[0]];
      if (f_socket)
        f_socket.emit('notifications', ['message', users[1], data[1]]);
      if (!(user0.pv_msg_notifs.find(element => element === users[1])))
      {
        user0.pv_msg_notifs.push(users[1]);
        await this.userService.save(user0);
      }
    }
  }

  @SubscribeMessage('remove_msg')
  async removeMsg(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const user = await this.userService.getByUsername(data[0]);
    const users = data[1].split('&');
    const f_user = user.username === users[0] ? users[1] : users[0];
    user.pv_msg_notifs.splice(user.pv_msg_notifs.findIndex(element => {return element == f_user}, 1));
    this.userService.save(user);
    socket.emit('notifications', ['rm_msg', f_user]);
    if (user.friendrequests.length == 0 && user.pv_msg_notifs.length == 0)
      socket.emit('notifications', ['clear_notifs', ""]);
  }

  ///////////
  // LOBBY //
  ///////////

  @SubscribeMessage('newplayer')
  async newplayer(@MessageBody() playername: string) {
    this.players.push(playername);
    if (this.players.length == 1) {
      this.id++;
      this.rooms[this.id] = ({sockets: [], id: this.id, start: false, end: false, custom: false, Players: ["", ""],
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
    this.rooms[this.id] = ({sockets: [], id: this.id, start: false, end: false, custom: true, Players: [data[0], data[1]],
    ingame: false, p1position: 40, p2position: 40, p1direction: 0,
    p2direction: 0, p1score: 0, p2score: 0,
    countdown: 150, speed: data[3], powerups: data[2], powerspecs: {
      type: 0, x: -100, y: -100
    },spectators: [],
    ballposition: {
      x: 50, y: 50, dir: 1, coeff: 2
    }
   })
   this.rooms[this.id].sockets.push({user: data[0], socket: socket1});
   this.rooms[this.id].sockets.push({user: data[1], socket: socket2});
   socket1.emit('start_duel', this.id);
   socket2.emit('start_duel', this.id);
  }

  @SubscribeMessage('player_leave')
  async playerLeave(@MessageBody() playername: string) {
    this.players.splice(this.players.findIndex(element => element == playername), 1);
    this.server.emit('nb_players', this.players.length);
  }

  @SubscribeMessage('game_on')
  async GameOn(@MessageBody() playername: string, @ConnectedSocket() socket: Socket) {
    let nb: number = this.players.findIndex(element => element == playername) % 2;
    let index: number = nb % 2;
    this.rooms[this.id].Players[index] = playername;
    this.rooms[this.id].sockets.push({user: playername, socket: socket});
    let id = this.id;
    socket.emit('active_players', {playername, index, id});
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
    if (this.rooms[rm] && this.rooms[rm].Players[0] != this.rooms[rm].Players[1]) {
      try
      {
        let players: string[] = this.rooms[rm].Players;
        let avatars = [(await this.userService.getByUsername(players[0])).avatar, (await this.userService.getByUsername(players[1])).avatar]
        this.rooms[rm].ingame = true;
        const user = await this.userService.getByUsername(data.username);
        if (user)
          user.status = "ingame";
        await this.userService.save(user);
        if (this.rooms[rm].Players[0] == data.username) {
          socket.emit('role', {players: players, role: 'player1', avatars: avatars});
          this.server.emit('status', {username: data.username, status:'ingame'});
        }
        else if (this.rooms[rm].Players[1] == data.username) {
          socket.emit('role', {players: players, role: 'player2', avatars: avatars});
          this.server.emit('status', {username: data.username, status:'ingame'});
        }
        else {
          socket.emit('role', {players: players, role: 'spectator', avatars: avatars});
          this.rooms[rm].sockets.push({user: data.username, socket: socket});
          this.rooms[rm].spectators.push(data.username);
        }
      }
      catch(err)
      {
        socket.emit('send_error', err);
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
      this.rooms[current].speed = 0;
      this.rooms[current].ingame = false;
      this.rooms[current].end = true;
    }
    else if (this.rooms[current] && data.role == 'player2' && data.key == 'f') {
      this.rooms[current].p1score = 5;
      this.rooms[current].countdown = 100;
      this.rooms[current].speed = 0;
      this.rooms[current].ingame = false;
      this.rooms[current].end = true;
    }
  }

  @SubscribeMessage('quit_game')
  async QuitGame(@MessageBody() data: any[], @ConnectedSocket() socket: Socket) {
    const username = Object.keys(this.tab).find((k) => this.tab[k] === socket);
    if (this.rooms[data[1]] &&
      this.rooms[data[1]].Players[0] != username &&
      this.rooms[data[1]].Players[1] != username)
    {
      this.rooms[data[1]].spectators.splice(
        this.rooms[data[1]].spectators.findIndex((element) => {return (element == username)})
      )
      for (let i = 0 ; i < this.rooms[data[1]].sockets.length ; i++) {
        if (this.rooms[data[1]].sockets[i].user == username) {
          this.rooms[data[1]].sockets.splice(i, 1);
          return ;
        }
      }
      return ;
    }
    else if (this.rooms[data[1]] && (username == this.rooms[data[1]].Players[0] || username == this.rooms[data[1]].Players[1])) {
      clearInterval(this.interval[data[1]]);
      if (this.rooms[data[1]].p1score != 5 && this.rooms[data[1]].p2score != 5)
        data[0] === this.rooms[data[1]].Players[0] ? this.rooms[data[1]].p2score = 5 : this.rooms[data[1]].p1score = 5;
      this.rooms[data[1]].countdown = 100;
      this.rooms[data[1]].speed = 0;
      this.rooms[data[1]].ingame = false;
      this.rooms[data[1]].end = true;
      if (username == this.rooms[data[1]].Players[0])
        await this.matchService.putmatch(this.rooms[data[1]].Players[0], this.rooms[data[1]].Players[1],
          this.rooms[data[1]].p1score, this.rooms[data[1]].p2score, this.rooms[data[1]].custom);
      for (let i = 0 ; i < this.rooms[data[1]].sockets.length ; i++) {
        if(this.rooms[data[1]])
        {
          this.rooms[data[1]].sockets[i].socket.emit('game',
                                                     {p1: this.rooms[data[1]].p1position, p2: this.rooms[data[1]].p2position,
                                                      bp: this.rooms[data[1]].ballposition, countdown: 100, end: true});
        }
      }
        setTimeout(() => {delete this.rooms[data[1]]}, 500);
  }
    const user = await this.userService.getByUsername(username);
    if (user)
    {
      user.status = "online";
      this.server.emit('status', {username, status:"online"} );
      await this.userService.save(user);
    }
  }

  @SubscribeMessage('keyup')
  async KeyUp(@ConnectedSocket() socket: Socket,
    @MessageBody() data: {key: string, role: string, room: number}) {
    let current = data.room;
    if (this.rooms[current]) {
      if (data.role == 'player1' &&
      (data.key == 'ArrowUp' || data.key == 'ArrowDown')) {
        this.rooms[current].p1direction = 0;
      }
      if (data.role == 'player2' &&
      (data.key == 'ArrowUp' || data.key == 'ArrowDown')) {
        this.rooms[current].p2direction = 0;
      }
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
    if (this.rooms[room])
    {
      if (!this.interval[room]) {
        this.interval[room] = setInterval(() => {
          this.pongService.calculateBallPosition(this.rooms[room]);
          if (this.rooms[room] && this.rooms[room].powerups)
          {
            this.pongService.calculatePowerUp(this.rooms[room]);
          }
          if (this.rooms[room] && !this.rooms[room].countdown) {
            for (let i = 0 ; i < this.rooms[room].sockets.length ; i++) {
              this.rooms[room].sockets[i].socket.emit('game', {p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
                                                               bp: this.rooms[room].ballposition, pw: this.rooms[room].powerspecs})
            }
          }
          else if (this.rooms[room])
            for (let i = 0 ; i < this.rooms[room].sockets.length ; i++) {
              this.rooms[room].sockets[i].socket.emit('game', {p1score: this.rooms[room].p1score, start: this.rooms[room].start,
                                                               end: this.rooms[room].end,
                                                               p2score: this.rooms[room].p2score, countdown: this.rooms[room].countdown,
                                                               p1: this.rooms[room].p1position, p2: this.rooms[room].p2position,
                                                               bp: this.rooms[room].ballposition, pw: this.rooms[room].powerspecs})
            }
        }, 10);
      }
    }
  }

  // @SubscribeMessage('stop_info')
  // async GameStop(@MessageBody() room: number, @ConnectedSocket() socket: Socket) {
  //   clearInterval(this.interval[room]);
  //   if (this.rooms[room] && username === this.rooms[room].Players[0]) {
  //     delete this.rooms[room];
  //   }
  // }

  ///////////////
  // SPECTATOR //
  ///////////////

  @SubscribeMessage('get_games')
  async GetGames(@ConnectedSocket() socket: Socket) {
    const data: {id: number, player1: string, player2: string, p1score: number, p2score: number, ingame: boolean}[] = []
    for (let i in this.rooms) {
      data.push({id: this.rooms[i].id, player1: this.rooms[i].Players[0],
                 player2: this.rooms[i].Players[1], p1score: this.rooms[i].p1score, p2score: this.rooms[i].p2score, ingame: this.rooms[i].ingame})
    }
    socket.emit('live', data);
    setInterval(() => {
      for (let i in this.rooms) {
        data.push({id: this.rooms[i].id, player1: this.rooms[i].Players[0],
                   player2: this.rooms[i].Players[1], p1score: this.rooms[i].p1score, p2score: this.rooms[i].p2score, ingame: this.rooms[i].ingame})
      }
      socket.emit('live', data);
      data.splice(0, data.length)
    }, 2000);
  }

  @SubscribeMessage('get_spectators')
  async GetSpectators(@ConnectedSocket() socket: Socket,
                      @MessageBody() room: number) {
    if (this.rooms[room]) {
      socket.emit('spectators', this.rooms[room].spectators);
      setInterval(() => {
        if (this.rooms[room])
        socket.emit('spectators', this.rooms[room].spectators);
      }, 2000)
    }
  }

  @SubscribeMessage('request_logout_client')
    async logOutRequested(@ConnectedSocket() socket: Socket,
                    @MessageBody() username: string) {
      this.server.emit('log_out', username);
  }

  @SubscribeMessage('request_mod_client')
    async modRequested(@ConnectedSocket() socket: Socket,
                    @MessageBody() username: string) {
      this.server.emit('mod_client', username);
  }
}
