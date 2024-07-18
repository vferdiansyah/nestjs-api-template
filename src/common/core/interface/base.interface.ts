import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';

export interface BaseRepositoryInterface<T> {
  create(data: DeepPartial<T>): T;
  save(data: DeepPartial<T>): Promise<T>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findOneById(id: string): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(data: DeepPartial<T>): Promise<T>;
}
