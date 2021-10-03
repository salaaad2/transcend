import { IsNotEmpty, IsString } from 'class-validator';

export class OtpCodeDto {
  @IsString()
  @IsNotEmpty()
  otpCode: string;
}
