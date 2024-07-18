import { IsMobilePhone } from 'class-validator';

export class LoginReqDto {
  @IsMobilePhone(
    'id-ID',
    { strictMode: true },
    { message: 'Only Indonesian phone number is accepted' },
  )
  phoneNumber: string;
}
