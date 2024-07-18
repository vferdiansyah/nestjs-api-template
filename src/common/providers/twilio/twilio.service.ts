import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import PQueue from 'p-queue';
import pRetry from 'p-retry';
import { Twilio } from 'twilio';
import TwilioClient from 'twilio/lib/rest/Twilio';
import {
  VerificationInstance,
  VerificationListInstance,
  VerificationListInstanceCreateOptions,
} from 'twilio/lib/rest/verify/v2/service/verification';
import {
  VerificationCheckInstance,
  VerificationCheckListInstance,
  VerificationCheckListInstanceCreateOptions,
} from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import { TWILIO_CONFIG_TOKEN, TwilioConfig } from '../../../config';

@Injectable()
export class TwilioService {
  twilioClient: TwilioClient;

  verificationListInstance: VerificationListInstance;

  verificationCheckListInstance: VerificationCheckListInstance;

  private queue = new PQueue({ concurrency: 1 });

  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(TwilioService.name)
    private readonly logger: PinoLogger,
  ) {
    const twilioConfig =
      this.configService.get<TwilioConfig>(TWILIO_CONFIG_TOKEN);
    if (!twilioConfig) {
      throw new Error('Twilio config is not found.');
    }

    const { accountSid, authToken, verifySid } = twilioConfig;
    this.twilioClient = new Twilio(accountSid, authToken, { accountSid });
    this.verificationListInstance =
      this.twilioClient.verify.v2.services(verifySid).verifications;
    this.verificationCheckListInstance =
      this.twilioClient.verify.v2.services(verifySid).verificationChecks;
  }

  private async sendSms(
    options: VerificationListInstanceCreateOptions,
  ): Promise<VerificationInstance> {
    return this.verificationListInstance.create(options);
  }

  send(
    options: VerificationListInstanceCreateOptions,
  ): Promise<VerificationInstance> {
    const twilioConfig =
      this.configService.get<TwilioConfig>(TWILIO_CONFIG_TOKEN);
    return this.queue.add(() =>
      pRetry(() => this.sendSms(options), {
        onFailedAttempt: (error) => {
          this.logger.debug(
            `SMS to ${options.to} failed, retrying... (${error.retriesLeft} attempts left)`,
            error,
          );
        },
        retries: twilioConfig ? twilioConfig.retries : 3,
      }),
    );
  }

  verify(
    options: VerificationCheckListInstanceCreateOptions,
  ): Promise<VerificationCheckInstance> {
    return this.verificationCheckListInstance.create(options);
  }
}
