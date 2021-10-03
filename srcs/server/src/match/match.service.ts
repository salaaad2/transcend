import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository, getConnection } from 'typeorm';
import Match from './match.entity';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
        private readonly userService: UsersService
    ) {} 

    async getmatches(username: string) {
        const matches = await this.matchRepository.find({where: [
            { username: username },
            { opponent: username }
        ], order: {
            id: 'DESC'
        }, 
        take: 5}
        )
        return matches;
    }

    async putmatch(player1: string, player2: string, p1score: number, p2score: number) {
        const match = new Match();
        match.username = player1;
        match.opponent = player2;
        match.points = p1score;
        match.o_points = p2score;
        await this.matchRepository.save(match);
        const user1 = await this.userService.getByUsername(player1);
        const user2 = await this.userService.getByUsername(player2);
        if (p1score > p2score) {
            user1.wins += 1;
            user2.losses += 1;
        }
        else {
            user2.wins += 1;
            user1.losses += 1;
        }
        let k1, k2: number;
        if (user1.wins + user1.losses <= 30)
            k1 = 40;
        else if (user1.wins + user1.losses > 30 && user1.elo > 2000)
            k1 = 20;
        else
            k1 = 10;
        if (user2.wins + user2.losses <= 30)
            k2 = 40;
        else if (user2.wins + user2.losses > 30 && user2.elo > 2000)
            k2 = 20;
        else
            k2 = 10;
        user1.elo = Math.round(user1.elo + k1 * ((p1score > p2score ? 1 : 0) - 1 / (1 + Math.pow(10, - (user1.elo - user2.elo) / 400))));
        user2.elo = Math.round(user2.elo + k2 * ((p2score > p1score ? 1 : 0) - 1 / (1 + Math.pow(10, - (user2.elo - user1.elo) / 400))));
        await this.userService.save(user1);
        await this.userService.save(user2);
    }
}
