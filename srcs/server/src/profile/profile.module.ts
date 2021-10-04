import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import User from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [ProfileService],
    exports: [ProfileService]
})

export class ProfileModule {}
