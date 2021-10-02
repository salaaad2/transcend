import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from '../database/postgressErrrorCodes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';
import User from '../users/user.entity';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    public async getUserFromAuthenticationToken(token: string) {
        const payload: TokenPayload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET')
        });
        if (payload.userId) {
            return this.usersService.getById(payload.userId);
        }
    }

    public getCookieWithJwtToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload);
        return `Authentication=${token}; HtppOnly; Path=/;Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')};SameSite=Strict`;
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }

    login(user: User): { acess_token: string } {
        const payload = { username: user.username, sub: user.id };
        return {
            acess_token: this.jwtService.sign(payload),
        };
    }

    async findUserFromApi42Id(data:any): Promise<any> {
            console.log('DATA.ID ======= ' + data.id);
        const user = await this.usersService.getBy42Id(data.id);
        if (!user && data.login !== undefined)
        {
            return (this.usersService.create({
                username: data.login,
                api_42_id: data.id
            }))
        }
        return user;
    }
}
