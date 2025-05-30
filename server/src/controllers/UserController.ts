import { Request, Response, NextFunction, AuthRequest } from '../types';
import { User, UserRole } from '../entity/User';
import { JwtTokenService } from '../services/JwtTokenService';
import { SearchUsersQuery, UserService } from '../services/UserService';
import { getLogger } from '../services/logger';
import { CreateUserSchema, LoginUserSchema, SearchUsersQuerySchema } from '../models/UserSchema';
import { OrganizationRepo, UserRepo } from '../database/Repos';

const logger = getLogger('controllers/UserController');


/**
 * UserController handles user-related operations such as creating users,
 * logging in, logging out, fetching user details, and searching users.
 */
export class UserController {
  createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for createUser');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      const { organizationId, ...userData } = parseResult.data;

      // Check for existing user by email, username, or phone number
      const orConditions = [];
      if (userData.email) {
        orConditions.push({ email: userData.email });
      }
      if (userData.userName) {
        orConditions.push({ userName: userData.userName });
      }
      
      // phoneNumber is mandatory, so it will always be present
      orConditions.push({ phoneNumber: userData.phoneNumber });

      const existingUser = await UserRepo.findOne({ where: orConditions });
      if (existingUser) {
        logger.warn(`Phone number, username or email already exists: ${existingUser.phoneNumber}, ${existingUser.userName}, ${existingUser.email}`);
        return res.status(409).json({ error: `Phone number, username or email already exists: ${existingUser.phoneNumber}, ${existingUser.userName}, ${existingUser.email}` });
      }

      const organization = await OrganizationRepo.findOne({ where: { id: organizationId } });
      if (!organization || organization.deleted || !organization.isActive) {
        logger.warn(`Organization not found: ${organizationId}`);
        return res.status(404).json({ error: 'Organization not found' });
      }

      if (req.user?.orgId != organization.id && req.user?.userRole !== UserRole.ROOT_USER) {
        logger.warn(`Unauthorized access to create user in organization: ${organizationId}`);
        return res.status(403).json({ error: 'Forbidden: You do not have permission to create users in this organization' });
      }
      
      const user = new User();
      Object.assign(user, userData);
      
      user.organization = organization;
      if (req.user?.userId) {
        user.createdBy = { id: req.user.userId } as User;
      }
      
      // Save user
      await UserRepo.save(user);
      logger.info(`User created: ${user.id}`);
      return res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      logger.error(`Error in createUser: ${err}`);
      next(err);
    }
  }

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = LoginUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn('Validation failed for loginUser');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const { username, password } = parseResult.data;
      // Try to find user by email, phoneNumber, or userName,
      // and ensure isActive and not deleted
      const user = await UserRepo.findOne({
        where: [
          { email: username, isActive: true, deleted: false },
          { phoneNumber: username, isActive: true, deleted: false },
          { userName: username, isActive: true, deleted: false },
        ],
        relations: ['organization']
      });

      if (!user) {
        logger.warn('Invalid credentials for loginUser');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!user.isValidPassword(password)) {
        logger.warn('Invalid password for loginUser');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = JwtTokenService.generateToken(user.id, user.role, user.organization?.id);

      // Update last login time and save token to user
      user.lastLogin = new Date().toISOString();
      user.token = token;
      await UserRepo.save(user);
      
      // Set token in httpOnly cookie
      JwtTokenService.setTokenInCookies(res, token);
      JwtTokenService.setTokenInHeaders(res, token);
      
      logger.info(`User logged in: ${user.id}`);
      return res.status(200).json({ message: 'Login successful', user: user.toJSON(), token });
    } catch (err) {
      logger.error(`Error in loginUser: ${err}`);
      next(err);
    }
  }

  logoutUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Clear token in user table
      if (req.user && req.user.userId) {
        const user = await UserRepo.findOne({ where: { id: req.user.userId } });
        if (user) {
          user.token = undefined;
          await UserRepo.save(user);
        }
      }
      JwtTokenService.clearToken(res)
      logger.info('User logged out');
      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      logger.error(`Error in logoutUser: ${err}`);
      next(err);
    }
  }

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user || {};
      if (!userId) {
        logger.warn('Unauthorized access to getMe');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await UserRepo.findOne({ where: { id: userId }, relations: ['organization', 'createdBy'] });
      if (!user) {
        logger.warn('User not found in getMe');
        return res.status(404).json({ error: 'User not found' });
      }
      logger.info(`getMe for user: ${user.id}`);
      return res.status(200).json(user.toJSON());
    } catch (err) {
      logger.error(`Error in getMe: ${err}`);
      next(err);
    }
  }

  searchUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Zod validation for query params
      const parseResult = SearchUsersQuerySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn('Validation failed for searchUsers');
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      // use SearchUsersQuery interface for type safety
      const query: SearchUsersQuery = parseResult.data
      
      // Call UserService for search logic
      const result = await UserService.searchUsers(query, req.user);
      logger.info('searchUsers executed');
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in searchUsers: ${err}`);
      next(err);
    }
  }
}
