import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards';
import { BaseModule } from './base/base.module';
import { ExceptionsFilter } from './common/filters';
import {
  appConfig,
  jwtConfig,
  JwtConfigService,
  loggerAsyncConfig,
  twilioConfig,
  typeOrmConfig,
  TypeOrmConfigService,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, jwtConfig, twilioConfig, typeOrmConfig],
    }),
    LoggerModule.forRootAsync(loggerAsyncConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: JwtConfigService,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 15 * 60 * 1000, // 15 minutes,
        limit: 100, // limit each IP to 100 requests per windowMs
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    BaseModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true, // transform object to DTO class
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
