import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

export type UserLoanStatus = 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'cancelled';
export type UserLoanRepaymentSchedule = 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'one-time';
export type UserLoanType = 'personal' | 'business' | 'education' | 'emergency' | 'other';

/**
 * Represents a loan issued to a user/member by a cooperative organization.
 */
@Entity({ name: 'user_loan' })
export class UserLoan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * The organization that issued the loan.
   */
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  /**
   * The user/member who received the loan.
   * This field is required and cannot be null.
   */
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User; // The member who received the loan

  /**
   * The description of the loan purpose.
   */
  @Column({ type: 'text', nullable: true })
  description!: string; // Description of the loan purpose

  /**
   * The total amount of the loan principal.
   * This field is required and cannot be null.
   */
  @Column({ type: 'numeric', precision: 15, scale: 2 })
  principal!: string;

  /**
   * The interest rate applied to the loan.
   * This field is required and cannot be null.
   */
  @Column({ type: 'numeric', precision: 5, scale: 2 })
  interestRate!: string; // e.g., 5.00 for 5%

  /**
   * The total amount of the loan including principal and interest.
   * This field is required and cannot be null.
   */
  @Column({ type: 'numeric', precision: 15, scale: 2, default: '0.00' })
  interestAccrued!: string;

  /**
   * The total amount repaid by the user/member.
   */
  @Column({ type: 'numeric', precision: 15, scale: 2, default: '0.00' })
  totalRepaid!: string;

  /**
   * The status of the loan.
   */
  @Column({ type: 'varchar', length: 32 })
  status!: UserLoanStatus; // e.g., 'pending', 'approved', 'active', 'completed', 'defaulted', 'cancelled'

  @Column({ type: 'date' })
  issueDate!: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'date', nullable: true })
  completedDate?: Date;

  /**
   * The purpose of the loan.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  purpose?: string;

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

  @Column({ type: 'varchar', length: 32, nullable: true })
  loanType?: UserLoanType; // e.g., 'personal', 'business', 'education', etc.

  @Column({ type: 'varchar', length: 32, nullable: true })
  repaymentSchedule?: UserLoanRepaymentSchedule; // e.g., 'monthly', 'quarterly', 'annually', etc.

  @Column({ type: 'text', nullable: true })
  collateral?: string; // Details of any collateral provided for the loan

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  collateralValue?: string; // Value of the collateral, if applicable

  @Column({ type: 'json', nullable: true })
  collateralDocuments?: {
    documentUrl: string;
    referenceId?: string;
  }[];

  @Column({ type: 'json', nullable: true })
  gurantor?: {
    name: string;
    contact: string;
    relationship: string; // e.g., 'friend', 'family', 'colleague', etc.
  }[];

  @Column({ type: 'json', nullable: true })
  documents?: {
    documentUrl: string;
    referenceId?: string;
  }[];

  @Column({ type: 'json', nullable: true })
  repaymentReceipts?: {
    receiptUrl: string;
    referenceId?: string;
  }[];

}
