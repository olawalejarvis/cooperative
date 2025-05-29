import { AuthRequest, Response, NextFunction } from '../types';

export function rootUserAuthorization(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.userRole === 'root_user') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: Root user only.' });
}
