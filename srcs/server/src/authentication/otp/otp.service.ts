import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import User from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class otpService {
  constructor (
    private readonly usersService: UsersService,
  ) {}

    public isOtpCodeValid(otpCode: string, user: User) {
        console.log('SECRET ' + user.otpSecret);
        console.log('OTP CODE ' + otpCode);
        return authenticator.verify({
            token: otpCode,
            secret: user.otpSecret
        });
    }
    public async generateOtpSecret(user: User) {
        const secret = authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(user.username, 'overkill-pong.fr', secret);

        await this.usersService.setOtpSecret(secret, user.id);

        return {
            secret,
            otpauthUrl
        }
    }
    public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }
}
