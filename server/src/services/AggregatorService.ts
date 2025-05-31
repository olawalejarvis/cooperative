import { UserTransactionRepo } from '../database/Repos';
import { AggregateQuery } from '../controllers/AggregatorController';

export class AggregatorService {
  static async aggregateUserTransactions(userId: string, query: AggregateQuery) {
    const {
      aggregationType,
      transactionType,
      transactionMethod,
      transactionStatus,
      deleted,
      dateRange,
      createdBeforeDate,
      createdAfterDate,
      isActive
    } = query;

    const qb = UserTransactionRepo.createQueryBuilder('tx')
      .select(`${aggregationType}(tx.amount)`, 'aggregate')
      .where('tx.user_id = :userId', { userId })
      .andWhere('tx.deleted = :deleted', { deleted })
      .andWhere('tx.is_active = :isActive', { isActive });

    if (transactionType) {
      qb.andWhere('tx.type = :transactionType', { transactionType });
    }
    if (transactionMethod) {
      qb.andWhere('tx.method = :transactionMethod', { transactionMethod });
    }
    if (transactionStatus) {
      qb.andWhere('tx.status = :transactionStatus', { transactionStatus });
    }
    if (dateRange) {
      if (dateRange.from) {
        qb.andWhere('tx.created_at >= :from', { from: dateRange.from });
      }
      if (dateRange.to) {
        qb.andWhere('tx.created_at <= :to', { to: dateRange.to });
      }
    }
    if (createdBeforeDate) {
      qb.andWhere('tx.created_at <= :createdBeforeDate', { createdBeforeDate });
    }
    if (createdAfterDate) {
      qb.andWhere('tx.created_at >= :createdAfterDate', { createdAfterDate });
    }

    const result = await qb.getRawOne();
    const aggregate = result?.aggregate ?? 0;
    return {
      aggregate,
      reqQuery: query 
    }
  }
}
