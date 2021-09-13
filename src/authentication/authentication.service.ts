import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from '../database/postgressErrrorCodes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';
import RequestWithUser from "./requestWithUser.interface";


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

    public async register(registrationData: RegisterDto)
    {
        const hashedPassword = await bcrypt.hash(registrationData.password, 10);
        try {
            const createdUser = await this.usersService.create({
                ...registrationData,
                password: hashedPassword
            });
            createdUser.password = undefined;
            console.log(createdUser);
            return createdUser;
        } catch (error) {
            if (error?.code === PostgresErrorCode.UniqueViolation) {
                throw new HttpException('User whit that username already exists', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public async getAuthenticatedUser(username: string, plainTextPassword: string) {
        try {
            const user = await this.usersService.getByUsername(username);
            await this.verifyPassword(plainTextPassword, user.password);
            user.password = undefined;
            return user;
        } catch (error) {
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
        }
    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
        if (!isPasswordMatching)
            throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }

    public getCookieWithJwtToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload);
        return `Authentication=${token}; HtppOnly; Path=/;Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }

    async login(req: RequestWithUser) {
        const payload = { username: req.user.username, sub: req.user.id };
        return {
            id: req.user.id,
            username: req.user.username,
            accessToken: this.jwtService.sign(payload)
        };
    }
}
