import { BaseResponseDto } from '../../common/dtos';

export class LoginResDto<T> extends BaseResponseDto {
  constructor(
    readonly statusCode: number,
    readonly message: string,
    readonly data: T,
  ) {
    super(statusCode, message);
    this.data = data;
  }
}
