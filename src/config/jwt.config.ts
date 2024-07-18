import { Injectable } from '@nestjs/common';
import { ConfigService, registerAs } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

export interface JwtConfig {
  jwtAlgorithm:
    | 'HS256'
    | 'HS384'
    | 'HS512'
    | 'RS256'
    | 'RS384'
    | 'RS512'
    | 'ES256'
    | 'ES384'
    | 'ES512'
    | 'PS256'
    | 'PS384'
    | 'PS512'
    | 'none';
  jwtAudience: string;
  jwtIssuer: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
}

export const JWT_CONFIG_TOKEN = 'jwt';

export const jwtConfig = registerAs<JwtConfig>(
  JWT_CONFIG_TOKEN,
  (): JwtConfig =>
    ({
      jwtAlgorithm: process.env.JWT_ALGORITHM,
      jwtAudience: process.env.JWT_AUDIENCE,
      jwtIssuer: process.env.JWT_ISSUER,
      jwtSecret: process.env.JWT_SECRET,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    }) as JwtConfig,
);

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    const config = this.configService.get<JwtConfig>(JWT_CONFIG_TOKEN);
    if (!config) {
      throw new Error('JWT config is not found.');
    }

    return {
      secretOrPrivateKey: config.jwtSecret,
      signOptions: {
        algorithm: config.jwtAlgorithm,
        audience: config.jwtAudience,
        expiresIn: config.jwtExpiresIn,
        issuer: config.jwtIssuer,
      },
    };
  }
}
