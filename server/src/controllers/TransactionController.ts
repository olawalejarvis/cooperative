import { Response, NextFunction, AuthRequest } from '../types';
import { getLogger } from '../services/logger';
import { CreateUserTransactionSchema } from '../models/TransactionSchema';
import { OrganizationRepo, UserRepo, TransactionRepo } from '../database/Repos';
import { User, UserRole } from '../entity/User';
import { Transaction, TransactionStatus } from '../entity/Transaction';
import { z } from 'zod';
import { UserTransactionService } from '../services/UserTransactionService';
import { Organization } from '../entity/Organization';
import { NotificationService } from '../services/NotificationService';

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
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional()
  }).optional(),
  source: z.string().optional(),
});

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export class TransactionController {
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

        if (user.organization?.id !== req.user?.orgId) {
          logger.warn(`Unauthorized access: User ${req.user?.userId} cannot create transaction for user ${txUserId} in organization ${user.organization?.id}`);
          return res.status(403).json({ error: 'Forbidden: You do not have permission to create transactions for this user' });
        }

        if (req.user?.userId !== user.id && !UserRole.isAdmin(req.user?.userRole)) {
          logger.warn(`Unauthorized access: User ${req.user?.userId} cannot create transaction for user ${user.id}`);
          return res.status(403).json({ error: 'Forbidden: You do not have permission to create transactions for this user' });
        }

        userId = user.id;
      }

      const newTransaction = {
        ...txData,
        organization: { id: req.user?.orgId } as Organization,
        createdBy: { id: req.user?.userId } as User, // Set the creator of the transaction
        statusUpdatedBy: { id: req.user?.userId } as User, // Set the user who updated the status
        user: { id: userId } as User
      };

      if (req.user?.userRole == UserRole.USER) {
        newTransaction.status = TransactionStatus.PENDING; // Default to pending for regular users
      }
      
      const transaction = TransactionRepo.create({ ...newTransaction });
      
      await TransactionRepo.save(transaction);

      // Notify admin if transaction is pending
      if (transaction.status === TransactionStatus.PENDING) {
        // Find the first admin or superadmin for the organization
        const adminUser = await UserRepo.findOne({
          where: [
            { organization: { id: req.user?.orgId }, role: UserRole.ADMIN, isActive: true, deleted: false },
            { organization: { id: req.user?.orgId }, role: UserRole.SUPERADMIN, isActive: true, deleted: false }
          ],
          order: { createdAt: 'ASC' }
        });
        if (adminUser && adminUser.email) {
          const notificationService = NotificationService.getInstance();
          // Construct the transaction link here
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const transactionLink = `${frontendUrl}/${req.user?.orgName}/transactions/${transaction.id}/approve`;
          await notificationService.sendTransactionApprovalRequestEmail(adminUser, transaction, transactionLink);
          logger.info(`Admin ${adminUser.id} notified for transaction approval: ${transaction.id}`);
        } else {
          logger.warn(`No admin found to notify for transaction approval in org ${req.user?.orgId}`);
        }
      }
      
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

      if (user.organization?.id !== req.user?.orgId) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view transactions for user ${userId} in organization ${user.organization?.id}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view transactions for this user' });
      }

      if (!UserRole.isAdmin(req.user?.userRole) && user.id !== req.user?.userId) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view transactions for user ${user.id}`);
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
      
      const organization = await OrganizationRepo.findOne({ where: { id: req.user?.orgId, isActive: true, deleted: false } });
      if (!organization) {
        logger.warn(`Organization not found: ${req.user?.orgId}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Check if the user has permission to view organization transactions
      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view organization transactions for org ${req.user?.orgId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view organization transactions' });
      }

      const result = await UserTransactionService.searchUserTransactions(parseResult.data, undefined, req.user?.orgId);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in getOrganizationTransactions: ${err}`);
      next(err);
    }
  }

  /**
   * Retrieves a specific transaction by its ID.
   */
  getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transactionId = req.params.transactionId;
      const transaction = await TransactionRepo.findOne({
        where: { id: transactionId, deleted: false },
        relations: ['user', 'createdBy', 'statusUpdatedBy']
      });

      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if the user has permission to view this transaction
      if (transaction.user.organization?.id !== req.user?.orgId) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot view transaction ${transactionId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this transaction' });
      }

      // If the user is not the owner of the transaction, check if they are admin user
      if (transaction.user.id !== req.user?.userId && !UserRole.isAdmin(req.user?.userRole)) {
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

      const transaction = await TransactionRepo.findOne({
        where: { id: transactionId, deleted: false },
        relations: ['organization']
      });

      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if the user has permission to update this transaction
      if (transaction.organization?.id !== req.user?.orgId) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot update transaction ${transactionId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update this transaction' });
      }

      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot update transaction for user ${transaction.user.id}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update this transaction' });
      }


      // Update the transaction status and save
      transaction.status = status;
      transaction.statusUpdatedBy = { id: req.user?.userId } as any; // Cast to any to avoid circular reference issues

      await TransactionRepo.save(transaction);
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
      const transaction = await TransactionRepo.findOne({ where: { id: transactionId, deleted: false }, relations: ['organization'] });

      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if the user has permission to delete this transaction
      if (transaction.organization?.id !== req.user?.orgId || !UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access: User ${req.user?.userId} cannot delete transaction ${transactionId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this transaction' });
      }

      // Soft delete the transaction
      transaction.deleted = true;
      transaction.statusUpdatedBy = { id: req.user?.userId } as any; // Cast to any to avoid circular reference issues

      await TransactionRepo.save(transaction);
      logger.info(`Transaction deleted: ${transaction.id}`);

      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (err) {
      logger.error(`Error in deleteTransactionById: ${err}`);
      next(err);
    }
  }

  /**
   * Approve a pending transaction (admin only).
   * Sends an email to the user when approved.
   */
  approveTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const transactionId = req.params.transactionId;
      const transaction = await TransactionRepo.findOne({
        where: { id: transactionId, deleted: false },
        relations: ['user', 'organization']
      });
      if (!transaction) {
        logger.warn(`Transaction not found: ${transactionId}`);
        return res.status(404).json({ error: 'Transaction not found' });
      }
      // Only admin or superadmin can approve
      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized: User ${req.user?.userId} is not admin for approval`);
        return res.status(403).json({ error: 'Forbidden: Only admin can approve transactions' });
      }
      // Only pending transactions can be approved
      if (transaction.status !== TransactionStatus.PENDING) {
        logger.warn(`Transaction ${transactionId} is not pending`);
        return res.status(400).json({ error: 'Only pending transactions can be approved' });
      }
      transaction.status = TransactionStatus.APPROVED;
      transaction.statusUpdatedBy = { id: req.user?.userId } as any;
      await TransactionRepo.save(transaction);
      // Notify the user
      const notificationService = NotificationService.getInstance();
      const user = await UserRepo.findOne({ where: { id: transaction.user.id }, relations: ['organization'] });
      if (user && user.email) {
        await notificationService.sendTransactionApprovalEmail(user, transaction);
      }
      logger.info(`Transaction approved and user notified: ${transaction.id}`);
      return res.status(200).json({ message: 'Transaction approved', transaction });
    } catch (err) {
      logger.error(`Error in approveTransaction: ${err}`);
      next(err);
    }
  }
}

