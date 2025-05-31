import { UserRepo } from '../database/Repos';
import { UserRole } from '../entity/User';
import { SearchUsersQuery } from '../models/UserSchema';
import { AuthUser } from './JwtTokenService';
import { SearchResult } from './UserTransactionService';


export class UserService {
  static async searchUsers(params: SearchUsersQuery, currentUser?: AuthUser, orgId?: string): Promise<SearchResult> {
    const skip = (params.page - 1) * params.limit;

    const qb = UserRepo.createQueryBuilder('user');

    if (params.q) {
      qb.where(
        '(LOWER(user.userName) LIKE :q OR LOWER(user.email) LIKE :q OR LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q)',
        { q: `%${params.q.toLowerCase()}%` }
      );
    } else {
      qb.where('1=1');
    }

    if (typeof params.deleted === 'boolean') {
      qb.andWhere('user.deleted = :deleted', { deleted: params.deleted });
    }
    if (typeof params.isActive === 'boolean') {
      qb.andWhere('user.isActive = :isActive', { isActive: params.isActive });
    }
    if (params.role) {
      qb.andWhere('user.role = :role', { role: params.role });
    }
    if (params.createdBy) {
      qb.andWhere('user.createdBy = :createdBy', { createdBy: params.createdBy });
    }

    if (orgId) {
      qb.andWhere('user.organization = :organizationId', { organizationId: orgId });
    } else if (!UserRole.isRootUser(currentUser?.userRole)) {
      qb.andWhere('user.organization = :organizationId', { organizationId: currentUser?.orgId });
    }

    qb.orderBy(`user.${params.sortBy}`, params.sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(params.limit);

    const [users, total] = await qb.getManyAndCount();
    return {
      data: users.map(user => user.toJSON()),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    } as SearchResult;
  }
}
