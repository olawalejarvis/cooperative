import { TransactionQuery } from '../controllers/UserTransactionController';
import { UserTransactionRepo } from '../database/Repos';


export interface SearchResult {
  data: any[]; // Replace with actual UserTransaction type
  total: number;
  page: number; 
  limit: number;
  totalPages: number;
}

/**
 * UserTransactionService handles operations related to user transactions,
 */
export class UserTransactionService {
  static async searchUserTransactions(params: TransactionQuery, userId?: string, organizationId?: string) {
    const {q, page, limit, sortBy, sortOrder, status, method, type } = params;
    const take = Math.max(1, limit);
    const skip = (Math.max(1, page) - 1) * take;
    const order: Record<string, 'ASC' | 'DESC'> = {};
    order[sortBy] = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const where: any = {};
   
    if (userId) {
      where.user = { id: userId };
    }

    if (organizationId) {
      where.organization = { id: organizationId };
    }
    
    if (q && typeof q === 'string') {
      where['OR'] = [
        { description: () => `ILIKE '%${q.replace(/'/g, "''") }%'` },
        { amount: () => `CAST(amount AS TEXT) ILIKE '%${q.replace(/'/g, "''") }%'` }
      ];
    }
    
    if (status) where.status = status;
    if (method) where.method = method;
    if (type) where.type = type;
    
    const [transactions, total] = await UserTransactionRepo.findAndCount({
      where,
      order,
      skip,
      take,
      relations: ['createdBy', 'statusUpdatedBy']
    });

    return {
      data: transactions.map(tx => tx.toJSON()),
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take)
    };
  }
}