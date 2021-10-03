import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class OtpGuard extends AuthGuard('jwt-two-factor') {}
