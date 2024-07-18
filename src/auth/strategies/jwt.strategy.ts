import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_CONFIG_TOKEN, JwtConfig } from '../../config';
import type { JwtPayload, Payload } from '../auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtConfig>(JWT_CONFIG_TOKEN).jwtSecret,
      algorithms: [configService.get<JwtConfig>(JWT_CONFIG_TOKEN).jwtAlgorithm],
    });
  }

  public validate(payload: JwtPayload): Payload {
    return {
      userId: payload.sub,
    };
  }
}
