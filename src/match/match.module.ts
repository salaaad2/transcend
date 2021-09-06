import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Match from './match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [MatchService],
  controllers: [MatchController],
  exports: [MatchService]
})
export class MatchModule {}
