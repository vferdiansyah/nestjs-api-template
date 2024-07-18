import { registerAs } from '@nestjs/config';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  verifySid: string;
  retries: number;
}

export const TWILIO_CONFIG_TOKEN = 'twilio';

export const twilioConfig = registerAs<TwilioConfig>(
  TWILIO_CONFIG_TOKEN,
  (): TwilioConfig => ({
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    verifySid: process.env.TWILIO_VERIFY_SID ?? '',
    retries: process.env.TWILIO_RETRIES
      ? Number(process.env.TWILIO_RETRIES)
      : 3,
  }),
);
