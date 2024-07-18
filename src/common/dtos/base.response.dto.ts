export class BaseResponseDto {
  constructor(
    readonly statusCode: number,
    readonly message: string,
  ) {}
}
