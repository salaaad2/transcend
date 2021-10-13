import {
  Req,
  Res,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
    Get, UseInterceptors, ClassSerializerInterceptor, HttpException
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { Response } from 'express';
import { Api42AuthGuard, Api42AuthenticatedGuard } from './api42.guard';
import  OtpGuard from './otp/otp.guard';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @UseGuards(Api42AuthGuard)
    @Get('log-in')
    logIn(@Req() req:any) {}

    @UseGuards(Api42AuthGuard)
    @Get('redirect')
    async redirect(@Req() req:any, @Res({passthrough: true}) res:Response) {
        if (req.user) {
            try {
                const token = this.authenticationService.login(req.user);
                res.cookie('access_token', token.acess_token, {
                    httpOnly: false,
                });
                const cookie = this.authenticationService.getCookieWithJwtToken(req.user.id);
                req.res.setHeader('Set-Cookie', cookie);
                if (req.user.isOtpEnabled === false)
                    res.status(302).redirect(process.env.REACT_APP_BASE_URL+':'+process.env.REACT_APP_PORT+'/');
                else
                    res.status(302).redirect(process.env.REACT_APP_BASE_URL+':'+process.env.REACT_APP_PORT+'/#/otp-login');
            }
            catch (e) {
                if (e.status === 403)
                {
                    res.status(403).redirect(process.env.REACT_APP_BASE_URL+':'+process.env.REACT_APP_PORT+'/#/ban');
                }
                else
                {
                    res.status(401).redirect(process.env.REACT_APP_BASE_URL+':'+process.env.REACT_APP_PORT+'/#/');
                }
            }
        }
    }

    @UseGuards(JwtAuthenticationGuard)
    @UseGuards(OtpGuard)
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
    async logOut(@Req() request: any) {
        request.res.setHeader('Set-Cookie', await this.authenticationService.getCookiesForLogOut());
        // this.authenticationService.logout(req.user);
    }

}
