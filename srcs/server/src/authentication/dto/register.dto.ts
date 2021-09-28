import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    password: string;

    @IsString()
    avatar: string;
}

export default RegisterDto;
