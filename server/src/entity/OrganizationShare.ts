import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Transaction } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

/**
 * Represents a shareholding by a member in a cooperative organization.
 */
@Entity({ name: 'organization_share' })
export class OrganizationShare {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User; // The member who owns the share

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  amount!: string; // Number of shares or value

  @Column({ type: 'varchar', length: 32, nullable: true })
  status?: 'active' | 'withdrawn' | 'pending' | 'forfeited';

  @Column({ type: 'date', nullable: true })
  issueDate?: Date;

  /**
   * Represents the transaction associated with this share.
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transaction_id' })
  transaction?: Transaction

  @Column({ type: 'date', nullable: true })
  withdrawalDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @Column({ default: false })
  deleted!: boolean;
}
