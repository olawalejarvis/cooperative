import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';

export enum UserRole  {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ name: 'phone_number', unique: true })
  phoneNumber!: string;

  @Column({ name: 'user_name', unique: true, nullable: true })
  userName?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ default: false })
  deleted!: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @Column({ name: 'created_at' })
  createdAt!: string;

  @Column({ name: 'updated_at' })
  updatedAt!: string;


  /**
   * Transient properties
   */
  // Transient property for plain password (not persisted)
  password!: string;


  /**
   * Hooks
   */
  @BeforeInsert()
  beforeInsert() {
    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
    this.hashPassword();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date().toISOString();
    if (this.password) {
      this.hashPassword();
    }
    
    if (this.hasOwnProperty('createdAt')) {
      delete (this as any).createdAt;
    }

    if (this.hasOwnProperty('createdBy')) {
      delete (this as any).createdBy;
    }
  }


  hashPassword() {
    this.passwordHash = bcrypt.hashSync(this.password, 10);
  }

  isValidPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash);
  }

  toJSON() {
    const { passwordHash, ...user } = this;
    return user;
  }
}

export const UserRepo = AppDataSource.getRepository(User);
export type UserRepoType = Repository<User>;
