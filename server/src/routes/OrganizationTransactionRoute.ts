import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { AggregatorController } from '../controllers/AggregatorController';
import { authenticateToken } from '../middleware/authenticateToken';
import { rootAuthenticateToken, rootUserAuthorization } from '../middleware/rootUserAuthorization';
import { adminAuthorization } from '../middleware/adminAuthorization';

/**
 * @file TransactionRoute.ts
 * @description This file defines the routes for user/org transaction-related operations.
 */
const orgTransactionRouter = Router();
const transactionController = new TransactionController();
const aggregatorController = new AggregatorController();

orgTransactionRouter.post('/:organizatioName/transactions',
  authenticateToken,
  transactionController.createTransaction
);

orgTransactionRouter.post('/:organizatioName/transactions/:transactionId/approve',
  authenticateToken,
  adminAuthorization,
  transactionController.approveTransaction
);

orgTransactionRouter.get('/:organizatioName/transactions/me',
  authenticateToken,
  transactionController.searchMyTransactions
);

orgTransactionRouter.get('/:organizatioName/transactions/:transactionId',
  authenticateToken,
  transactionController.getTransactionById
);

orgTransactionRouter.put('/:organizatioName/transactions/:transactionId/status',
  authenticateToken,
  adminAuthorization,
  transactionController.updateTransactionStatus
);

orgTransactionRouter.delete('/:organizatioName/transactions/:transactionId',
  authenticateToken,
  adminAuthorization,
  transactionController.deleteTransactionById
);

orgTransactionRouter.get('/:organizationName/transactions',
  authenticateToken,
  adminAuthorization,
  transactionController.searchOrganizationTransactions
);

orgTransactionRouter.get('/:organizationName/transactions/users/:userId',
  authenticateToken,
  adminAuthorization,
  transactionController.searchUserTransactions
);

orgTransactionRouter.get('/:organizationName/transactions/users/:userId/aggregate',
  authenticateToken,
  aggregatorController.aggregateUserTransactions
);

export { orgTransactionRouter };
