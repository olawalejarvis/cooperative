import { Request, Response, NextFunction, AuthRequest } from '../types';
import { User, UserRole } from '../entity/User';
import { CreateUserSchema, LoginUserSchema, SearchUsersQuerySchema } from '../models/UserSchema';
import { getLogger } from '../services/logger';
import { OrganizationRepo, UserRepo } from '../database/Repos';
import { UserService } from '../services/UserService';
import { JwtTokenService } from '../services/JwtTokenService';
import { z } from 'zod';
import crypto from 'crypto';
import { NotificationService } from '../services/NotificationService';
import { UserPermission } from '../utils/UserPermission';

const logger = getLogger('controllers/OrganizationUserController');

export const UpdateUserSchema = z.object({
  firstName: z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
});

/**
 * OrganizationUserController handles user-related operations within an organization,
 * such as creating users, logging in, logging out, fetching user details, and searching users.
 */
export class OrganizationUserController {
  /**
   * Creates a new user for a specific organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  createUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const parseResult = CreateUserSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        logger.warn('Validation failed for createUserForOrganization');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      
      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      const { email, userName, phoneNumber, ...userData } = parseResult.data;
      
      // Check for existing user by email, username, or phone number WITHIN the same organization
      const orConditions = [];
      if (email) orConditions.push({ email, organization: { id: organization.id } });
      if (userName) orConditions.push({ userName, organization: { id: organization.id } });
      orConditions.push({ phoneNumber, organization: { id: organization.id } });
      
      const existingUser = await UserRepo.findOne({ where: orConditions, relations: ['organization'] });
      if (existingUser) {
        if (email && existingUser.email === email) {
          logger.warn(`Email already exists in organization: ${email}`);
          return res.status(409).json({ error: 'Email already exists in this organization' });
        }
        if (userName && existingUser.userName === userName) {
          logger.warn(`Username already exists in organization: ${userName}`);
          return res.status(409).json({ error: 'Username already exists in this organization' });
        }
        if (existingUser.phoneNumber === phoneNumber) {
          logger.warn(`Phone number already exists in organization: ${phoneNumber}`);
          return res.status(409).json({ error: 'Phone number already exists in this organization' });
        }
      }

      const user = new User();
      Object.assign(user, { email, userName, phoneNumber, ...userData });
      user.organization = organization;

      let responseMessage = 'success';
      
      if (req.user && UserPermission.canCreateUser(req.user, organization)) {
        user.createdBy = { id: req.user.userId } as User;
        user.isActive = true;
        user.isVerified = false; // Set user as unverified until they verify their account

        // create user account verification jwttoken
        const verificationToken = JwtTokenService.generateVerificationToken(user.id, organization.id);
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${organization.name}/verify-account?token=${verificationToken}`;

        // send email to verify account to user
        const notificationService = NotificationService.getInstance();
        await notificationService.sendAccountVerificationEmail(user, verificationUrl, organization.label);
        responseMessage = 'User created and verification email sent';
      } else {
        user.isActive = false; // Set user as inactive until approved
        
        // new user registration from a guest
        // send email to organization admin for approval
        const notificationService = NotificationService.getInstance();
        // Find the first admin or superadmin for the organization
        const adminUser = await UserRepo.findOne({
          where: [
            { organization: { id: organization.id }, role: UserRole.ADMIN, isActive: true, deleted: false },
            { organization: { id: organization.id }, role: UserRole.SUPERADMIN, isActive: true, deleted: false }
          ],
          order: { createdAt: 'ASC' }
        });
        if (adminUser && adminUser.email) {
          // Construct activation URL for admin to approve the user
          const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${organization.name}/admin/users/${user.id}/activate`;
          await notificationService.sendGuestAccountApprovalEmail(adminUser, user, organization, activationUrl);
          responseMessage = 'User created and notification sent to admin for approval';
        } else {
          logger.warn(`No admin found for organization ${organizationName} to notify about guest user creation`);
          return res.status(400).json({ error: 'No admin found to notify about guest user creation' });
        }
      }

      await UserRepo.save(user);
      logger.info(`User created for organization ${organizationName}: ${user.id}`);
      
      return res.status(201).json({ message: responseMessage });
    } catch (err) {
      logger.error(`Error in createUserForOrganization: ${err}`);
      next(err);
    }
  }

    /**
   * Activate a guest user by ID for a specific organization.
   * This endpoint is used by admins to activate a guest user.
   */
  activateGuestUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access to activate guest user in organization: ${req.user?.orgLabel}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to activate users in this organization' });
      }

      // Find guest user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, deleted: false, organization: { id: req.user?.orgId } } });
      if (!user) {
        logger.warn(`Guest user not found in organization: ${userId}`);
        return res.status(404).json({ error: 'Guest user not found in this organization' });
      }

      // create verification token for the user
      // send email to account vrification to user
      const verificationToken = JwtTokenService.generateVerificationToken(user.id, req.user?.orgId);
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/${req.user?.orgName}/verify-account?token=${verificationToken}`;

      // send email to verify account to user
      const notificationService = NotificationService.getInstance();
      await notificationService.sendAccountVerificationEmail(user, verificationUrl, req.user?.orgLabel);

      user.isActive = true; // Activate the guest user
      user.activatedBy = { id: req.user?.userId } as User; // Set activatedBy to current user
      user.activatedAt = new Date(); // Set activation timestamp
      user.isVerified = false; // Set user as unverified until they verify their account
      user.updatedBy = { id: req.user?.userId } as User; // Set updatedBy to current user
      await UserRepo.save(user);
      
      logger.info(`Guest user ${userId} activated in organization ${req.user?.orgLabel}`);
      return res.status(200).json({ message: 'Guest user activated successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in activateGuestUserForOrganization: ${err}`);
      next(err);
    }
  }

    /**
   * Verifies a user account using the activation JWT token.
   * This endpoint is used when a user clicks the verification link in their email.
   * It checks the token, finds the user and organization, and marks the user as verified.
   * it also set user password.
   * @route POST /v1/organizations/:organizationName/users/verify-account
   * @param req
   * @param res
   * @param next
   */
  verifyUserAccountForOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const { password } = req.body;
      // Validate request body
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Verification token is required' });
      }
      
      // Decode and verify the token
      const decoded = JwtTokenService.verifyAccountVerificationToken(token);
      if (!decoded) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Find organization by name and match orgId
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName, isActive: true, deleted: false } });
      
      if (!organization?.isValid() || organization.id !== decoded.orgId) {
        return res.status(404).json({ error: 'Organization not found or does not match token' });
      }

      // Find user by id and org
      const user = await UserRepo.findOne({ where: { id: decoded.userId, isActive: true, deleted: false, organization: { id: organization.id } } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(200).json({ message: 'Account already verified' });
      }

      user.isVerified = true;
      user.updatedBy = { id: user.id } as User; // Set updatedBy to current user
      user.verifiedAt = new Date(); // Set verification timestamp
      user.password = password; // Set user password
      await UserRepo.save(user);

      logger.info(`User ${user.id} verified their account for organization ${organizationName}`);
      return res.status(200).json({ message: 'Account verified successfully' });
    } catch (err) {
      logger.error(`Error in verifyUserAccount: ${err}`);
      next(err);
    }
  }

  /**
   * Login user for a specific organization with 2FA (step 1: send code).
   * @route POST /v1/organizations/:organizationName/login-2fa
   */
  loginUserForOrganization2FA = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const parseResult = LoginUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for loginUserForOrganization2FA');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName, deleted: false, isActive: true } });
      if (!organization) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      const { username, password } = parseResult.data;
      const user = await UserRepo.findOne({
        where: [
          { email: username, isActive: true, deleted: false, organization: { id: organization.id } },
          { phoneNumber: username, isActive: true, deleted: false, organization: { id: organization.id } },
          { userName: username, isActive: true, deleted: false, organization: { id: organization.id } },
        ],
        relations: ['organization']
      });

      if (!user) {
        logger.warn('Invalid credentials for loginUserForOrganization2FA');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!user.isValidPassword(password)) {
        logger.warn('Invalid password for loginUserForOrganization2FA');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate a 6-digit code
      const code = (crypto.randomInt(100000, 999999)).toString();
      user.code = code;
      user.codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
      await UserRepo.save(user);
      
      // Send code via email (using NotificationService)
      const notificationService = NotificationService.getInstance();
      await notificationService.send2FaAuthenticationCode(user, organization, code)
      
      logger.info(`2FA code sent to user ${user.id} via email for organization ${organizationName}`);
      return res.status(200).json({ message: '2FA code sent to your email.' });
    } catch (err) {
      logger.error(`Error in loginUserForOrganization2FA: ${err}`);
      next(err);
    }
  }

  /**
   * Confirm 2FA code and complete login (step 2).
   * @route POST /v1/organizations/:organizationName/login-2fa/verify
   */
  verifyUser2FACodeForOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const { username, code } = req.body;
      
      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName, isActive: true, deleted: false } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      const user = await UserRepo.findOne({
        where: [
          { email: username, isActive: true, deleted: false, organization: { id: organization.id } },
          { phoneNumber: username, isActive: true, deleted: false, organization: { id: organization.id } },
          { userName: username, isActive: true, deleted: false, organization: { id: organization.id } },
        ],
        relations: ['organization']
      });
      if (!user || user.code !== code || !user.codeExpiresAt || user.codeExpiresAt < new Date()) {
        logger.warn('Invalid or expired 2FA code for verifyUser2FACodeForOrganization');
        return res.status(401).json({ error: 'Invalid or expired code' });
      }
      
      // Clear code and complete login
      user.code = undefined;
      user.codeExpiresAt = undefined;
      
      // Generate JWT token
      const token = JwtTokenService.generateToken(user.id, user.role, organization.id);
      user.lastLogin = new Date().toISOString();
      user.token = token;
      await UserRepo.save(user);
      
      JwtTokenService.setTokenInCookies(res, token);
      JwtTokenService.setTokenInHeaders(res, token);
      
      logger.info(`User logged in with 2FA for organization ${organizationName}: ${user.id}`);
      return res.status(200).json({ message: 'Login successful', user: user.toJSON(), token });
    } catch (err) {
      logger.error(`Error in verifyUser2FACodeForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Logout user from a specific organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  logoutUserFromOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;

      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName, isActive: true, deleted: false } });
      if (!organization) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Clear token in user table
      const user = await UserRepo.findOne({ where: { id: req.user?.userId, isActive: true, deleted: false, organization: { id: organization.id } } });
      if (user) {
        user.token = undefined;
        await UserRepo.save(user);
      }

      JwtTokenService.clearToken(res);
      logger.info(`User logged out from organization ${organizationName}`);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      logger.error(`Error in logoutUserFromOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Fetches the current user's details for a specific organization.
   * This is a protected route, organization should already have been verified
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  getMeForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await UserRepo.findOne({
        where: { id: req.user?.userId, organization: { id: req.user?.orgId } },
        relations: ['organization', 'createdBy']
      });

      if (!user) {
        logger.warn('User not found in getMeForOrganization');
        return res.status(404).json({ error: 'User not found' });
      }

      logger.info(`getMeForOrganization for user: ${user.id}`);
      return res.status(200).json(user.toJSON());
    } catch (err) {
      logger.error(`Error in getMeForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Fetch user by id within the specified organization.
   * only admin can view other user's data
   * this route should be protected by adminAuthorization middleware
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  getUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access to get user in organization: ${req.user?.orgLabel}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this organization' });        
      }
      
      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, organization: { id: req.user?.orgId } }, relations: ['organization'] });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }
      
      logger.info(`Fetched user ${userId} for organization ${req.user?.orgLabel}`);
      return res.status(200).json(user.toJSON());
    } catch (err) {
      logger.error(`Error in getUserForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Delete user by id within the specified organization (soft delete).
   * Only admins can delete users.
   */
  deleteUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access to delete user in organization: ${req.user?.orgLabel}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete users in this organization' });
      }

      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, organization: { id: req.user?.orgId } } });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      user.deleted = true;
      user.updatedBy = { id: req.user?.userId } as User; // Set updatedBy to current user
      await UserRepo.save(user);
      
      logger.info(`User ${userId} soft deleted in organization ${req.user?.orgLabel}`);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      logger.error(`Error in deleteUserForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Update user information for the current user in the specified organization.
   * User can only edit their own account.
   */
  updateMeForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate request body using Zod
      const parseResult = UpdateUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for updateUserForOrganization');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const { firstName, lastName } = parseResult.data;

      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: req.user?.userId, organization: { id: req.user?.orgId } } });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      if (typeof firstName === 'string') user.firstName = firstName;
      if (typeof lastName === 'string') user.lastName = lastName;
      
      user.updatedBy = { id: req.user?.userId } as User; // Set updatedBy to current user

      await UserRepo.save(user);
      logger.info(`User updated their data in organization ${req.user?.orgLabel}`);
      return res.status(200).json({ message: 'User updated successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in updateUserForOrganization: ${err}`);
      next(err);
    }
  }

    /**
   * Fetches all users for a specific organization.
   * only admins can do this
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  searchUsersForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = SearchUsersQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchUsersForOrganization');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      if (!UserRole.isRootUser(req.user?.userRole)) {
        logger.warn(`Unauthorized access to search users in organization: ${req.user?.orgId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to search users in this organization' });
      }

      // Call UserService for search logic
      const result = await UserService.searchUsers(parseResult.data, req.user, req.user?.userId);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in getUsersForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Deactivate a user in an organization.
   * Only admins can perform this action.
   * @route PATCH /v1/organizations/:organizationName/users/:userId/deactivate
   */
  deactivateUserStatusForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access to update user status in organization: ${req.user?.orgLabel}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update user status in this organization' });
      }

      // Prevent admin from deactivating themselves
      if (req.user?.userId === userId) {
        return res.status(400).json({ error: 'You cannot deactivate yourself.' });
      }

      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, deleted: false, organization: { id: req.user?.orgId } } });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      user.isActive = false; // Deactivate the user
      user.updatedBy = { id: req.user?.userId } as User;

      await UserRepo.save(user);
      logger.info(`User ${userId} deactivated in organization ${req.user?.orgLabel}`);
      return res.status(200).json({ message: 'User deactivated successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in updateUserStatusForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Update the role of a user in an organization.
   * Only admins can perform this action.
   * @route PATCH /v1/organizations/:organizationName/users/:userId/role
   */
  updateUserRoleForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      // Only allow roles defined in UserRole enum
      const allowedRoles = ['user', 'admin', 'superadmin', 'root'];
      if (!role || typeof role !== 'string' || !allowedRoles.includes(role.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid or missing role' });
      }
      if (!UserRole.isAdmin(req.user?.userRole)) {
        logger.warn(`Unauthorized access to update user role in organization: ${req.user?.orgLabel}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to update user roles in this organization' });
      }
      // Prevent admin from changing their own role
      if (req.user?.userId === userId) {
        return res.status(400).json({ error: 'You cannot change your own role.' });
      }
      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, deleted: false, isActive: true, organization: { id: req.user?.orgId } } });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }
      // Map string to UserRole enum value
      let newRole: UserRole;
      switch (role.toLowerCase()) {
        case 'user': newRole = UserRole.USER; break;
        case 'admin': newRole = UserRole.ADMIN; break;
        case 'superadmin': newRole = UserRole.SUPERADMIN; break;
        case 'root': newRole = UserRole.ROOT; break;
        default:
          return res.status(400).json({ error: 'Invalid role' });
      }
      user.role = newRole;
      user.updatedBy = { id: req.user?.userId } as User;
      await UserRepo.save(user);
      
      logger.info(`User ${userId} role updated to ${role} in organization ${req.user?.orgLabel}`);
      return res.status(200).json({ message: 'User role updated successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in updateUserRoleForOrganization: ${err}`);
      next(err);
    }
  }
}
