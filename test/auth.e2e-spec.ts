import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { BaseResponseDto } from '../src/common/dtos';
import { TwilioService } from '../src/common/providers';
import { jwtConfig, typeOrmConfig, TypeOrmConfigService } from '../src/config';
import { ResponseMessage } from '../src/shared/constants';
import { UsersService } from '../src/users/users.service';

describe('AuthModule', () => {
  let app: INestApplication;

  const mockUsersService = {
    create: jest.fn(),
    findOneByPhoneNumber: jest.fn(),
    findOneByPhoneNumberAndOtp: jest.fn(),
  };

  const mockTwilioService = {
    send: jest.fn(),
    verify: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [jwtConfig, typeOrmConfig],
        }),
        LoggerModule.forRoot(),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useClass: TypeOrmConfigService,
        }),
        AuthModule,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(TwilioService)
      .useValue(mockTwilioService)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST: /auth/v1/login', () => {
    it('should create a new user', async () => {
      jest
        .spyOn(mockUsersService, 'findOneByPhoneNumber')
        .mockResolvedValue(false);
      jest.spyOn(mockUsersService, 'create').mockResolvedValue(true);
      jest.spyOn(mockTwilioService, 'send').mockResolvedValue(true);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/v1/login')
        .send({ phoneNumber: '+6287819910110' })
        .expect(HttpStatus.CREATED)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining(
              new BaseResponseDto(
                HttpStatus.CREATED,
                ResponseMessage.USER_CREATED,
              ),
            ),
          ),
        );
    });

    it('should log in existing user', async () => {
      jest
        .spyOn(mockUsersService, 'findOneByPhoneNumber')
        .mockResolvedValue(true);
      jest.spyOn(mockTwilioService, 'send').mockResolvedValue(true);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/v1/login')
        .send({ phoneNumber: '+6287819910110' })
        .expect(HttpStatus.CREATED)
        .expect((res) =>
          expect(res.body).toEqual(
            expect.objectContaining(
              new BaseResponseDto(HttpStatus.CREATED, ResponseMessage.OTP_SENT),
            ),
          ),
        );
    });
  });

  describe('POST: /auth/v1/verify-otp', () => {
    it('should verify OTP', async () => {
      jest
        .spyOn(mockUsersService, 'findOneByPhoneNumber')
        .mockResolvedValue({ id: 'some-id', otps: [{ id: '1' }, { id: '2' }] });
      jest.spyOn(mockTwilioService, 'verify').mockResolvedValue({
        status: 'approved',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/v1/verify-otp')
        .send({
          phoneNumber: '+6287819910110',
          otp: '123456',
        })
        .expect(HttpStatus.CREATED);
    });

    it('should throw an exception if any of phone number, OTP, or use case is invalid', async () => {
      jest.spyOn(mockTwilioService, 'verify').mockResolvedValue({
        status: 'failed',
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await request(app.getHttpServer())
        .post('/auth/v1/verify-otp')
        .send({
          phoneNumber: '+6187819910110',
          otp: '123456',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
