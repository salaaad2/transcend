import { x } from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import { MatchService } from 'src/match/match.service';
import { UsersService } from 'src/users/users.service';
 
interface Room {
    id: number;
    start: boolean;
    end: boolean;
    Players : string[];
    ingame: boolean;
    p1position: number;
    p2position: number;
    p1score: number;
    p2score: number;
    p1direction: number;
    p2direction: number;
    countdown: number;
    ballposition: {
      x: number;
      y: number;
      dir: number;
      coeff: number;
    };
  }

@Injectable()
export class PongService {
    constructor(
        private readonly matchService: MatchService,
    ) {
    }

    intersect(room: Room, player: number) {
        let distx = Math.abs(room.ballposition.x - (player == 2 ? 100 - 1 - (2.5 / 2) : 1 + (2.5 / 2)));
        let disty = Math.abs(room.ballposition.y - 
            (player == 2 ? (room.p2position + 20 / 2) : (room.p1position + 20 / 2)));
        if (distx >= (2.5 / 2 + 2))
            return false;
        if (disty >= (20 / 2 + 2))
            return false;
        if (distx < 2.5 / 2)
            return true;
        if (disty < 20 / 2)
            return true;
        let cdist = Math.pow((distx - 2.5 / 2), 2) + Math.pow((disty - 20 / 2), 2);
        return (cdist <= Math.pow(2, 2));
    }

    calculateBallPosition(room: Room) {

        var intersect: boolean = false;

        if (room.countdown != 0) {
            room.countdown -= 1;
            if (!room.countdown)
                room.start = true;
        }
        else {
            if (room.ballposition.y >= 98 || room.ballposition.y <= 2)
            {
                room.ballposition.coeff *= -1;
                room.ballposition.y += 0.5 * room.ballposition.coeff;
                room.ballposition.x += 0.5 * room.ballposition.dir;
            }
            if ((this.intersect(room, 1) && (intersect = true)) || this.intersect(room, 2))
            {

                if (room.ballposition.x > 95.5 || room.ballposition.x < 4.5)
                {
                    room.ballposition.coeff *= -1;
                    room.ballposition.y += 0.5 * room.ballposition.coeff;
                    room.ballposition.x += 0.5 * room.ballposition.dir;
                }
                else
                {
                    room.ballposition.dir *= -1;
                    room.ballposition.coeff += intersect ? room.p1direction : room.p2direction;
                    room.ballposition.y += 0.5 * room.ballposition.coeff;
                    room.ballposition.x += 0.5 * room.ballposition.dir;
                }
            }
            else if (room.ballposition.x >= 98 || room.ballposition.x <= 2)
            {
                room.ballposition.x >= 98 ? room.p1score++ : room.p2score++;
                if (room.p1score == 5 || room.p2score == 5)
                {
                    this.matchService.putmatch(room.Players[0], room.Players[1], room.p1score, room.p2score);
                    room.end = true;
                }
                room.ballposition.x = 50;
                room.ballposition.y = 50;
                room.ballposition.coeff = 2;
                room.countdown = 50;
                return ;
            }
            room.ballposition.x += 0.8 * room.ballposition.dir;
            room.ballposition.y += 0.8 * room.ballposition.coeff;
        }
    }
}