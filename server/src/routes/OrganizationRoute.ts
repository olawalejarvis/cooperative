import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';
import { authenticateToken } from '../middleware/authenticateToken';
import { rootUserAuthorization } from '../middleware/rootUserAuthorization';

const organizationRouter = Router();
const organizationController = new OrganizationController();

organizationRouter.post('/', authenticateToken, rootUserAuthorization, organizationController.createOrganization);

export { organizationRouter };
