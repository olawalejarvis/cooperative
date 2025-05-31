import { UserRole } from '../entity/User';
import { AuthRequest, Response, NextFunction } from '../types';

export function rootUserAuthorization(req: AuthRequest, res: Response, next: NextFunction) {
  if (UserRole.isRootUser(req.user?.userRole)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Root user only.' });
}
