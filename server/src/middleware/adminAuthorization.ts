import { AuthRequest, Response, NextFunction } from '../types';

export function adminAuthorization(req: AuthRequest, res: Response, next: NextFunction) {
  const userRole = req.user?.userRole;
  if (userRole === 'admin' || userRole === 'superadmin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Admins only.' });
}
