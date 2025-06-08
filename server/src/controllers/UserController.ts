import { Response, NextFunction, AuthRequest } from '../types';
import { UserService } from '../services/UserService';
import { getLogger } from '../services/logger';
import { UserRepo } from '../database/Repos';
import { SearchUsersQuerySchema } from '../models/UserSchema';

const logger = getLogger('controllers/UserController');


/**
 * UserController handles user-related operations such as creating users,
 * logging in, logging out, fetching user details, and searching users.
 */
export class UserController {
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
      
      if (user.deleted || !user.isActive) {
        logger.warn('User is inactive or deleted in getMe');
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
      
      // Call UserService for search logic
      const result = await UserService.searchUsers(parseResult.data, req.user);
      logger.info('searchUsers executed');
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Error in searchUsers: ${err}`);
      next(err);
    }
  }
}
