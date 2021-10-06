import {
  Body,
  Req,
  Controller,
  Post,
  UseGuards,
  Get, UseInterceptors, ClassSerializerInterceptor,
    HttpException, HttpStatus
} from '@nestjs/common';
import { AvatarService } from '../avatar/avatar.service';
import { UsersService } from '../users/users.service';
import { MatchService } from '../match/match.service';
import { ProfileService } from './profile.service';
import RequestWithUser from '../authentication/requestWithUser.interface';
import JwtAuthenticationGuard from '../authentication/jwt-authentication.guard';

@Controller('profile')
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
    constructor(
        private readonly usersService: UsersService,
        private readonly matchService: MatchService,
        private readonly profileService: ProfileService
    ) {}

    @UseGuards(JwtAuthenticationGuard)
    @Post('profile2')
    async getProfile(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        const data = await this.usersService.getByUsername(user.username);
        const match = await this.matchService.getmatches(user.username);
        let users = await this.usersService.getEveryone();
        users = users.sort((a,b) => (a.elo < b.elo) ? 1 : ((b.elo < a.elo) ? -1 : 0));
        const rank = users.findIndex((element) => {return (element.username == user.username)});
        const ret = {
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
        await this.profileService.addFriend(users.user1, users.user2);
        await this.profileService.addFriend(users.user2, users.user1);
        const user = await this.usersService.getByUsername(users.user1);
        user.friendrequests.splice(user.friendrequests.findIndex(element => {return element == user.username}, 1));
        await this.usersService.save(user);
        return (user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('delfriend')
    async delFriend(@Body() users: {user1: string, user2: string}) {
        await this.profileService.delFriend(users.user1, users.user2);
        await this.profileService.delFriend(users.user2, users.user1);
        return ;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('block')
    async Block(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        this.profileService.block(user.username, request);
        return (request.user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('unblock')
    async Unblock(@Body() user: {username: string}, @Req() request: RequestWithUser) {
        this.profileService.unblock(user.username, request);
        return (request.user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get('all')
    async getAllUsers() {
        const data = await this.usersService.getEveryone();
        const ret: {id: number, username: string, wins: number, losses: number, avatar: string, elo: number}[] = [];
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
        const list = user2.friendlist;
        const ret: {username: string, avatar: string, status: string}[] = [];
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
    @Post('update_profile')
    async updateData(@Body() data: any[]) {
        return (await this.profileService.updateProfile(data));
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('ban_client')
    async banClient(@Body() data: {username: string, toggle: boolean},
                    @Req() request: RequestWithUser) {
        if (request.user.ismod) {
            console.log('sufficient rights.\n banning : ' + data.username);
            this.usersService.banClient(data);
        } else {
            throw new HttpException('Insufficient Rights to ban or unban user', HttpStatus.I_AM_A_TEAPOT);
        }
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('mod_client')
    async modClient(@Body() data: {username: string, toggle: boolean},
                    @Req() request: RequestWithUser) {
        if (request.user.ismod) {
            console.log('sufficient rights.\n modding : ' + data.username);
            this.usersService.modClient(data);
        } else {
            throw new HttpException('Insufficient Rights to give or take away moderation rights', HttpStatus.I_AM_A_TEAPOT);
        }
    }
}
