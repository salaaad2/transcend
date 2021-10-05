import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import User from '../users/user.entity';
import Match from '../match/match.entity';
import { ProfileController } from './profile.controller'
import { UsersService } from '../users/users.service';
import { MatchService } from '../match/match.service';
@Module({
    imports: [TypeOrmModule.forFeature([User]),
              TypeOrmModule.forFeature([Match])],
    controllers: [ProfileController],
    providers: [ProfileService, UsersService, MatchService],
    exports: [ProfileService]
})

export class ProfileModule {}
