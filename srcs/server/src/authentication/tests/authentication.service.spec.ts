import { AuthenticationService } from '../authentication.service';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import * as Joi from '@hapi/joi';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from '../../users/user.entity';
import { UsersService } from '../../users/users.service';

describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            POSTGRES_HOST: Joi.string().required(),
            POSTGRES_PORT: Joi.number().required(),
            POSTGRES_USER: Joi.string().required(),
            POSTGRES_PASSWORD: Joi.string().required(),
            POSTGRES_DB: Joi.string().required(),
            JWT_SECRET: Joi.string().required(),
            JWT_EXPIRATION_TIME: Joi.string().required(),
            PORT: Joi.number(),
          })
        }),
        DatabaseModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: {
              expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
            },
          }),
        }),
      ],
      providers: [
        UsersService,
        AuthenticationService,
          {
              provide: getRepositoryToken(User),
              useValue: {},
          }
      ],
    }).compile();
    authenticationService = await module.get<AuthenticationService>(AuthenticationService);
  })
  describe('when creating a cookie', () => {
    it('should return a string', () => {
      const userId = 1;
      expect(
        typeof authenticationService.getCookieWithJwtToken(userId)
      ).toEqual('string')
    })
  })
});
