/**
 * @file OrganizationRoute.ts
 * @description This file defines the routes for organization-related operations.
 */
import { Router } from 'express';
import { OrganizationController } from '../controllers/OrganizationController';
import { authenticateToken } from '../middleware/authenticateToken';
import { rootUserAuthorization } from '../middleware/rootUserAuthorization';
import { adminAuthorization } from '../middleware/adminAuthorization';
import { OrganizationUserController } from '../controllers/OrganizationUserController';

const organizationRouter = Router();

const organizationController = new OrganizationController();
const organizationUserController = new OrganizationUserController();

// org specific routes
organizationRouter.post('/', authenticateToken, rootUserAuthorization, organizationController.createOrganization);
organizationRouter.get('/', authenticateToken, rootUserAuthorization, organizationController.searchOrganizations);
organizationRouter.get('/me', authenticateToken, organizationController.getMyOrganization);

// anybody can get organization by name
organizationRouter.get('/:organizationName', organizationController.getOrganizationByName);

organizationRouter.delete('/:organizationName', authenticateToken, rootUserAuthorization, organizationController.deleteOrganizationByName);


// organization user specific routes
organizationRouter.post('/:organizationName/users', authenticateToken, adminAuthorization, organizationUserController.createUserForOrganization);
organizationRouter.get('/:organizationName/users', authenticateToken, adminAuthorization, organizationUserController.searchUsersForOrganization);
organizationRouter.get('/:organizationName/users/me', authenticateToken, organizationUserController.getMeForOrganization);
organizationRouter.get('/:organizationName/users/:userId', authenticateToken, adminAuthorization, organizationUserController.getUserForOrganization);
organizationRouter.post('/:organizationName/users/login', organizationUserController.loginUserForOrganization);
organizationRouter.put('/:organizationName/users/logout', authenticateToken, organizationUserController.logoutUserFromOrganization);
organizationRouter.delete('/:organizationName/users/:userId', authenticateToken, adminAuthorization, organizationUserController.deleteUserForOrganization);
organizationRouter.put('/:organizationName/users/:userId', authenticateToken, organizationUserController.updateUserForOrganization);

// create user as a guest in an organization
organizationRouter.post('/:organizationName/users/guest', organizationUserController.createGuestUserForOrganization);
organizationRouter.put('/:organizationName/users/:userId/activate', authenticateToken, adminAuthorization, organizationUserController.activateGuestUserForOrganization);

// 2FA login routes
organizationRouter.post('/:organizationName/users/login-2fa', organizationUserController.loginUserForOrganization2FA);
organizationRouter.post('/:organizationName/users/login-2fa/verify', organizationUserController.verifyUser2FACodeForOrganization);

export { organizationRouter };
