import {
    ClassSerializerInterceptor,
    Controller,
    Header,
    Post,
    UseInterceptors,
    Res,
    Body,
    UseGuards,
    Req, HttpCode, UnauthorizedException
} from '@nestjs/common';
import { otpService } from './otp.service';
import { Response } from 'express';
import JwtAuthenticationGuard from '../jwt-authentication.guard';
import RequestWithUser from '../requestWithUser.interface';
import { OtpCodeDto } from './dto/otpCode.dto';
import { UsersService } from '../../users/users.service';
import { AuthenticationService } from '../authentication.service';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class OtpController {
    constructor(
        private readonly otpService: otpService,
        private readonly usersService: UsersService,
        private readonly authenticationService: AuthenticationService
    ) {}

    @Post('turn-on')
    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    async turnOnTwoFactorAuthentication(
        @Req() request: RequestWithUser,
        @Body() { otpCode } : OtpCodeDto
    ) {
        const isCodeValid = this.otpService.isOtpCodeValid(
            otpCode, request.user
        );
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        await this.usersService.turnOnOtp(request.user.id);
    }

    @Post('generate')
    @UseGuards(JwtAuthenticationGuard)
    async register(@Res() response: Response, @Req() request: RequestWithUser) {
        const { otpauthUrl } = await this.otpService.generateOtpSecret(request.user);

        return this.otpService.pipeQrCodeStream(response, otpauthUrl);
    }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { otpCode } : OtpCodeDto
  ) {
    const isCodeValid = this.otpService.isOtpCodeValid(
      otpCode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie = this.authenticationService.getCookieWithJwtToken(request.user.id, true);

    request.res.setHeader('Set-Cookie', [accessTokenCookie]);

    return request.user;
  }
}
