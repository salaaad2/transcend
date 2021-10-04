import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { string, StringSchema } from '@hapi/joi';
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


@WebSocketGateway({cors: true})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UsersService,
    private readonly matchService: MatchService,
  ) {
  }

  @SubscribeMessage('connection')
  async handleConnection(socket: Socket) {
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(socket: Socket) {
  }

}
