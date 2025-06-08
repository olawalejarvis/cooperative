import { SearchOrganizationsQuery } from '../controllers/OrganizationController';
import { OrganizationRepo } from '../database/Repos';
import { SearchResult } from './UserTransactionService';


/**
 * Service for organizations.
 */
export class OrganizationService {
  /**
   * Searches for organizations based on the provided parameters.
   * @param params Search parameters for organizations.
   * @returns A promise that resolves to an object containing the search results.
   * @throws {Error} If an error occurs during the search.
   */
  static async searchOrganizations(params: SearchOrganizationsQuery): Promise<SearchResult> {
    const skip = (params.page - 1) * params.limit;
    const qb = OrganizationRepo.createQueryBuilder('organization');
    
    if (params.q) {
      qb.where('LOWER(organization.name) LIKE :q', { q: `%${params.q.toLowerCase()}%` });
      qb.orWhere('LOWER(organization.label) LIKE :q', { q: `%${params.q.toLowerCase()}%` });
      qb.orWhere('LOWER(organization.description) LIKE :q', { q: `%${params.q.toLowerCase()}%` });
      qb.orWhere('LOWER(organization.aimAndObjective) LIKE :q', { q: `%${params.q.toLowerCase()}%` });
    }
    
    qb.orderBy(`organization.${params.sortBy}`, params.sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(params.limit);
    
    const [organizations, total] = await qb.leftJoinAndSelect('organization.createdBy', 'createdBy').getManyAndCount();
    
    return {
      data: organizations.map(org => org.toJSON()),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    } as SearchResult;
  }
}
