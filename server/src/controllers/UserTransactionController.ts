import { Response, NextFunction, AuthRequest } from '../types';
import { getLogger } from '../services/logger';
import { CreateUserTransactionSchema } from '../models/UserTransactionSchema';
import { UserRepo, UserTransactionRepo } from '../database/Repos';
import { UserRole } from '../entity/User';
import { TransactionStatus } from '../entity/UserTransaction';

const logger = getLogger('controllers/UserTransactionController');

export class UserTransactionController {
  createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateUserTransactionSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for createTransaction');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      
      const { userId: txUserId , ...txData } = parseResult.data;
      let userId = req.user?.userId;
      if (txUserId) {
        const user = await UserRepo.findOne({ where: { id: txUserId, isActive: true, deleted: false }, relations: ['organization'] });
        if (!user) {
          logger.warn(`User not found for transaction: ${txUserId}`);
          return res.status(404).json({ error: 'User not found' });
        }

        if (user.organization?.id !== req.user?.orgId && req.user?.userRole !== UserRole.ROOT_USER) {
          logger.warn(`Unauthorized access: User ${req.user?.userId} cannot create transaction for user ${txUserId} in organization ${user.organization?.id}`);
          return res.status(403).json({ error: 'Forbidden: You do not have permission to create transactions for this user' });
        }

        userId = user.id;
      }

      if (req.user?.userRole == UserRole.USER && req.user?.userId !== userId) {
        logger.warn(`Unauthorized access: User ${req.user.userId} cannot create transaction for user ${userId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to create transactions for this user' });
      }

      if (req.user?.userRole == UserRole.USER && txData.status !== TransactionStatus.PENDING) {
        logger.warn(`Unauthorized transaction status change: User ${req.user.userId} cannot set status to ${txData.status}`);
        return res.status(403).json({ error: 'Forbidden: You can only create transactions with status PENDING' });
      }
      
      const transaction = UserTransactionRepo.create({ ...txData, user: { id: userId } });
      
      transaction.createdBy = { id: req.user?.userId } as any; // Cast to any to avoid circular reference issues
      transaction.statusUpdatedBy = { id: req.user?.userId } as any; // Cast to any to avoid circular reference issues

      await UserTransactionRepo.save(transaction);
      logger.info(`Transaction created: ${transaction.id}`);
      return res.status(201).json({ message: 'Transaction created', transaction });
    } catch (err) {
      logger.error(`Error in createTransaction: ${err}`);
      next(err);
    }
  }
}
