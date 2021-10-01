import { Module, HttpModule } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { Api42Strategy } from './api42.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { async } from 'rxjs';
import { JwtStrategy } from './jwt.strategy';
import { AvatarModule } from '../avatar/avatar.module';
import { MatchModule } from 'src/match/match.module';
import fetch from "node-fetch";

@Module({
    imports: [
        UsersModule,
        AvatarModule,
        MatchModule,
        PassportModule,
        ConfigModule,
        HttpModule,

        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn:
                    `${configService.get('JWT_EXPIRATION_TIME')}s`,
                },
            }),
        }),
    ],
    providers: [AuthenticationService, LocalStrategy, JwtStrategy, Api42Strategy],
    controllers: [AuthenticationController],
    exports: [AuthenticationService]
})
export class AuthenticationModule {}