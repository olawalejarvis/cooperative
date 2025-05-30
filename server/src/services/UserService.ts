import { UserRepo } from '../database/Repos';
import { JwtPayload } from './JwtTokenService';

export interface UserSearchResult {
  users: any[]; // Replace with actual User type
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchUsersQuery {
  q?: string;
  limit: number;
  page: number;
  sortBy: 'createdAt' | 'firstName' | 'lastName';
  sortOrder: 'asc' | 'desc';
  deleted?: boolean;
  isActive?: boolean;
  role?: 'user' | 'admin' | 'superadmin';
  createdBy?: string;
}


export class UserService {
  static async searchUsers(params: SearchUsersQuery, currentUser?: JwtPayload): Promise<UserSearchResult> {
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

    if (currentUser?.userRole !== 'root_user') {
      qb.andWhere('user.organization = :organizationId', { organizationId: currentUser?.orgId });
    }

    qb.orderBy(`user.${params.sortBy}`, params.sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(params.limit);

    const [users, total] = await qb.getManyAndCount();
    return {
      users: users.map(user => user.toJSON()),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    } as UserSearchResult;
  }
}