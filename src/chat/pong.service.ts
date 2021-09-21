import { x } from '@hapi/joi';
import { Injectable } from '@nestjs/common';
 
interface Room {
    id: number;
    Players : string[];
    ingame: boolean;
    p1position: number;
    p2position: number;
    ballposition: {
      x: number;
      y: number;
      dir: number;
      coeff: number;
    };
  }

@Injectable()
export class PongService {
    constructor() {}

    intersect(room: Room, player: number) {
        let distx = Math.abs(room.ballposition.x - (player == 2 ? 100 - 2 - (2.5 / 2) : 2 + (2.5 / 2)));
        let disty = Math.abs(room.ballposition.y - 
            (player == 2 ? (room.p2position + 20 / 2) : (room.p1position + 20 / 2)));
        if ((distx > (2.5 / 2 + 2)) || (disty > (20 / 2 + 2)))
            return false;
        if (distx <= 2.5 / 2 || disty <= 20 / 2)
            return true;
        let cdist = Math.pow((distx - 2.5 / 2), 2) + Math.pow((disty - 20 / 2), 2);
        return (cdist <= Math.pow(2, 2))
    }

    calculateBallPosition(room: Room) {

        if (room.ballposition.y >= 98 || room.ballposition.y <= 2)
            room.ballposition.coeff *= -1;
        if ((room.ballposition.x >= 98 - 2.5 && this.intersect(room, 2))
        || ((room.ballposition.x <= 2 + 2.5) && this.intersect(room, 1)))
        {
            if (((room.ballposition.x > 98 - 2.5) && 
                ((room.ballposition.y >= room.p2position + 20 + 2) || (room.ballposition.y <= room.p2position - 2)))
                || ((room.ballposition.x < 2 + 2.5) && 
                ((room.ballposition.y >= room.p1position + 20 + 2) || (room.ballposition.y <= room.p1position - 2))))
                room.ballposition.coeff *= -1;
            else
                room.ballposition.dir *= -1;
        }
        if (room.ballposition.x >= 98 || room.ballposition.x <= 2) {
            room.ballposition.x = 50;
            room.ballposition.y = 50;
        }
        room.ballposition.x += 0.2 * room.ballposition.dir;
        room.ballposition.y += 0.2 * room.ballposition.coeff;
    }
}