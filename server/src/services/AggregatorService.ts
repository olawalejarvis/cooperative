import { TransactionRepo } from '../database/Repos';
import { AggregateQuery } from '../controllers/AggregatorController';

export class AggregatorService {
  static async aggregateUserTransactions(query: AggregateQuery, orgId: string, userId?: string) {
    const {
      aggregationType,
      transactionType,
      transactionMethod,
      transactionStatus,
      transactionSource,
      deleted,
      dateRange,
      amountRange
    } = query;

    const qb = TransactionRepo.createQueryBuilder('tx')
      .select(`${aggregationType}(tx.amount)`, 'aggregate')
      .addSelect('COUNT(tx.id)', 'count')
      .andWhere('tx.deleted = :deleted', { deleted })

    if (userId) {
      qb.andWhere('tx.user_id = :userId', { userId });
    }

    if (orgId) {
      qb.andWhere('tx.organization_id = :orgId', { orgId });
    }

    if (transactionSource) {
      qb.andWhere('tx.source = :transactionSource', { transactionSource });
    }

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
    if (amountRange) {
      if (amountRange.min) {
        qb.andWhere('tx.amount >= :min', { min: parseFloat(amountRange.min) });
      }
      if (amountRange.max) {
        qb.andWhere('tx.amount <= :max', { max: parseFloat(amountRange.max) });
      }
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
