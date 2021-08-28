import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import RequestWithUser from 'src/authentication/requestWithUser.interface';
import { Repository } from 'typeorm';
import Avatar from './avatar.entity';
import AvatarDto from './dto/avatar.dto';

@Injectable()
export class AvatarService {
    constructor(
        @InjectRepository(Avatar)
        private avatarRepository: Repository<Avatar>
    ) {}

    async create(avatarData: AvatarDto) {
        const newAvatar = await this.avatarRepository.create(avatarData);
        await this.avatarRepository.save(newAvatar);
        return newAvatar;
    }

    async getAvatar(id: number) {
        const avatar = await this.avatarRepository.findOne({id});
        console.log(avatar);
        return avatar;
    }
}
