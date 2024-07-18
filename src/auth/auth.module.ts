import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TwilioModule } from '../common/providers';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtStrategy, JwtVerifyStrategy } from './strategies';

@Module({
  imports: [ConfigModule, JwtModule, TwilioModule, UsersModule],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtVerifyStrategy],
})
export class AuthModule {}
