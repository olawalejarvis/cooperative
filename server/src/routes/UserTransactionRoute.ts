import { Router } from 'express';
import { UserTransactionController } from '../controllers/UserTransactionController';
import { authenticateToken } from '../middleware/authenticateToken';

const transactionRouter = Router();
const userTransactionController = new UserTransactionController();

transactionRouter.post('/', authenticateToken, userTransactionController.createTransaction);

export { transactionRouter };
