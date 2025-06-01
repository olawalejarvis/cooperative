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
    } = query;

    const qb = UserTransactionRepo.createQueryBuilder('tx')
      .select(`${aggregationType}(tx.amount)`, 'aggregate')
      .addSelect('COUNT(tx.id)', 'count')
      .where('tx.user_id = :userId', { userId })
      .andWhere('tx.deleted = :deleted', { deleted })

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

    const rawResult = await qb.getRawOne();
    const result: { aggregate: number, count: number } | null = rawResult === undefined ? null : rawResult;
    const aggregate = result?.aggregate ?? 0;
    const count = result?.count ?? 0;
    
    // format aggregate as a currency string in NGN format
    const formattedAggregate = Number(aggregate).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
    
    return {
      amount: aggregate,
      count,
      formattedAggregate,
      ...query 
    }
  }
}
