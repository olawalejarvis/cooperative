import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BeforeUpdate
} from 'typeorm';
import { User } from './User';
import { Organization } from './Organization';

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
  CONTRIBUTIONS = 'contributions',
  WITHDRAWAL = 'withdrawal',
  DIVIDEND = 'dividend',
  EXPENSE = 'expense',
  INTEREST_INCOME = 'interest_income',
  LOAN_DISBURSEMENT = 'loan_disbursement',
  LOAN_REPAYMENT = 'loan_repayment',
  SHARES = 'shares',
  MEMBERSHIP_FEE = 'membership_fee',
}

export enum TransactionSource {
  LOAN = 'loan',
  PROJECT = 'project',
  SHARE = 'share',
  SAVINGS = 'savings',
  OTHER = 'other',
}

export enum CurrencyType {
  NAIRA = 'naira',
  DOLLAR = 'dollar',
  EURO = 'euro',
}

/**
 * Represents a financial transaction within the cooperative system.
 * Transactions can be contributions, withdrawals, dividends, expenses, etc.
 * They are associated with a user and an organization.
 * Transactions can have different statuses and methods of processing.
 * The currency type is also specified for each transaction.
 * Transactions can be linked to various sources like loans, projects, shares, etc.
 */
@Entity({ name: 'transaction' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * The amount of money involved in the transaction.
   * Stored as a string to avoid floating-point precision issues.
   * This allows for accurate representation of currency values.
   * The precision and scale are set to handle large amounts and cents.
   * For example, a value of '1000.00' represents one thousand naira.
   */
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount!: string;

  /**
   * The type of currency used in the transaction.
   * This is an enum that can represent different currency types such as Naira, Dollar, Euro, etc.
   * The default value is set to Naira, which is the primary currency for the cooperative.
   * This allows for flexibility in handling transactions in different currencies.
   */
  @Column({ name: 'currency_type', type: 'enum', enum: CurrencyType, default: CurrencyType.NAIRA })
  currencyType!: CurrencyType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /**
   * The user associated with this transaction.
   * This is a many-to-one relationship with the User entity.
   * It allows tracking which user initiated or is involved in the transaction. 
   * The onDelete behavior is set to SET NULL, meaning if the user is deleted,
   * this field will be set to null instead of deleting the transaction.
   * This is useful for maintaining transaction history even if the user is no longer present.
   * if no user is associated with the transaction, this field can be null.
   * For example, a transaction could be created by an admin on behalf of the organization,
   * or it could be a system-generated transaction that does not involve a specific user.
   */
  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * The admin user who last updated the status of this transaction.
   * This is a many-to-one relationship with the User entity.
   * It allows tracking who last modified the transaction status.
   * The onDelete behavior is set to SET NULL, meaning if the user is deleted,
   * this field will be set to null instead of deleting the transaction.
   * This is useful for maintaining transaction history even if the user is no longer present.
   */
  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'status_updated_by' })
  statusUpdatedBy?: User;

  @Column({ default: false })
  deleted!: boolean;

  @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;
  
  /**
   * The type of transaction being recorded.
   * This is an enum that categorizes the transaction into various types such as contributions, withdrawals, dividends, expenses, etc.
   * The default value is set to contributions, which is the most common type of transaction in the cooperative.
   * This allows for easy filtering and reporting of transactions based on their type.
   * For example, a transaction of type 'withdrawal' would indicate that a user has withdrawn funds from their account.
   * A transaction of type 'loan_disbursement' would indicate that a loan has been disbursed to a user.
   * This field is crucial for understanding the nature of the transaction and its impact on the cooperative's finances.
   */
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.CONTRIBUTIONS,
  })
  type!: TransactionType;

  /**
   * The method used for this transaction.
   * This is an enum that can represent different methods such as cash, transfer, or payment gateway (e.g., Paystack).
   * The default value is set to cash, which is the most common method of transaction in the cooperative.
   * This allows for flexibility in handling transactions through various methods.
   */
  @Column({
    type: 'enum',
    enum: TransactionMethod,
    default: TransactionMethod.CASH,
  })
  method!: TransactionMethod;

  /**
   * The status of the transaction.
   * This is an enum that can represent different statuses such as pending, approved, or rejected.
   * The default value is set to pending, which indicates that the transaction is awaiting approval or processing.
   * This allows for tracking the progress of the transaction through its lifecycle.
   */
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  /**
   * The source of the transaction.
   * This is an enum that can represent different sources such as loan, project, share, savings, or other.
   * It allows for categorizing the transaction based on its origin or purpose.
   * For example, a transaction with source 'loan' would indicate that it is related to a loan disbursement or repayment.
   */
  @Column({ type: 'varchar', length: 32, nullable: true })
  source?: TransactionSource;

  /**
   * The ID of the source entity related to this transaction.
   * This is a UUID that references the specific entity (e.g., loanId, projectId, etc.) associated with the transaction.
   * It allows for linking the transaction to its source, enabling better tracking and reporting.
   * For example, if the transaction is related to a loan, this field would contain the ID of that loan.
   */
  @Column({ type: 'uuid', nullable: true })
  sourceId?: string; // Reference to loanId, projectId, etc.

  /**
   * The ID of the external transaction, if applicable.
   * This is a string that can be used to store an identifier from an external payment gateway or system.
   * It allows for tracking transactions that originate from external sources, such as online payment systems.
   * For example, if a user makes a payment through Paystack, this field could store the Paystack transaction ID.
   * This is useful for reconciling transactions between the cooperative's system and external payment providers.
   * It can also help in troubleshooting issues related to payment processing.
   * If the transaction does not originate from an external system, this field can be left empty or null.
   */
  @Column({ name: 'external_transaction_id', default: '', nullable: true })
  externalTransactionId?: string;

  /**
   * A brief description of the transaction.
   * This field allows for additional context or notes about the transaction.
   * It can be used to explain the purpose of the transaction or provide details that are not captured by other fields.
   * For example, a description could indicate the reason for a withdrawal or the nature of an expense.
   * This field is optional and can be left empty if no additional information is needed.
   */
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  /**
   * The URL of the receipt or proof of the transaction.
   * This field can store a link to a digital receipt or document that verifies the transaction.
   * It is useful for record-keeping and auditing purposes, allowing users to access proof of the transaction.
   * The URL can point to a file stored in a cloud storage service or an internal document management system.
   * This field is optional and can be left empty if no receipt is available.
   */
  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl?: string;

  /**
   * The organization associated with this transaction.
   * This is a many-to-one relationship with the Organization entity.
   * It allows for tracking which organization the transaction belongs to, enabling better financial management and reporting.
   * The onDelete behavior is set to CASCADE, meaning if the organization is deleted,
   * all associated transactions will also be deleted.
   * This is useful for maintaining data integrity and ensuring that transactions are not orphaned.
   */
  @ManyToOne(() => Organization, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
  

  @BeforeUpdate()
  beforeUpdate() {
    // Ensure createdBy is not modified
    if (this.hasOwnProperty('createdBy')) {
      delete (this as any).createdBy;
    }
  }

  /**
   * Converts the transaction entity to a plain object for JSON serialization.
   * This method is useful for sending transaction data over APIs or storing it in a database.
   * It excludes any sensitive or unnecessary fields that should not be exposed.
   * @returns A JSON representation of the transaction entity.
   */
  toJSON() {
    const { ...userTransaction } = this;
    return userTransaction;
  }
}

