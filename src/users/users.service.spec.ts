/* eslint-disable @typescript-eslint/unbound-method */

import { TestBed } from '@automock/jest';
import { DeepPartial } from 'typeorm';
import { User } from './user.entity';
import { USER_REPOSITORY_TOKEN, UserRepository } from './user.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UsersService).compile();

    usersService = unit;
    userRepository = unitRef.get(USER_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should be able to create a user', async () => {
      const mockUser: DeepPartial<User> = {
        phoneNumber: '+628123456789',
      };
      userRepository.create.mockReturnValue(mockUser as User);
      userRepository.save.mockResolvedValue(mockUser as User);

      const response = await usersService.create(mockUser);

      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(response).toEqual(mockUser);
    });
  });

  describe('findOneByPhoneNumber', () => {
    it('should be able to find a user', async () => {
      const mockUser: DeepPartial<User> = {
        id: 'some-id',
        phoneNumber: '+628123456789',
      };
      userRepository.findOne.mockResolvedValue(mockUser as User);

      const response = await usersService.findOneByPhoneNumber(
        mockUser.phoneNumber!,
      );

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(response).toEqual(mockUser);
    });

    it('should return null if user not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const response = await usersService.findOneByPhoneNumber('0');

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(response).toBeNull();
    });
  });
});
