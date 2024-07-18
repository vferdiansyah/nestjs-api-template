import {
  IsEmail,
  IsMobilePhone,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class VerifyOtpReqDto {
  @IsMobilePhone(
    'id-ID',
    { strictMode: true },
    { message: 'Only Indonesian phone number is accepted' },
  )
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumberString()
  code: string;
}
