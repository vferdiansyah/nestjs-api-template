import { registerAs } from '@nestjs/config';
import { Env } from '../shared/constants';

export interface AppConfig {
  port: number;
  env: string;
}

export const APP_CONFIG_TOKEN = 'app';

export const appConfig = registerAs<AppConfig>(
  APP_CONFIG_TOKEN,
  (): AppConfig => ({
    port: process.env.PORT ? Number(process.env.PORT) : 5000,
    env: process.env.NODE_ENV ?? Env.LOCAL,
  }),
);
