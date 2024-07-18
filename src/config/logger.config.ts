import { ConfigModule, ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { nanoid } from 'nanoid';
import type { LoggerModuleAsyncParams } from 'nestjs-pino';
import { multistream, stdTimeFunctions } from 'pino';
import type { ReqId } from 'pino-http';
import { Env } from '../shared/constants';
import { APP_CONFIG_TOKEN, AppConfig } from './app.config';

const passUrl = new Set(['/health']);

export const loggerAsyncConfig: LoggerModuleAsyncParams = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const config = configService.get<AppConfig>(APP_CONFIG_TOKEN);
    if (!config) {
      throw new Error('App config is not found.');
    }
    const { env } = config;

    return {
      pinoHttp: [
        {
          timestamp: stdTimeFunctions.isoTime,
          quietReqLogger: true,
          redact: ['req.headers.authorization'],
          genReqId: (req): ReqId =>
            (req as Request).header('X-Request-Id') ?? nanoid(),
          ...(env === Env.PRODUCTION
            ? {}
            : {
                level: 'debug',
                // https://github.com/pinojs/pino-pretty
                transport: {
                  target: 'pino-pretty',
                  options: { sync: true, singleLine: true },
                },
              }),
          autoLogging: {
            ignore: (req) => passUrl.has((req as Request).originalUrl),
          },
        },
        multistream(
          [
            // https://getpino.io/#/docs/help?id=log-to-different-streams
            { level: 'debug', stream: process.stdout },
            { level: 'error', stream: process.stderr },
            { level: 'fatal', stream: process.stderr },
          ],
          { dedupe: true },
        ),
      ],
    };
  },
};
