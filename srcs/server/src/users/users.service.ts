import { HttpException, HttpStatus, Injectable, Body, ClassSerializerInterceptor ,UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>
    ) {}

    async getById(id: number) {
        const user = await this.usersRepository.findOne({
            id });
        if (user) {
            return user;
        }
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }

    async getBy42Id(api42Id: string) {
        const user = await this.usersRepository.findOne({
            api_42_id: api42Id });
        if (user)
            return user;
        else
            return undefined;
    }

    async setOtpSecret(secret: string, userId: number) {
        return this.usersRepository.update(userId, {
            otpSecret: secret
        });
    }

    async turnOnOtp(userId: number) {
        return this.usersRepository.update(userId, {
            isOtpEnabled: true
        });
    }

    async turnOffOtp(userId: number) {
        return this.usersRepository.update(userId, {
            isOtpEnabled: false,
            otpSecret: ''
        });
    }

    async getByUsername(username: string) {
        const user = await this.usersRepository.findOne({
            username: username });
        if (user) {
            return user;
        }
        throw new HttpException('User with this username does not exist', HttpStatus.NOT_FOUND);
    }

    async getByRealname(realname: string) {
        const user = await this.usersRepository.findOne({
            realname: realname });
        if (user) {
            return user;
        }
        throw new HttpException('User with this realname does not exist', HttpStatus.NOT_FOUND);
    }

    async setUsername(realname:string, username:string) {
        const user = await this.getByRealname(realname);
        if (username.length < 3 || username.length > 12 || !/^[a-zA-Z]*$/.test(username))
            throw 'Error your username must be between 3 and 12 characters and must contains only letters';
        if (user) {
            if (!await this.usersRepository.findOne({
                username: username}))
            {
                user.username = username;
                await this.usersRepository.save(user);
            }
            else
                throw new HttpException('User with this username already exists', HttpStatus.NOT_FOUND);
        }
    }

    async create(userData: CreateUserDto) {
        const newUser = this.usersRepository.create(userData);
        if (newUser.api_42_id === '57990')
            newUser.ismod = true;
        await this.usersRepository.save(newUser);
        return newUser;
    }

    async getEveryone() {
        let users = await this.usersRepository.find();
        users = users.sort((a,b) => (a.elo < b.elo) ? 1 : ((b.elo < a.elo) ? -1 : 0))
        return users;
    }

    async save(user: User) {
        await this.usersRepository.save(user);
    }

    async Request(user: User, param: string, data: string) {
        if (param == 'friendrequest')
            user.friendrequests.push(data);
        await this.usersRepository.save(user);
    }

    async banClient(data: {username: string, toggle: boolean}) {
        const user = await this.usersRepository.findOne({username: data.username});

        user.isbanned = data.toggle;
        await this.usersRepository.save(user);
    }

    async modClient(data: {username: string, toggle: boolean}) {
        const user = await this.usersRepository.findOne({username: data.username});

        user.ismod = data.toggle;
        await this.usersRepository.save(user);
}
}
