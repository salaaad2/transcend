import { IsNotEmpty, IsString, Min, Max, IsAlpha } from 'class-validator';

export class ChannelDto {
    @IsString()
    @IsNotEmpty()
    @Min(3)
    @Max(12)
    @IsAlpha()
    channel: string;
}
