import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

export type UserRole = 'user' | 'admin' | 'superadmin';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'user_name', unique: true, nullable: true })
  userName!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
  
  @Column({ name: 'is_admin', default: false })
  isAdmin!: boolean;

  @Column({ type: 'enum', enum: ['user', 'admin', 'superadmin'], default: 'user' })
  role!: UserRole;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @Column({ name: 'created_at' })
  createdAt!: string;

  @Column({ name: 'updated_at' })
  updatedAt!: string;

  
  // Transient property for plain password (not persisted)
  password!: string;

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
