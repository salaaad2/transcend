import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import Match from './match.entity';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>
    ) {} 

    async getmatches(username: string) {
        const matches = await this.matchRepository.find({where: [
            { username: username },
            { opponent: username }
        ]})
        return matches;
    }
}
