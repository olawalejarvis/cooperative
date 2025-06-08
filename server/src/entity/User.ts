import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn, Repository, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from './Organization';

export enum UserRole  {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  ROOT = 'root'
}

export namespace UserRole {
  export function isRootUser(role?: string): boolean {
    return role === UserRole.ROOT;
  }
  export function isSuperAdmin(role?: string): boolean {
    return role === UserRole.SUPERADMIN || isRootUser(role);
  }
  export function isAdmin(role?: string): boolean {
    return role === UserRole.ADMIN || isSuperAdmin(role);
  }
  export function isUser(role?: string): boolean {
    return role === UserRole.USER || isAdmin(role);
  }
}

export interface UserPreferences {
  smsNotification?: boolean;
  emailNotification?: boolean;
  hideTotalContributions?: boolean;
  hideLoanTotal?: boolean;
  hideSharesTotal?: boolean;
  [key: string]: any; // Allow additional properties
  // This allows for flexibility in user preferences
  // while still maintaining type safety for known properties.
}


/**
 * Represents a user entity in the system.
 * Users can have different roles and are associated with an organization.
 */
@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ name: 'phone_number', unique: true })
  phoneNumber!: string;

  @Column({ name: 'user_name', unique: true, nullable: true })
  userName?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'is_active', default: false })
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

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy!: User;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'activated_by' })
  activatedBy!: User;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt!: Date;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt!: Date;

  @Column({ name: 'is_verified', default: false })
  isVerified?: boolean;

  @OneToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: string;

  @Column({ name: 'token', nullable: true })
  token?: string;

  @Column({ name: 'code', nullable: true })
  code?: string;

  @Column({ name: 'code_expires_at', type: 'timestamp', nullable: true })
  codeExpiresAt?: Date;

  @Column({ name: 'preferences', type: 'json', nullable: true })
  preferences?: UserPreferences = {
    smsNotification: true,
    emailNotification: true,
    hideTotalContributions: false,
    hideLoanTotal: false,
    hideSharesTotal: false,
  };


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
    if (this.password) {
      this.hashPassword();
    }
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

  /**
   * Hashes the password using bcrypt before saving to the database.
   * This method is called in the BeforeInsert and BeforeUpdate hooks.
   */
  hashPassword() {
    this.passwordHash = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  }

  /**
   * Validates the provided password against the stored password hash.
   * @param password The plain text password to validate.
   * @returns True if the password is valid, false otherwise.
   */
  isValidPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash);
  }

  toJSON() {
    const { password, passwordHash, token, ...user } = this;
    return user;
  }
}
