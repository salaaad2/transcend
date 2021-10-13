import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable} from '@nestjs/common';
import { Strategy } from 'passport-42';
import { AuthenticationService } from './authentication.service';
import { stringify } from 'querystring';
const clientID = "ca843ebf8335dda26f5dee085ef21e42e663b46577e65dece4fe1a30a35fd312"
const clientSecret = "ea31f0656f088bddb7a833e62d535608755415f80c2b4fbe1c2a144c7befdacb";
const callbackURL = 'http://'+process.env.HOST+':'+process.env.PORT+'/authentication/redirect';

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
