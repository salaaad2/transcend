import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import Avatar from './avatar.entity';
import AvatarDto from './dto/avatar.dto';

@Injectable()
export class AvatarService {
    constructor(
        @InjectRepository(Avatar)
        private avatarRepository: Repository<Avatar>
    ) {}

    async create(avatarData: AvatarDto) {
        await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Avatar)
        .where({userid: avatarData.userid})
        .execute();
        const newAvatar = await this.avatarRepository.create(avatarData);
        await this.avatarRepository.save(newAvatar);
        return newAvatar;
    }

    async getAvatar(id: number) {
        const avatar = await this.avatarRepository.findOne({userid: id});
        return {"avatar": avatar, "id": id};
    }
}
