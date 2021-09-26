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
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { UsersService } from '../users/users.service';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { MatchService } from 'src/match/match.service';


@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly avatarService: AvatarService,
        private readonly usersService: UsersService,
        private readonly matchService: MatchService
    ) {}

    @Post('register')
    async register(@Body() registrationData: RegisterDto)
    {
        console.log('register', registrationData);
        return this.authenticationService.register(registrationData);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-in')
    async logIn(@Req() request: RequestWithUser) {
        const {user} = request;
        const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
        request.res.setHeader('Set-Cookie', cookie);
        return user;
    }

    @HttpCode(200)
    // @UseGuards(JwtAuthenticationGuard)
    @Post('log-out')
    async logOut(@Req() request: RequestWithUser) {
        const cookie = this.authenticationService.getCookieForLogOut();
        request.res.setHeader('Set-Cookie', cookie);
        return cookie;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('profile2')
    async getProfile(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        var data = await this.usersService.getByUsername(user.username);
        var match = await this.matchService.getmatches(user.username);
        var users = await this.usersService.getEveryone();
        users = users.sort((a,b) => (a.elo < b.elo) ? 1 : ((b.elo < a.elo) ? -1 : 0));
        var rank = users.findIndex((element) => {return (element.username == user.username)});
        var ret = {
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
        }
        return {ret};
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('addfriend')
    async addFriend(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        await this.usersService.addFriend(user.username, request.user.username);
        await this.usersService.addFriend(request.user.username, user.username);
        return (request.user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('delfriend')
    async delFriend(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        await this.usersService.delFriend(user.username, request.user.username);
        await this.usersService.delFriend(request.user.username, user.username);
        return (request.user);
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
        var data = await this.usersService.getEveryone();
        var ret: {id: number, username: string, wins: number, losses: number, avatar: string, elo: number}[] = [];
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
    @Get('friends')
    async getFriends(@Req() request: RequestWithUser) {
        var list = request.user.friendlist;
        var ret: {username: string, avatar: string, status: string}[] = [];
        for (let i = 0 ; i < list.length ; i++ ) {
            var data = await this.usersService.getByUsername(list[i]);
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
