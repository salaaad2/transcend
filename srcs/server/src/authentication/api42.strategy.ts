import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable} from '@nestjs/common';
import { Strategy } from 'passport-42';
import { AuthenticationService } from './authentication.service';
import { stringify } from 'querystring';
const clientID = "4df460dc2607d44b778cc9ff3befb750cc2e302560abb2d93c1d4114f7e909cf"
const clientSecret = "7f439a3acdafa142785d906b64db8bdf54b09de4e69cd2ad726fabdeca0389e7";
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
