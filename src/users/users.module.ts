import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { USER_REPOSITORY_TOKEN, UserRepository } from './user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [
    UsersService,
    { provide: USER_REPOSITORY_TOKEN, useClass: UserRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
