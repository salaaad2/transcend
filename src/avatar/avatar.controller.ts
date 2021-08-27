import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { AvatarService } from './avatar.service';

@Controller('avatar')
export class AvatarController {
    private readonly avatarService: AvatarService

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
      console.log(file);
      this.avatarService.createAvatar(file);
    }
}
