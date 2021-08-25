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
import RegisterDto from './dto/register.dto';
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { UsersService } from '../users/users.service';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';


@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly usersService: UsersService
    ) {}

    @Post('register')
    async register(@Body() registrationData: RegisterDto)
    {
        return this.authenticationService.register(registrationData);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-in')
    async logIn(@Req() request: RequestWithUser) {
        console.log("In logIn")
        // const {user} = request;
        // const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
        // request.res.setHeader('Set-Cookie', cookie);
        // console.log(user);
        // return user;
        return this.authenticationService.login(request);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-out')
    async logOut(@Req() request: RequestWithUser) {
        return "";
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    }
}
