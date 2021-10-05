import { IsNotEmpty, IsString, Min, Max, IsAlpha } from 'class-validator';

export class UsernameDto {
    @IsString()
    @IsNotEmpty()
    @Min(3)
    @Max(12)
    @IsAlpha()
    username: string;
}
