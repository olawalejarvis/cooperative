import { AuthRequest, Response, NextFunction } from '../types';
import { z } from 'zod';
import { OrganizationService } from '../services/OrganizationService';
import { OrganizationRepo } from '../database/Repos';
import { User, UserRole } from '../entity/User';

export const CreateOrganizationSchema = z.object({
  name: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z0-9]+$/, 'Organization name must be alphanumeric (letters and numbers only, no spaces)'),
  label: z.string().trim().max(100).optional(),
  description: z.string().trim().max(500).optional(),
  logoUrl: z.string().trim().url().max(500).optional(),
  aimAndObjective: z.string().trim().max(500).optional(),
  governmentCertificateUrl: z.string().trim().url().max(500).optional(),
  governmentRegistrationNumber: z.string().trim().max(100).optional(),
});

export const SearchOrganizationQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(''),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  sortBy: z.enum(['createdAt', 'name']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type SearchOrganizationsQuery = z.infer<typeof SearchOrganizationQuerySchema>

/**
 * OrganizationController
 * Handles organization-related operations such as creating, searching, and retrieving organizations.
 */
export class OrganizationController {
  /**
   * Create a new organization
   * This endpoint allows root admins to create a new organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  createOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateOrganizationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      if (!UserRole.isAdmin(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: Only root admins can create organizations' });
      }

      const { name } = parseResult.data;
      const exists = await OrganizationRepo.findOne({ where: { name } });
      if (exists) {
        return res.status(409).json({ error: 'Organization with this name already exists.' });
      }

      // Create the organization
      const org = OrganizationRepo.create({
        ...parseResult.data,
        createdBy: { id: req.user!.userId }
      });

      await OrganizationRepo.save(org);
      return res.status(201).json({ message: 'Organization created successfully', organization: org });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Search organizations
   * This endpoint allows root admins to search for organizations based on query parameters.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async searchOrganizations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!UserRole.isRootUser(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: Only root users can search organizations' });
      }
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

  /**
   * Get my organization
   * This endpoint retrieves the organization associated with the authenticated user.
   */
  async getMyOrganization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.orgId) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      const organization = await OrganizationRepo.findOne({ where: { id: req.user.orgId } });
      if (!organization || organization.deleted || !organization.isActive) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      return res.status(200).json({ organization });
    } catch (err) {
      next(err);
    }
  }  

  /**
   * Get organization by name
   * This endpoint retrieves an organization by its name.
   * This is useful for public access to organization details.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async getOrganizationByName(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationName } = req.params;
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.status(200).json({ organization });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deactivate an organization
   * This endpoint allows root users to delete an organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async deleteOrganizationByName(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationName } = req.params;

      // Only root user can delete
      if (!UserRole.isRootUser(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: Only root user can delete organizations' });
      }

      if (organizationName === 'root') {
        return res.status(400).json({ error: 'Cannot delete the root organization' });
      }

      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      organization.deleted = true;
      await OrganizationRepo.save(organization);
      
      return res.status(200).json({ message: 'Organization deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deactivate an organization
   * This endpoint allows root users to deactivate an organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async deactivateOrganizationByName(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationName } = req.params;
      
      // Only root user can deactivate
      if (!UserRole.isRootUser(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: Only root user can delete organizations' });
      }

      if (organizationName === 'root') {
        return res.status(400).json({ error: 'Cannot deactivate the root organization' });
      }

      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      organization.isActive = false;
      await OrganizationRepo.save(organization);
      
      return res.status(200).json({ message: 'Organization deactivated successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Re-activate an organization
   * This endpoint allows root users to re-activate an organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async reActivateOrganizationByName(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationName } = req.params;
      
      // Only root user can reactivate
      if (!UserRole.isRootUser(req.user?.userRole)) {
        return res.status(403).json({ error: 'Forbidden: Only root user can delete organizations' });
      }

      if (organizationName === 'root') {
        return res.status(400).json({ error: 'Cannot change the root organization' });
      }

      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      organization.isActive = true;
      organization.deleted = false; // Re-activate the organization
      await OrganizationRepo.save(organization);
      
      return res.status(200).json({ message: 'Organization re-activated successfully' });
    } catch (err) {
      next(err);
    }
  }
}
