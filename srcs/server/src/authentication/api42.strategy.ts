import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable} from '@nestjs/common';
import { Strategy } from 'passport-42';
import { AuthenticationService } from './authentication.service';
import { stringify } from 'querystring';
const clientID = "bd6ff1c4c3e4091081ae555d9885fa7b5a5cb68782cce3890ca445d0afb23dfd";
const clientSecret = "8000c1b72b7d80030b4b982f1d39681b850f64c89675b64eeac445c3bdffc087";
const callbackURL = "http://localhost:3000/authentication/redirect";

@Injectable()
export class Api42Strategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthenticationService,
        private http: HttpService,
    ) {
        super({
            clientID,
            clientSecret,
            callbackURL,
            scope : 'public',
            state: true,
        });
    }


    async validate(
        accessToken: string,
    ): Promise<any> {
        const { data } = await this.http.get('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${ accessToken }` },
        })
        .toPromise();
        return this.authService.findUserFromApi42Id(data);
    }
}
