import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, Repository } from 'typeorm';
import { User } from './User';

export enum UserTransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserTransactionType {
  CASH_DEPOSIT = 'cash_deposit',
  TRANSFER_DEPOSIT = 'transfer_deposit',
  CASH_WITHDRAWAL = 'cash_withdrawal',
  TRANSFER_WITHDRAWAL = 'transfer_withdrawal',
  MEMBERSHIP_PURCHASE = 'membership_purchase',
  SHARES_PURCHASE = 'shares_purchase'
}

export enum CurrencyType {
  NAIRA = 'naira',
  DOLLAR = 'dollar',
  EURO = 'euro',
}


@Entity({ name: 'user_transaction' })
export class UserTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount!: string; // Use string for currency to avoid JS float issues

  @Column({ name: 'currency_type', type: 'enum', enum: CurrencyType, default: CurrencyType.NAIRA })
  currencyType!: CurrencyType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'status_updated_by' })
  statusUpdatedBy?: User;

  @Column({ default: false })
  deleted!: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @Column({
    type: 'enum',
    enum: UserTransactionType,
    default: UserTransactionType.CASH_DEPOSIT,
  })
  type!: UserTransactionType;

  @Column({
    type: 'enum',
    enum: UserTransactionStatus,
    default: UserTransactionStatus.PENDING,
  })
  status!: UserTransactionStatus;

  @Column({ name: 'transaction_reference_id', default: '' })
  referenceId!: string;

  
  @BeforeUpdate()
  beforeUpdate() {
    // Prevent updating createdAt after insert
    if (this.hasOwnProperty('createdAt')) {
      delete (this as any).createdAt;
    }
  }
  
  @BeforeInsert()
  beforeInsert() {
    if (
      this.type === UserTransactionType.MEMBERSHIP_PURCHASE &&
      parseFloat(this.amount) < 5000.0
    ) {
      throw new Error('Membership purchase amount must be at least 5000.0');
    }

    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }
}

