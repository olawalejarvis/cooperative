import { z } from 'zod';
import { TransactionMethod, TransactionStatus, TransactionType } from '../entity/UserTransaction';

export const CreateUserTransactionSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  type: z.nativeEnum(TransactionType).optional().default(TransactionType.SAVING_DEPOSIT),
  method: z.nativeEnum(TransactionMethod).optional().default(TransactionMethod.CASH),
  status: z.nativeEnum(TransactionStatus).optional().default(TransactionStatus.PENDING),
  userId: z.string().uuid().optional(),
  referenceId: z.string().optional().default(''),
  receiptUrl: z.string().url().optional().default('http://localhost:3000/receipt.png'),
  description: z.string().max(255).optional().default(''),
});
