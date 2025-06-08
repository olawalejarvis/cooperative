import { Router } from "express";
import { OrganizationUserController } from "../controllers/OrganizationUserController";
import { authenticateToken } from "../middleware/authenticateToken";
import { adminAuthorization } from "../middleware/adminAuthorization";


/**
 * organization user specific routes
 */

const orgUserRouter = Router();
const orgUserController = new OrganizationUserController();


// send user registration request
orgUserRouter.post('/:organizationName/users/register',
  orgUserController.createUserForOrganization
);

// create user by admin of an organization
orgUserRouter.post('/:organizationName/users',
  authenticateToken, 
  adminAuthorization,
  orgUserController.createUserForOrganization
);

// create user by admin of an organization
orgUserRouter.post('/:organizationName/users',
  authenticateToken, 
  adminAuthorization,
  orgUserController.createUserForOrganization
);

orgUserRouter.put('/:organizationName/users/verify-account',
  authenticateToken,
  adminAuthorization,
  orgUserController.verifyUserAccountForOrganization
);

orgUserRouter.put('/:organizationName/users/:userId/activate',
  authenticateToken,
  adminAuthorization,
  orgUserController.activateGuestUserForOrganization
);

// 2FA login routes
orgUserRouter.post('/:organizationName/users/login-2fa',
  orgUserController.loginUserForOrganization2FA
);
orgUserRouter.post('/:organizationName/users/login-2fa/verify',
  orgUserController.verifyUser2FACodeForOrganization
);
orgUserRouter.put('/:organizationName/users/logout',
  authenticateToken,
  orgUserController.logoutUserFromOrganization
);

orgUserRouter.get('/:organizationName/users/me',
  authenticateToken,
  orgUserController.getMeForOrganization
);
orgUserRouter.get('/:organizationName/users/:userId',
  authenticateToken,
  adminAuthorization,
  orgUserController.getUserForOrganization
);
orgUserRouter.delete('/:organizationName/users/:userId',
  authenticateToken,
  adminAuthorization,
  orgUserController.deleteUserForOrganization
);
orgUserRouter.put('/:organizationName/users/me',
  authenticateToken,
  orgUserController.updateMeForOrganization
);
orgUserRouter.get('/:organizationName/users',
  authenticateToken,
  adminAuthorization,
  orgUserController.searchUsersForOrganization
);

orgUserRouter.put('/:organizationName/users/:userId/deactivate',
  authenticateToken,
  adminAuthorization,
  orgUserController.deactivateUserStatusForOrganization
);

orgUserRouter.put('/:organizationName/users/:userId/role',
  authenticateToken,
  adminAuthorization,
  orgUserController.updateUserRoleForOrganization
);


export { orgUserRouter };