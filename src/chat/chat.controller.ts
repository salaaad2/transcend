import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import { LocalAuthenticationGuard } from 'src/authentication/localAuthentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
    ) {}

    @Get('channels')
    @UseGuards(JwtAuthenticationGuard)
    getChannels() {
      return this.chatService.getChannels();
    }

    @Post('messages')
    @UseGuards(JwtAuthenticationGuard)
    async getMessages(@Body() channel: {channel: string}) {
        const messages = await this.chatService.getAllMessages(channel.channel);
        console.log(messages);
        return messages;
    }
}
