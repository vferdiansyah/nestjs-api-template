import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/core/entity/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isEmailVerified: boolean;
}
