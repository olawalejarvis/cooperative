/**
 * @file OrganizationRoute.ts
 * @description This file defines the routes for organization-related operations.
 */
import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';
import { authenticateToken } from '../middleware/authenticateToken';
import { rootAuthenticateToken, rootUserAuthorization } from '../middleware/rootUserAuthorization';
import { adminAuthorization } from '../middleware/adminAuthorization';

const organizationRouter = Router();

const organizationController = new OrganizationController();

// org specific routes
organizationRouter.post('/',
  rootAuthenticateToken,
  adminAuthorization,
  organizationController.createOrganization
);

organizationRouter.get('/',
  rootAuthenticateToken,
  adminAuthorization,
  organizationController.searchOrganizations
);

organizationRouter.get('/me',
  authenticateToken,
  organizationController.getMyOrganization
);

// anybody can get organization by name
organizationRouter.get('/:organizationName',
  organizationController.getOrganizationByName
);

organizationRouter.delete('/:organizationName',
  rootAuthenticateToken,
  adminAuthorization,
  organizationController.deleteOrganizationByName
);

organizationRouter.put('/:organizationName/deactivate',
  rootAuthenticateToken,
  adminAuthorization,
  organizationController.deactivateOrganizationByName
);

organizationRouter.put('/:organizationName/reactivate',
  rootAuthenticateToken,
  adminAuthorization,
  organizationController.reActivateOrganizationByName
);

export { organizationRouter };
