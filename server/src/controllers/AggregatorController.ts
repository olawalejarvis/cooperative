import { z } from 'zod';
import { AggregatorService } from '../services/AggregatorService';
import { UserRepo } from '../database/Repos';
import { TransactionType, TransactionMethod, TransactionStatus } from '../entity/Transaction';
import { Response, NextFunction, AuthRequest } from '../types';
import { UserRole } from '../entity/User';


export const AggregateQuerySchema = z.object({
  aggregationType: z.enum(['SUM', 'AVG', 'COUNT']).optional().default('SUM'),
  transactionType: z.nativeEnum(TransactionType).optional(),
  transactionMethod: z.nativeEnum(TransactionMethod).optional(),
  transactionStatus: z.nativeEnum(TransactionStatus).optional().default(TransactionStatus.APPROVED),
  deleted: z.boolean().optional().default(false),
  // dateRange is an object with optional from and to datetime strings
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
  createdBeforeDate: z.string().datetime().optional(),
  createdAfterDate: z.string().datetime().optional(),
});

export type AggregateQuery = z.infer<typeof AggregateQuerySchema>;
export type AggregationType = 'SUM' | 'AVG';


/**
 * AggregatorController is responsible for handling requests related to aggregators.
 */
export class AggregatorController {
  /**
   * Aggregates user transactions based on the provided query parameters.
   * Supports SUM/AVG of amount with flexible filters.
   */
  aggregateUserTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const parseResult = AggregateQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      // Validate user
      const user = await UserRepo.findOne({
        where: { id: userId, isActive: true, deleted: false },
        relations: ['organization']
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Ensure the user is authorized to access this data
      if (req.user?.userId !== userId && !UserRole.isAdmin(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s transactions' });
      }
      
      // Ensure the user is part of the same organization if not ROOT_USER
      if (user.organization?.id !== req.user?.orgId && !UserRole.isRootUser(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this user\'s transactions' });
      }

      // Aggregate user transactions
      const aggregate = await AggregatorService.aggregateUserTransactions(userId, parseResult.data);
      return res.status(200).json(aggregate);
    } catch (err) {
      next(err);
    }
  };
}
