import { IsNotEmpty, IsString, Min, Max, IsAscii } from 'class-validator';

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    @Min(1)
    @Max(250)
    @IsAscii()
    message: string;
}
