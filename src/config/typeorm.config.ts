// Need to explicitly import dotenv lib so that TypeORM CLI picks up environment
// variable in .env file
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Env } from '../shared/constants';

export const TYPEORM_CONFIG_TOKEN = 'typeorm';

const config: DataSourceOptions = {
  type: 'postgres',
  ...((process.env.NODE_ENV === Env.LOCAL ||
    process.env.NODE_ENV === Env.DEVELOPMENT) && {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USERNAME ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    database: process.env.DATABASE_NAME ?? 'postgres',
  }),
  ...((process.env.NODE_ENV === Env.STAGING ||
    process.env.NODE_ENV === Env.PRODUCTION) && {
    replication: {
      master: {
        host: process.env.MASTER_DATABASE_HOST ?? 'localhost',
        port: parseInt(process.env.MASTER_DATABASE_PORT ?? '5432', 10),
        username: process.env.MASTER_DATABASE_USERNAME ?? 'postgres',
        password: process.env.MASTER_DATABASE_PASSWORD ?? 'postgres',
        database: process.env.MASTER_DATABASE_NAME ?? 'postgres',
      },
      slaves: [
        {
          host: process.env.SLAVE_1_DATABASE_HOST ?? 'localhost',
          port: parseInt(process.env.SLAVE_1_DATABASE_PORT ?? '5432', 10),
          username: process.env.SLAVE_1_DATABASE_USERNAME ?? 'postgres',
          password: process.env.SLAVE_1_DATABASE_PASSWORD ?? 'postgres',
          database: process.env.SLAVE_1_DATABASE_NAME ?? 'postgres',
        },
        {
          host: process.env.SLAVE_2_DATABASE_HOST ?? 'localhost',
          port: parseInt(process.env.SLAVE_2_DATABASE_PORT ?? '5432', 10),
          username: process.env.SLAVE_2_DATABASE_USERNAME ?? 'postgres',
          password: process.env.SLAVE_2_DATABASE_PASSWORD ?? 'postgres',
          database: process.env.SLAVE_2_DATABASE_NAME ?? 'postgres',
        },
      ],
    },
  }),
  logging: process.env.NODE_ENV === Env.PRODUCTION && false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
};

export const typeOrmConfig = registerAs<TypeOrmModuleOptions>(
  TYPEORM_CONFIG_TOKEN,
  (): TypeOrmModuleOptions => config,
);

// Need to explicitly default export config for TypeORM CLI migration
export default new DataSource(config);

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const typeOrmModuleOptions =
      this.configService.get<TypeOrmModuleOptions>(TYPEORM_CONFIG_TOKEN);
    if (!typeOrmModuleOptions) {
      throw new Error('TypeORM config is not found.');
    }

    return {
      ...typeOrmModuleOptions,
    };
  }
}
