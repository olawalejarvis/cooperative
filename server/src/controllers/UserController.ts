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
  /**
   * Searches for users based on query parameters.
   * Validates the query parameters using Zod schema.
   * @param req - The request object containing query parameters.
   * @param res - The response object to send the result.
   * @param next - The next middleware function in the stack.
   */
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
