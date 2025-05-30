import { Request, Response, NextFunction, AuthRequest } from '../types';
import { User, UserRole } from '../entity/User';
import { CreateUserSchema, LoginUserSchema, SearchUsersQuerySchema } from '../models/UserSchema';
import { getLogger } from '../services/logger';
import { OrganizationRepo, UserRepo } from '../database/Repos';
import { UserService } from '../services/UserService';
import { JwtTokenService } from '../services/JwtTokenService';
import { z } from 'zod';

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
      
      if (req.user?.userId) {
        user.createdBy = { id: req.user.userId } as User;
      }
      
      await UserRepo.save(user);
      logger.info(`User created for organization ${organizationName}: ${user.id}`);
      return res.status(201).json({ message: 'User created successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in createUserForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Fetches all users for a specific organization.
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  searchUsersForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const parseResult = SearchUsersQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchUsersForOrganization');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (req.user?.orgId !== organization.id && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access to search users in organization: ${organizationName}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to search users in this organization' });
      }

      // Call UserService for search logic
      const result = await UserService.searchUsers(parseResult.data, req.user, organization.id);
      
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in getUsersForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Login user for a specific organization.
   * @param req
   * @param res
   * @param next
   * @returns
   */
  loginUserForOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const parseResult = LoginUserSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        logger.warn('Validation failed for loginUserForOrganization');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
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
        logger.warn('Invalid credentials for loginUserForOrganization');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!user.isValidPassword(password)) {
        logger.warn('Invalid password for loginUserForOrganization');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = JwtTokenService.generateToken(user.id, user.role, organization.id);

      // Update last login time and save token to user
      user.lastLogin = new Date().toISOString();
      user.token = token;
      await UserRepo.save(user);
      
      // Set token in httpOnly cookie
      JwtTokenService.setTokenInCookies(res, token);
      JwtTokenService.setTokenInHeaders(res, token);

      logger.info(`User logged in for organization ${organizationName}: ${user.id}`);
      return res.status(200).json({ message: 'Login successful', user: user.toJSON(), token });
    } catch (err) {
      logger.error(`Error in loginUserForOrganization: ${err}`);
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
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Clear token in user table
      if (req.user?.userId) {
        const user = await UserRepo.findOne({ where: { id: req.user.userId, organization: { id: organization.id } } });
        if (user) {
          user.token = undefined;
          await UserRepo.save(user);
        }
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
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  getMeForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;

      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (req.user?.orgId !== organization.id) {
        logger.warn(`Unauthorized access to getMeForOrganization: ${organizationName}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this organization' });
      }

      const user = await UserRepo.findOne({
        where: { id: req.user?.userId, organization: { id: organization.id } },
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
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  getUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName, userId } = req.params;
      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (req.user?.orgId !== organization.id && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access to get user in organization: ${organizationName}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this organization' });
      }
      
      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, organization: { id: organization.id } }, relations: ['organization'] });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }
      
      logger.info(`Fetched user ${userId} for organization ${organizationName}`);
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
      const { organizationName, userId } = req.params;
      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (req.user?.orgId !== organization.id && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access to delete user in organization: ${organizationName}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to delete users in this organization' });
      }

      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, organization: { id: organization.id } }, relations: ['organization'] });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      user.deleted = true;
      user.updatedBy = { id: req.user?.userId } as User; // Set updatedBy to current user
      await UserRepo.save(user);
      
      logger.info(`User ${userId} soft deleted in organization ${organizationName}`);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      logger.error(`Error in deleteUserForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Create a guest user for a specific organization (no authentication required).
   * Guest users have role 'user' and a flag isActive = false. 
   * An admin can later activate the guest user.
   * @param req
   * @param res
   * @param next
   * @return
   */
  createGuestUserForOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationName } = req.params;
      const parseResult = CreateUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for createGuestUserForOrganization');
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
      user.role = UserRole.USER;
      user.isActive = false; // Guest users are inactive by default
      
      await UserRepo.save(user);
      
      logger.info(`Guest user created for organization ${organizationName}: ${user.id}`);
      return res.status(201).json({ message: 'Guest user created successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in createGuestUserForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Activate a guest user by ID for a specific organization.
   * This endpoint is used by admins to activate a guest user.
   */
  activateGuestUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName, userId } = req.params;

      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (req.user?.orgId !== organization.id && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access to activate guest user in organization: ${organizationName}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to activate users in this organization' });
      }

      // Find guest user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, organization: { id: organization.id }, role: UserRole.USER, isActive: false } });
      if (!user) {
        logger.warn(`Guest user not found in organization: ${userId}`);
        return res.status(404).json({ error: 'Guest user not found in this organization' });
      }

      user.isActive = true; // Activate the guest user
      user.updatedBy = { id: req.user?.userId } as User; // Set updatedBy to current user
      await UserRepo.save(user);
      
      logger.info(`Guest user ${userId} activated in organization ${organizationName}`);
      return res.status(200).json({ message: 'Guest user activated successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in activateGuestUserForOrganization: ${err}`);
      next(err);
    }
  }

  /**
   * Update user information for the current user in the specified organization.
   * User can only edit their own account.
   */
  updateUserForOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationName, userId } = req.params;
      // Validate request body using Zod
      const parseResult = UpdateUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for updateUserForOrganization');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const { firstName, lastName } = parseResult.data;
      
      // Find organization by name
      const organization = await OrganizationRepo.findOne({ where: { name: organizationName } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationName}`);
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      // Only allow user to update their own account
      if (req.user?.userId !== userId || req.user?.orgId !== organization.id) {
        logger.warn(`User ${req.user?.userId} tried to update user ${userId}`);
        return res.status(403).json({ error: 'Forbidden: You can only update your own account' });
      }

      // Find user by id and organization
      const user = await UserRepo.findOne({ where: { id: userId, organization: { id: organization.id } }, relations: ['organization'] });
      if (!user) {
        logger.warn(`User not found in organization: ${userId}`);
        return res.status(404).json({ error: 'User not found in this organization' });
      }
      if (typeof firstName === 'string') user.firstName = firstName;
      if (typeof lastName === 'string') user.lastName = lastName;
      user.updatedBy = { id: req.user?.userId } as User; // Set updatedBy to current user

      await UserRepo.save(user);
      logger.info(`User ${userId} updated their data in organization ${organizationName}`);
      return res.status(200).json({ message: 'User updated successfully', user: user.toJSON() });
    } catch (err) {
      logger.error(`Error in updateUserForOrganization: ${err}`);
      next(err);
    }
  }
}
