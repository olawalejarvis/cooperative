import { Router } from 'express';
import { UserTransactionController } from '../controllers/UserTransactionController';
import { authenticateToken } from '../middleware/authenticateToken';
import { rootUserAuthorization } from '../middleware/rootUserAuthorization';
import { adminAuthorization } from '../middleware/adminAuthorization';

const transactionRouter = Router();
const userTransactionController = new UserTransactionController();

transactionRouter.post('/', authenticateToken, userTransactionController.createTransaction);
transactionRouter.get('/', authenticateToken, rootUserAuthorization, userTransactionController.searchAllTransactions);
transactionRouter.get('/me', authenticateToken, userTransactionController.searchMyTransactions);
transactionRouter.get('/:transactionId', authenticateToken, userTransactionController.getTransactionById);
transactionRouter.put('/:transactionId/status', authenticateToken, userTransactionController.updateTransactionStatus);
transactionRouter.delete('/:transactionId', authenticateToken, adminAuthorization, userTransactionController.deleteTransactionById);
transactionRouter.get('/organizations/:organizationId', authenticateToken, adminAuthorization, userTransactionController.searchOrganizationTransactions);
transactionRouter.get('/users/:userId', authenticateToken, adminAuthorization, userTransactionController.searchUserTransactions);

export { transactionRouter };
