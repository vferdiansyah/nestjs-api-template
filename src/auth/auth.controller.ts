import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError } from 'typeorm';
import { Public } from '../common/decorators';
import { BaseResponseDto } from '../common/dtos';
import { TwilioService } from '../common/providers';
import { JWT_CONFIG_TOKEN, JwtConfig } from '../config';
import { ErrorMessage, ResponseMessage } from '../shared/constants';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { JwtPayload, JwtSign } from './auth.interface';
import { LoginReqDto, VerifyOtpReqDto } from './dtos';

@Controller('auth/v1')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly twilioService: TwilioService,
  ) {}

  private getRefreshToken(sub: string): string {
    const jwtConfig = this.configService.get<JwtConfig>(JWT_CONFIG_TOKEN);
    return this.jwtService.sign(
      { sub },
      {
        secret: jwtConfig ? jwtConfig.jwtRefreshSecret : '',
        expiresIn: '7d', // Set greater than the expiresIn of the access_token
      },
    );
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginReqDto): Promise<BaseResponseDto> {
    try {
      const existingUser = await this.usersService.findOneByPhoneNumber(
        loginDto.phoneNumber,
      );
      if (!existingUser) {
        await this.usersService.create({
          phoneNumber: loginDto.phoneNumber,
        });
        await this.twilioService.send({
          channel: 'sms',
          to: loginDto.phoneNumber,
        });

        return new BaseResponseDto(
          HttpStatus.CREATED,
          ResponseMessage.USER_CREATED,
        );
      }

      await this.twilioService.send({
        channel: 'sms',
        to: loginDto.phoneNumber,
      });
      return new BaseResponseDto(HttpStatus.CREATED, ResponseMessage.OTP_SENT);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        throw new HttpException(
          ErrorMessage.DATABASE_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpReqDto: VerifyOtpReqDto): Promise<JwtSign> {
    const verificationResult = await this.twilioService.verify({
      code: verifyOtpReqDto.code,
      to: verifyOtpReqDto.phoneNumber,
    });
    if (verificationResult.status !== 'approved') {
      throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);
    }

    let existingUser: User | null = null;
    if (verifyOtpReqDto.phoneNumber) {
      existingUser = await this.usersService.findOneByPhoneNumber(
        verifyOtpReqDto.phoneNumber,
      );
    }

    if (!existingUser) {
      throw new NotFoundException(ErrorMessage.DATA_NOT_FOUND);
    }

    const payload: JwtPayload = { sub: existingUser.id };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.getRefreshToken(payload.sub),
    };
  }
}
