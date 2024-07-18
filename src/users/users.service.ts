import { Inject, Injectable } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { User } from './user.entity';
import { USER_REPOSITORY_TOKEN, UserRepository } from './user.repository';
import { UsersServiceInterface } from './users.interface';

@Injectable()
export class UsersService implements UsersServiceInterface {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
  ) {}

  async create(body: DeepPartial<User>): Promise<User> {
    const user = this.userRepository.create(body);
    return this.userRepository.save(user);
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phoneNumber },
    });
  }
}
