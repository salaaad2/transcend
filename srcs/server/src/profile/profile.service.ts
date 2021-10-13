import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../users/user.entity';
import RequestWithUser from 'src/authentication/requestWithUser.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async addFriend(username: string, f_user: string) {
        const user = await this.usersRepository.findOne({username: f_user});
        user.friendlist[user.friendlist.length] = username;
        await this.usersRepository.save(user);
        return user.friendlist;
    }

    async delFriend(username: string, f_user: string) {
        const user = await this.usersRepository.findOne({username: f_user});
        for(let i = 0; i < user.friendlist.length; i++) {
            if(user.friendlist[i] == username) {
                user.friendlist.splice(i, 1);
                break;
            }
        }
        await this.usersRepository.save(user);
        return user.friendlist;
    }

    async block(username: string, req: RequestWithUser) {
        const user = await this.usersRepository.findOne({username: req.user.username});
        user.blocklist[user.blocklist.length] = username;
        await this.usersRepository.save(user);
        return user.blocklist;
    }

    async unblock(username: string, req: RequestWithUser) {
        const user = await this.usersRepository.findOne({username: req.user.username});
        for(let i = 0; i < user.blocklist.length; i++) {
            if(user.blocklist[i] == username) {
                user.blocklist.splice(i, 1);
                break;
            }
        }
        await this.usersRepository.save(user);
        return user.blocklist;
    }

    async updateProfile(data: any[]) {
        const user = await this.usersRepository.findOne({realname: data[0]});
        if (data[1] != "")
        {
            if (/\/jpg|jpeg|png|gif/.test(data[1]))
                user.avatar = data[1];
            else
                throw new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST);
        }
        user.theme = data[2];
        await this.usersRepository.save(user);
        return ;
    }
}
