import { TestBed } from '@automock/jest';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { VerificationCheckInstance } from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import { DeepPartial } from 'typeorm';
import { TwilioService } from '../common/providers';
import { ResponseMessage } from '../shared/constants';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { LoginReqDto, VerifyOtpReqDto } from './dtos';

describe('AuthController', () => {
  let authController: AuthController;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;
  let twilioService: jest.Mocked<TwilioService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(AuthController).compile();

    authController = unit;
    configService = unitRef.get(ConfigService);
    jwtService = unitRef.get(JwtService);
    usersService = unitRef.get(UsersService);
    twilioService = unitRef.get(TwilioService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should create a new user and otp if user not exist', async () => {
      const phoneNumber = '+628123456789';
      const mockLoginReqDto: LoginReqDto = {
        phoneNumber,
      };
      const mockUser: DeepPartial<User> = {
        phoneNumber,
      };
      usersService.findOneByPhoneNumber.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as User);
      // @ts-expect-error resolved value must be of type VerificationInstance or Promise<VerificationInstance>
      twilioService.send.mockResolvedValue(null);

      const response = await authController.login(mockLoginReqDto);

      expect(response.statusCode).toEqual(HttpStatus.CREATED);
      expect(response.message).toEqual(ResponseMessage.USER_CREATED);
    });

    it('should create a new otp if user exist', async () => {
      const phoneNumber = '+628123456789';
      const mockLoginReqDto: LoginReqDto = {
        phoneNumber,
      };
      const mockUser: DeepPartial<User> = {
        phoneNumber,
      };
      usersService.findOneByPhoneNumber.mockResolvedValue(mockUser as User);
      // @ts-expect-error resolved value must be of type VerificationInstance or Promise<VerificationInstance>
      twilioService.send.mockResolvedValue(null);

      const response = await authController.login(mockLoginReqDto);

      expect(response.statusCode).toEqual(HttpStatus.CREATED);
      expect(response.message).toEqual(ResponseMessage.OTP_SENT);
    });
  });

  describe('verify-otp', () => {
    it('should verify otp if user exist', async () => {
      const phoneNumber = '+628123456789';
      const code = '123456';
      const mockVerifyOtpReqDto: VerifyOtpReqDto = {
        phoneNumber,
        code,
      };
      const mockUser: DeepPartial<User> = {
        id: 'some-id',
        phoneNumber,
      };
      configService.get.mockReturnValue({ jwtRefreshSecret: 'secret' });
      jwtService.sign.mockReturnValue('secret');
      usersService.findOneByPhoneNumber.mockResolvedValue(mockUser as User);
      twilioService.verify.mockResolvedValue({
        status: 'approved',
      } as VerificationCheckInstance);

      const response = await authController.verifyOtp(mockVerifyOtpReqDto);

      expect(response.access_token).toBeDefined();
      expect(response.refresh_token).toBeDefined();
    });

    it('should throw an error if user not exist', () => {
      const phoneNumber = '+628123456789';
      const code = '123456';
      const mockVerifyOtpReqDto: VerifyOtpReqDto = {
        phoneNumber,
        code,
      };
      twilioService.verify.mockResolvedValue({
        status: 'failed',
      } as VerificationCheckInstance);

      // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
      expect(async () =>
        authController.verifyOtp(mockVerifyOtpReqDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
