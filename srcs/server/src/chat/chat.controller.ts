import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import { LocalAuthenticationGuard } from 'src/authentication/localAuthentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
    ) {}

    // @Get('channels')
    // @UseGuards(JwtAuthenticationGuard)
    // getChannels() {
    //   return this.chatService.getChannels();
    // }

    @Post('messages')
    @UseGuards(JwtAuthenticationGuard)
    async getMessages(@Body() channel: {channel: string},
                      @Req() request: RequestWithUser) {
        if (request.user.ismod) {
            const messages = await this.chatService.getAllMessages(channel.channel);
            return messages;
        } else {
            throw new HttpException('insufficient rights', HttpStatus.I_AM_A_TEAPOT);
        }
    }

    @Post('channels')
    @UseGuards(JwtAuthenticationGuard)
    async getChannels(@Body() u: {username: string},
                      @Req() request: RequestWithUser) {
        let ret: {name: string,
                  owner: string,
                  admin: string[],
                  mutelist: string[],
                  banlist: string[],
                  password: string,
                  clients: string[]}[] = [];

        if (request.user.ismod) {
            const chanlist = await this.chatService.getAllChannels();
            for (const chan of chanlist) {
                ret.push({
                    "name": chan.name,
                    "owner": chan.owner,
                    "admin": chan.admin,
                    "mutelist": chan.mutelist,
                    "banlist": chan.banlist,
                    "password": chan.password,
                    "clients": chan.clients,
                });
            }
        }
        return ret;
    }

    @Post('deletechan')
    @UseGuards(JwtAuthenticationGuard)
    async deleteChan(@Body() data: {channel: string},
                      @Req() request: RequestWithUser) {
        if (request.user.id !== 1) {
            return ;
        }
        await this.chatService.deleteChannel(data.channel);
    }

}
