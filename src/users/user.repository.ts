import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../common/core/repositories/base.repository';
import { User } from './user.entity';
import { UserRepositoryInterface } from './users.interface';

export const USER_REPOSITORY_TOKEN = 'USER_REPOSITORY';

@Injectable()
export class UserRepository
  extends BaseRepository<User>
  implements UserRepositoryInterface
{
  constructor(
    @InjectRepository(User) protected readonly userRepository: Repository<User>,
    @InjectEntityManager() protected readonly entityManager: EntityManager,
  ) {
    super(userRepository, entityManager);
  }
}
