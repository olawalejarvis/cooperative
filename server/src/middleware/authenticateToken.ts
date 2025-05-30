import { UserRepo } from '../database/Repos';
import { JwtTokenService } from '../services/JwtTokenService';
import { getLogger } from '../services/logger';
import { Response, NextFunction, AuthRequest } from '../types';

const logger = getLogger('middleware/authenticateToken');
/**
 * Middleware to authenticate user token.
 * It checks for a valid JWT token in the request headers or cookies,
 * verifies it, and attaches user information to the request object.
 * @param req
 * @param res
 * @param next
 */
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = JwtTokenService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    // Find user by ID from the decoded token
    const user = await UserRepo.findOne({ where: { id: decoded.userId, isActive: true, deleted: false }, relations: ['organization'] });
    
    // Check if user is valid and token matches the one stored in the user's table
    if (!user || !user.token || user.token !== token) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    // Attach user data to request object
    req.user = {
      userId: user.id,
      userRole: user.role,
      orgId: user?.organization?.id,
    };

    logger.info(`Authenticated user: ${req.user.userId} with role: ${req.user.userRole} and orgId: ${req.user.orgId}`);

    // Proceed to the next middleware or route handler 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
