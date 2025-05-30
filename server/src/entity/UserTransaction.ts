import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { User } from './User';

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TransactionMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  PAYSTACK = 'paystack',
}

export enum TransactionType {
  SAVING_DEPOSIT = 'savings_deposit',
  DIVIDEND_PAYMENT = 'dividend_payment',
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

  @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.SAVING_DEPOSIT,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionMethod,
    default: TransactionMethod.CASH,
  })
  method!: TransactionMethod;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ name: 'reference_id', default: '' })
  referenceId!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl?: string;
  
  
  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
    
    // Ensure createdBy is not modified
    if (this.hasOwnProperty('createdBy')) {
      delete (this as any).createdBy;
    }
  }
  
  @BeforeInsert()
  beforeInsert() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }
}

