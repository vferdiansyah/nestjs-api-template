import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { TwilioService } from './twilio.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
