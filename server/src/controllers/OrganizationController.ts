import { AuthRequest, Response, NextFunction } from '../types';
import { Organization } from '../entity/Organization';
import { AppDataSource } from '../database/data-source';
import { z } from 'zod';

export const CreateOrganizationSchema = z.object({
  name: z.string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z0-9 ]+$/, 'Organization name must be alphanumeric (letters, numbers, spaces only)')
});

export class OrganizationController {
  createOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateOrganizationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      const { name } = parseResult.data;
      const orgRepo = AppDataSource.getRepository(Organization);
      const exists = await orgRepo.findOne({ where: { name } });
      if (exists) {
        return res.status(409).json({ error: 'Organization with this name already exists.' });
      }
      const org = orgRepo.create({
        name,
        createdBy: { id: req.user!.userId }
      });
      await orgRepo.save(org);
      return res.status(201).json({ message: 'Organization created successfully', organization: org });
    } catch (err) {
      next(err);
    }
  }
}
