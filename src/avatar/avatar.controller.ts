import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { AvatarService } from './avatar.service';
import AvatarDto from './dto/avatar.dto';

@Controller('avatar')
export class AvatarController {
  constructor(
    private readonly avatarService: AvatarService
    ) {}

    @Post()
    @UseGuards(JwtAuthenticationGuard)
    uploadFile(@Body() avatarData: AvatarDto, @Req() req: RequestWithUser) {
      this.avatarService.create(avatarData);
    }

    @Get()
    @UseGuards(JwtAuthenticationGuard)
    getAvatar(@Req() req: RequestWithUser) {
      return this.avatarService.getAvatar(req.user.id);
    }
}
