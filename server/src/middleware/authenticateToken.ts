import { UserRepo } from '../entity/User';
import { JwtTokenService } from '../services/JwtTokenService';
import { Response, NextFunction, AuthRequest } from '../types';

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
    const user = await UserRepo.findOne({ where: { id: decoded.userId } });
    if (!user || !user.isActive || user.deleted) {
      // If user is not found or is inactive/deleted, return 401
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    // Attach user data to request object
    req.user = {
      userId: user.id,
      userRole: user.role,
    };

    // Proceed to the next middleware or route handler 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
