import { AuthRequest, Response, NextFunction } from '../types';

/**
 * Middleware to authorize admin users.
 * It checks if the user has an admin role and allows access to the next middleware or route handler.
 * @param req
 * @param res
 * @param next
 */
export function adminAuthorization(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user != null) {
    const userRole = req.user.userRole;
    if (['admin', 'superadmin', 'root_user'].includes(userRole)) {
      return next();
    }
  }
  return res.status(403).json({ error: 'Forbidden: Admins only.' });
}
