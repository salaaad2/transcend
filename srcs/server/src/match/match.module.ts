import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Match from './match.entity';
import { UsersService } from 'src/users/users.service';
import User from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), TypeOrmModule.forFeature([User])],
  providers: [MatchService, UsersService],
  controllers: [MatchController],
  exports: [MatchService]
})
export class MatchModule {}
