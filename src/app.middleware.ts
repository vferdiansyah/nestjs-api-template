import type { INestApplication } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import { Env } from './shared/constants';

export function middleware(
  app: INestApplication,
  env: string,
): INestApplication {
  const isProduction = env === Env.PRODUCTION;

  app.use(compression());

  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: isProduction ? undefined : false,
      hidePoweredBy: true,
    }),
  );

  app.enableCors();

  return app;
}
