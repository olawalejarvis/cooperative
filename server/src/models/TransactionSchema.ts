import { z } from 'zod';
import { TransactionMethod, TransactionSource, TransactionStatus, TransactionType } from '../entity/Transaction';

export const CreateUserTransactionSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a valid number with up to 2 decimal places'),
  type: z.nativeEnum(TransactionType).optional().default(TransactionType.CONTRIBUTIONS),
  method: z.nativeEnum(TransactionMethod).optional().default(TransactionMethod.CASH),
  status: z.nativeEnum(TransactionStatus).optional().default(TransactionStatus.PENDING),
  userId: z.string().uuid().optional(),
  source: z.nativeEnum(TransactionSource).optional().default(TransactionSource.SAVINGS),
  sourceId: z.string().uuid().optional(),
  externalTransactionId: z.string().max(255).optional(),
  receiptUrl: z.string().url().optional().default('http://localhost:3000/receipt.png'),
  description: z.string().max(255).optional().default(''),
});
