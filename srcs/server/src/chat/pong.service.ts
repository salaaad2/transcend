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
    spectators: string[];
    speed: number;
    powerups: boolean;
    powerspecs: {
        type: number;
        x: number;
        y: number;
    }
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

    private powerspeed: boolean = false;
    private ballpower: number = 1;
    private powerActive: boolean = false;

    intersect(room: Room, player: number) {
        let distx = Math.abs(room.ballposition.x - (player == 2 ? 100 - 1 - (2.5 / 2) : 1 + (2.5 / 2)));
        let disty = Math.abs(room.ballposition.y - 
            (player == 2 ? (room.p2position + 20 / 2) : (room.p1position + 20 / 2)));
        if (distx >= (2.5 / 2 + 2 / this.ballpower))
            return false;
        if (disty >= (20 / 2 + 2 / this.ballpower))
            return false;
        if (distx < 2.5 / 2)
            return true;
        if (disty < 20 / 2)
            return true;
        let cdist = Math.pow((distx - 2.5 / 2), 2) + Math.pow((disty - 20 / 2), 2);
        return (cdist <= Math.pow(2 / this.ballpower, 2));
    }

    intersectcircle(room: Room) {
        var ball = {radius: 2 / this.ballpower, x: room.ballposition.x, y: room.ballposition.y};
        var powerup = {radius: 10, x: room.powerspecs.x, y: room.powerspecs.y};

        var dx = ball.x - powerup.x;
        var dy = ball.y - powerup.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + powerup.radius) {
            this.powerActive = true;
            return true;
        }
        return false;
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
                room.ballposition.y += 0.25 * room.speed * room.ballposition.coeff;
                room.ballposition.x += 0.25 * room.speed * room.ballposition.dir;
            }
            if (this.intersectcircle(room)) {
                room.powerspecs.x = -100;
                if (room.powerspecs.type == 0) {
                    this.powerspeed = true;
                    room.speed *= 2;
                }
                else if (room.powerspecs.type == 1) {
                    room.powerspecs.type = -1;
                    this.ballpower = 2;
                }
            }
            if ((this.intersect(room, 1) && (intersect = true)) || this.intersect(room, 2))
            {

                if (room.ballposition.x > 95.5 || room.ballposition.x < 4.5)
                {
                    room.ballposition.x >= 95.5 ? room.p1score++ : room.p2score++;
                    if (this.powerspeed == true) {
                        room.speed /= 2;
                        this.powerspeed = false;
                    }
                    this.ballpower = 1;
                    this.powerActive = false;
                    room.powerspecs.type = -42;
                    room.ballposition.x = 50;
                    room.ballposition.y = 50;
                    room.ballposition.coeff = 2;
                    room.powerspecs.x = -100;
                    room.countdown = 50;
                }
                else
                {
                    room.ballposition.dir *= -1;
                    room.ballposition.coeff += intersect ? room.p1direction : room.p2direction;
                    room.ballposition.y += 0.25 * room.speed  * room.ballposition.coeff;
                    room.ballposition.x += 0.25 * room.speed  * room.ballposition.dir;
                }
            }
            else if (room.ballposition.x >= 98 || room.ballposition.x <= 2)
            {
                room.ballposition.x >= 98 ? room.p1score++ : room.p2score++;
                if (this.powerspeed == true) {
                    room.speed /= 2;
                    this.powerspeed = false;
                }
                if (room.p1score == 5 || room.p2score == 5)
                {
                    this.matchService.putmatch(room.Players[0], room.Players[1], room.p1score, room.p2score);
                    room.end = true;
                    room.ingame = false;
                }
                this.ballpower = 1;
                this.powerActive = false;
                room.ballposition.x = 50;
                room.ballposition.y = 50;
                room.ballposition.coeff = 2;
                room.powerspecs.x = -100;
                room.countdown = 50;
                return ;
            }
            room.ballposition.x += 0.4 * room.speed * room.ballposition.dir;
            room.ballposition.y += 0.4 * room.speed * room.ballposition.coeff;
        }
    }

    calculatePowerUp(room: Room) {
        if (room.powerspecs.x == -100 && this.powerActive == false) {
            if (Math.random() < 0.005) {
                room.powerspecs.x = Math.floor(Math.random() * (80 - 20) + 20);
                room.powerspecs.y = Math.floor(Math.random() * (80 - 20) + 20);
                // room.powerspecs.type = Math.floor(Math.random() * 3);
                room.powerspecs.type = 1;
                console.log('log', room.powerspecs.x, room.powerspecs.y, room.powerspecs.type);
            }
        }
    }
}