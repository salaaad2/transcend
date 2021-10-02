import { PassportSerializer } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import  User  from '../users/user.entity';
import { AuthenticationService } from './authentication.service';


@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly authService: AuthenticationService,
  )
  {
    super();
  }

  serializeUser(user: User, done: (err: Error, user: User) => void) {
    done(null, user);
  }

    async deserializeUser(user: User, done: (err: Error, user: User) => void) {
    const currUser = await this.authService.findUserFromApi42Id(user);
    return currUser ? done(null, currUser) : done(null, null);
  }
}
