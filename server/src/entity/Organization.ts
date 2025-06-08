import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn} from 'typeorm';
import { User } from './User';

/**
 * Represents the preferences for an organization.
 * This can include settings like currency, language, and other customizable options.
 */
export interface OrganizationPreferences {
  currency?: string;
  [key: string]: any; // Define the structure of preferences as needed
  // This allows for flexibility in organization preferences
  // while still maintaining type safety for known properties.
}

/**
 * Represents an organization entity in the system.
 * Organizations can have multiple users and transactions associated with them.
 */
@Entity({ name: 'organization' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  label?: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ name: 'aim_objective', nullable: true })
  aimAndObjective?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ default: false })
  deleted!: boolean;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  /**
   * The URL to the government certificate of the organization.
   * This can be used for verification and compliance purposes.
   * It is nullable to allow for organizations that may not have a certificate.
   */
  @Column({ name: 'government_certificate_url', nullable: true })
  governmentCertificateUrl?: string;
  
  /**
   * The government registration number for the organization.
   * This can be used for legal and compliance purposes.
   * It is nullable to allow for organizations that may not have a registration number.
   */
  @Column({ name: 'government_registration_number', nullable: true })
  governmentRegistrationNumber?: string;

  @Column({ name: 'preferences', nullable: true, type: 'json' })
  preferences?: OrganizationPreferences = { currency: 'NGN' }; // Default currency can be set to USD or any other default value


  /**
   * Converts the organization entity to a plain object for JSON serialization.
   * @returns A JSON representation of the organization entity.
   */
  toJSON() {
    const { ...organization } = this;
    return organization;
  }

  /**
   * This checks if the organization is not deleted and is active.
   * An organization is considered valid if it is active and not marked as deleted.
   * @returns A boolean indicating whether the organization is valid.
   */
  isValid() {
    return !this.deleted && this.isActive;
  }
}
