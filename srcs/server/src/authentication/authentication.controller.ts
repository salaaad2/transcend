import {
  Body,
  Req,
  Res,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Get, UseInterceptors, ClassSerializerInterceptor
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AvatarService } from '../avatar/avatar.service';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { UsersService } from '../users/users.service';
import { MatchService } from 'src/match/match.service';
import { Response } from 'express';
import { Api42AuthGuard, Api42AuthenticatedGuard } from './api42.guard';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly avatarService: AvatarService,
        private readonly usersService: UsersService,
        private readonly matchService: MatchService
    ) {}

    @UseGuards(Api42AuthGuard)
    @Get('log-in')
    logIn(@Req() req:any) {}

    @UseGuards(Api42AuthGuard)
    @Get('redirect')
    async redirect(@Req() req:any, @Res({passthrough: true}) res:Response) {
        if (req.user) {
            const token = this.authenticationService.login(req.user);
            res.cookie('access_token', token.acess_token, {
                httpOnly: false,
            });
            const cookie = this.authenticationService.getCookieWithJwtToken(req.user.id);
            req.res.setHeader('Set-Cookie', cookie);
            res.status(302).redirect('https://localhost:4000/');
        }
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get('logged')
    async logged(@Req() req:any) {
        const user = req.user;
        return user;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        return user;
    }

    @UseGuards(JwtAuthenticationGuard)
    @HttpCode(200)
    @Post('log-out')
    async logOut(@Req() request: RequestWithUser) {
        const cookie = await this.authenticationService.getCookieForLogOut();
        request.res.setHeader('Set-Cookie', cookie);
        return cookie;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('profile2')
    async getProfile(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        let data = await this.usersService.getByUsername(user.username);
        let match = await this.matchService.getmatches(user.username);
        let users = await this.usersService.getEveryone();
        users = users.sort((a,b) => (a.elo < b.elo) ? 1 : ((b.elo < a.elo) ? -1 : 0));
        let rank = users.findIndex((element) => {return (element.username == user.username)});
        let ret = {
          "id": data.id,
          "username": data.username,
          "wins": data.wins,
          "losses": data.losses,
          "avatar": data.avatar,
          "matches": match,
          "elo": data.elo,
          "current": request.user,
          "rank": rank + 1,
          "friendrequests": data.friendrequests,
          "friendlist": data.friendlist,
          "status": data.status,
        }
        return {ret};
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('addfriend')
    async addFriend(@Body() users: {user1: string, user2: string}) {
        await this.usersService.addFriend(users.user1, users.user2);
        await this.usersService.addFriend(users.user2, users.user1);
        const user = await this.usersService.getByUsername(users.user1);
        user.friendrequests.splice(user.friendrequests.findIndex(element => {return element == user.username}, 1));
        await this.usersService.save(user);
        return (user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('delfriend')
    async delFriend(@Body() users: {user1: string, user2: string}) {
        await this.usersService.delFriend(users.user1, users.user2);
        await this.usersService.delFriend(users.user2, users.user1);
        return ;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('block')
    async Block(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        this.usersService.block(user.username, request);
        return (request.user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('unblock')
    async Unblock(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        this.usersService.unblock(user.username, request);
        return (request.user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get('all')
    async getAllUsers() {
        let data = await this.usersService.getEveryone();
        let ret: {id: number, username: string, wins: number, losses: number, avatar: string, elo: number}[] = [];
        for (let i = 0 ; i < data.length ; i++ ) {
            ret.push({
                "id": data[i].id,
                "username": data[i].username,
                "wins": data[i].wins,
                "losses": data[i].losses,
                "avatar": data[i].avatar,
                "elo": data[i].elo,
            })
        }
        return ret;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('friends')
    async getFriends(@Body() user: {username: string}) {
        const user2 = await this.usersService.getByUsername(user.username)
        let list = user2.friendlist;
        let ret: {username: string, avatar: string, status: string}[] = [];
        for (let i = 0 ; i < list.length ; i++ ) {
            let data = await this.usersService.getByUsername(list[i]);
            ret.push({
                'username': data.username,
                'avatar': data.avatar,
                'status': data.status
            })
        }
        return ret;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('update_avatar')
    async updateData(@Req() request: RequestWithUser, @Body() data: {data: string}) {
        this.usersService.updateAvatar(request, data.data);
    }
}
