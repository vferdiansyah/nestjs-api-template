import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONFIG_TOKEN, JwtConfig } from '../../config';
import type { JwtPayload, Payload } from '../auth.interface';

@Injectable()
export class JwtVerifyStrategy extends PassportStrategy(
  Strategy,
  'jwt-verify',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // Expiration of the access_token is not checked when processing the refresh_token.
      secretOrKey: configService.get<JwtConfig>(JWT_CONFIG_TOKEN)?.jwtSecret,
    });
  }

  public validate(payload: JwtPayload): Payload {
    return { userId: payload.sub };
  }
}
