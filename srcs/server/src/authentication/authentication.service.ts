import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from '../users/users.service';
import RegisterDto from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import PostgresErrorCode from '../database/postgressErrrorCodes.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';
import User from '../users/user.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class OtpStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor'
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Authentication;
      }]),
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.getById(payload.userId);
    if (!user.isOtpEnabled) {
      return user;
    }
    if (payload.isOtpAuthenticated) {
      return user;
    }
  }
}


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

    public getCookieWithJwtToken(userId: number, isOtpAuthenticated = false) {
        const payload: TokenPayload = { userId, isOtpAuthenticated };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: `${this.configService.get('JWT_EXPIRATION_TIME')}s`
        });
        return `Authentication=${token}; HtppOnly; Path=/;Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')};SameSite=Strict`;
    }

    public async  getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }

    login(user: User): { acess_token: string } {
        const payload = { username: user.username, sub: user.id };
        return {
            acess_token: this.jwtService.sign(payload),
        };
    }

    async findUserFromApi42Id(data:any): Promise<any> {
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
