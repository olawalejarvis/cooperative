import { AuthRequest, Response, NextFunction } from '../types';
import { z } from 'zod';
import { OrganizationService } from '../services/OrganizationService';
import { OrganizationRepo } from '../database/Repos';

export const CreateOrganizationSchema = z.object({
  name: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z0-9 ]+$/, 'Organization name must be alphanumeric (letters, numbers, spaces only)')
});

export const SearchOrganizationQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  sortBy: z.enum(['createdAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type SearchOrganizationsQuery = z.infer<typeof SearchOrganizationQuerySchema>

export class OrganizationController {
  createOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateOrganizationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      const { name } = parseResult.data;
      const exists = await OrganizationRepo.findOne({ where: { name } });
      if (exists) {
        return res.status(409).json({ error: 'Organization with this name already exists.' });
      }
      const org = OrganizationRepo.create({
        name,
        createdBy: { id: req.user!.userId }
      });
      await OrganizationRepo.save(org);
      return res.status(201).json({ message: 'Organization created successfully', organization: org });
    } catch (err) {
      next(err);
    }
  }

  async searchOrganizations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parseResult = SearchOrganizationQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      const result = await OrganizationService.searchOrganizations(parseResult.data);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
