import { IsNotEmpty, IsString, IsNumberString } from 'class-validator';

export class OtpCodeDto {
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  otpCode: string;
}
