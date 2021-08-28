import { Controller, Get, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
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
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Buffer, @Req() req: RequestWithUser) {
      console.log(file);
      console.log(req.user.username);
      const dto = new AvatarDto();

      dto.userid = req.user.id;
      dto.image = file;
      console.log(dto);
      this.avatarService.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthenticationGuard)
    getAvatar(@Req() req: RequestWithUser) {
      return this.avatarService.getAvatar(req.user.id);
    }
}
