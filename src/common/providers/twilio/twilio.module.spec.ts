import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { twilioConfig } from '../../../config';
import { TwilioModule } from './twilio.module';
import { TwilioService } from './twilio.service';

describe('TwilioModule', () => {
  let twilioModule: TestingModule;

  beforeAll(async () => {
    twilioModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [twilioConfig],
        }),
        LoggerModule.forRoot(),
        TwilioModule,
      ],
    }).compile();
  });

  it('should compile the module', () => {
    expect(twilioModule).toBeDefined();
  });

  it('should have Twilio components', () => {
    expect(twilioModule.get(TwilioService)).toBeInstanceOf(TwilioService);
  });
});
