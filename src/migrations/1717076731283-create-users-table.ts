import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1717076731283 implements MigrationInterface {
  private tableName = 'users';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersTable = new Table({
      name: this.tableName,
      columns: [
        {
          name: 'id',
          type: 'uuid',
          generationStrategy: 'uuid',
          isGenerated: true,
          isPrimary: true,
          isUnique: true,
        },
        {
          name: 'phoneNumber',
          type: 'varchar',
          isUnique: true,
          isNullable: false,
        },
        {
          name: 'email',
          type: 'varchar',
          isUnique: true,
          isNullable: true,
        },
        {
          name: 'firstName',
          type: 'varchar',
          isNullable: true,
        },
        {
          name: 'lastName',
          type: 'varchar',
          isNullable: true,
        },
        {
          name: 'isEmailVerified',
          type: 'boolean',
          isNullable: false,
          default: 'false',
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          isNullable: false,
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          isNullable: false,
          default: 'CURRENT_TIMESTAMP',
        },
        {
          name: 'deletedAt',
          type: 'timestamp',
          isNullable: true,
        },
      ],
    });
    await queryRunner.createTable(usersTable, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName, true);
  }
}
