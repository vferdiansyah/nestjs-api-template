import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  QueryRunner,
  Repository,
} from 'typeorm';
import { BaseRepositoryInterface } from '../interface/base.interface';

export abstract class BaseRepository<T extends ObjectLiteral>
  implements BaseRepositoryInterface<T>
{
  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  protected createQueryRunner(): QueryRunner {
    return this.entityManager.connection.createQueryRunner();
  }

  async save(data: DeepPartial<T>): Promise<T> {
    const queryRunner = this.createQueryRunner();
    await queryRunner.connect();

    try {
      if (queryRunner.isTransactionActive) {
        return await this.repository.save(data);
      }

      await queryRunner.startTransaction();
      const result = await this.repository.save(data);
      await queryRunner.commitTransaction();

      return result;
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  create(data: DeepPartial<T>): T {
    return this.repository.create(data);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findOneById(id: any): Promise<T | null> {
    const options: FindOptionsWhere<T> = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id,
    };
    return this.repository.findOneBy(options);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async update(id: any, data: Partial<T>): Promise<T | null> {
    const queryRunner = this.createQueryRunner();
    await queryRunner.connect();

    try {
      if (queryRunner.isTransactionActive) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await this.repository.update(id, data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return await this.repository.findOneBy({ id });
      }

      await queryRunner.startTransaction();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.repository.update(id, data);
      await queryRunner.commitTransaction();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return await this.repository.findOneBy({ id });
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(data: DeepPartial<T>): Promise<T> {
    const queryRunner = this.createQueryRunner();
    await queryRunner.connect();

    try {
      if (queryRunner.isTransactionActive) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-param-reassign
        (data as any).deletedAt = new Date();
        return await this.repository.save(data);
      }

      await queryRunner.startTransaction();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-param-reassign
      (data as any).deletedAt = new Date();
      const result = await this.repository.save(data);
      await queryRunner.commitTransaction();

      return result;
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
