import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';
import { UsernameDto } from './dto/username.dto';

@Injectable()
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

    async setUsername(realname: string, username: UsernameDto) {
        const user = await this.usersRepository.findOne({
            realname: realname });
        if (user) {
            if (!await this.usersRepository.findOne({
                username: username.username}))
            {
                user.username = username.username;
                await this.usersRepository.save(user);
            }
            else
                throw new HttpException('User with this username already exists', HttpStatus.NOT_FOUND);

        }
        throw new HttpException('User with this realname does not exist', HttpStatus.NOT_FOUND);
    }

    async create(userData: CreateUserDto) {
        const newUser = this.usersRepository.create(userData);
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
}
