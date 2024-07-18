import { DeepPartial } from 'typeorm';
import { BaseRepositoryInterface } from '../common/core/interface/base.interface';
import { User } from './user.entity';

export type UserRepositoryInterface = BaseRepositoryInterface<User>;

export interface UsersServiceInterface {
  create(body: DeepPartial<User>): Promise<User>;
  findOneByPhoneNumber(phoneNumber: string): Promise<User | null>;
}
