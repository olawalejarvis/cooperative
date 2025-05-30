import { Response, NextFunction, AuthRequest } from '../types';
import { getLogger } from '../services/logger';
import { CreateUserTransactionSchema } from '../models/UserTransactionSchema';
import { OrganizationRepo, UserRepo, UserTransactionRepo } from '../database/Repos';
import { UserRole } from '../entity/User';
import { TransactionStatus } from '../entity/UserTransaction';
import { z } from 'zod';
import { UserTransactionService } from '../services/UserTransactionService';

const logger = getLogger('controllers/UserTransactionController');

export const TransactionQuerySchema = z.object({
  q: z.string().optional().default(''),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  sortBy: z.enum(['createdAt', 'amount', 'status', 'type', 'method']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional().default('desc'),
  status: z.string().optional(),
  method: z.string().optional(),
  type: z.string().optional(),
});

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

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

  /**
   * Retrieves all transactions for a specific user.
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  searchUserTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Zod validation for query params
      const parseResult = TransactionQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchUserTransactions');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const userId = req.params.userId;
      const user = await UserRepo.findOne({ where: { id: userId, isActive: true, deleted: false }, relations: ['organization'] });
      if (!user) {
        logger.warn(`User not found: ${userId}`);
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.organization?.id !== req.user?.orgId && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view transactions for user ${userId} in organization ${user.organization?.id}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view transactions for this user' });
      }

      const result = await UserTransactionService.searchUserTransactions(parseResult.data, user.id, user.organization?.id);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in getUserTransactions: ${err}`);
      next(err);
    }
  }

  /**
   * Get my transactions
   * Retrieves all transactions for the authenticated user.
   */
  searchMyTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Zod validation for query params
      const parseResult = TransactionQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchUserTransactions');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const result = await UserTransactionService.searchUserTransactions(parseResult.data, req.user?.userId, req.user?.orgId);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in getMyTransactions: ${err}`);
      next(err);
    }
  }

  /**
   * Retrieves all organization transactions.
   */
  searchOrganizationTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Zod validation for query params
      const parseResult = TransactionQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchOrganizationTransactions');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const orgId = req.params.organizationId;
      
      const organization = await OrganizationRepo.findOne({ where: { id: orgId, isActive: true, deleted: false } });
      if (!organization) {
        logger.warn(`Organization not found: ${orgId}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Check if the user has permission to view organization transactions
      if (req.user?.orgId !== orgId && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view organization transactions for org ${orgId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view organization transactions' });
      }

      const result = await UserTransactionService.searchUserTransactions(parseResult.data, undefined, orgId);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in getOrganizationTransactions: ${err}`);
      next(err);
    }
  }

  /**
   * Search all transactions across all users and organizations.
   * This method is typically restricted to root users.
   */
  searchAllTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Zod validation for query params
      const parseResult = TransactionQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchAllTransactions');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      // Only root users can access this endpoint
      if (req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} attempted to access all transactions`);
        return res.status(403).json({ error: 'Forbidden: Only root users can access all transactions' });
      }

      const result = await UserTransactionService.searchUserTransactions(parseResult.data, undefined, undefined);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in searchAllTransactions: ${err}`);
      next(err);
    }
  }

  /**
   * Retrieves a specific transaction by its ID.
   */
  getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transactionId = req.params.transactionId;
      const transaction = await UserTransactionRepo.findOne({
        where: { id: transactionId, deleted: false },
        relations: ['user', 'createdBy', 'statusUpdatedBy']
      });

      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if the user has permission to view this transaction
      if (transaction.user.organization?.id !== req.user?.orgId && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view transaction ${transactionId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this transaction' });
      }

      // If the user is not the owner of the transaction, check if they are admin user
      if (transaction.user.id !== req.user?.userId && (req.user?.userRole && ['admin', 'superadmin', 'root_user'].includes(req.user.userRole))) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view transaction for user ${transaction.user.id}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this transaction' });
      }

      return res.status(200).json(transaction);
    } catch (err) {
      logger.error(`Error in getTransactionById: ${err}`);
      next(err);
    }
  }

  /**
   * Updates the status of a specific transaction by its ID.
   * only admin users can update the status of a transaction.
   */
  updateTransactionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transactionId = req.params.transactionId;
      const { status } = req.body;

      // Validate status
      if (!Object.values(TransactionStatus).includes(status)) {
        logger.warn(`Invalid status: ${status}`);
        return res.status(400).json({ error: 'Invalid status' });
      }

      const transaction = await UserTransactionRepo.findOne({
        where: { id: transactionId, deleted: false },
        relations: ['user', 'createdBy', 'statusUpdatedBy']
      });

      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if the user has permission to update this transaction
      if (transaction.user.organization?.id !== req.user?.orgId && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot update transaction ${transactionId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update this transaction' });
      }


      // Update the transaction status and save
      transaction.status = status;
      transaction.statusUpdatedBy = { id: req.user?.userId } as any; // Cast to any to avoid circular reference issues

      await UserTransactionRepo.save(transaction);
      logger.info(`Transaction status updated: ${transaction.id}`);

      return res.status(200).json({ message: 'Transaction status updated', transaction });
    } catch (err) {
      logger.error(`Error in updateTransactionStatus: ${err}`);
      next(err);
    }
  }

  /**
   * Soft Deletes a specific transaction by its ID.
   * Only admin users can delete transactions.
   */
  deleteTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transactionId = req.params.transactionId;
      const transaction = await UserTransactionRepo.findOne({ where: { id: transactionId, deleted: false } });

      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }
      // Check if the user has permission to delete this transaction
      if (transaction.user.organization?.id !== req.user?.orgId && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot delete transaction ${transactionId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this transaction' });
      }


      // Soft delete the transaction
      transaction.deleted = true;
      transaction.statusUpdatedBy = { id: req.user?.userId } as any; // Cast to any to avoid circular reference issues

      await UserTransactionRepo.save(transaction);
      logger.info(`Transaction deleted: ${transaction.id}`);

      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (err) {
      logger.error(`Error in deleteTransactionById: ${err}`);
      next(err);
    }
  }
}

