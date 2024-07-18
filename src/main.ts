import { ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { middleware } from './app.middleware';
import { AppModule } from './app.module';
import { APP_CONFIG_TOKEN, AppConfig } from './config';
import { Env } from './shared/constants';
import { swagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.setGlobalPrefix('api');

  const configService = app.get<ConfigService>(ConfigService);
  const appConfig = configService.get<AppConfig>(APP_CONFIG_TOKEN);
  if (!appConfig) {
    throw new Error('App config is not found.');
  }
  const { env, port } = appConfig;

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
      excludeExtraneousValues: true,
    }),
  );

  if (env === Env.PRODUCTION) {
    app.enable('trust proxy');
  } else {
    swagger(app);
  }

  middleware(app, env);

  await app.listen(port);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
