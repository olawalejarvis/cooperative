import { Request, Response, NextFunction, AuthRequest } from '../types';
import { User } from '../entity/User';
import { z } from 'zod';
import { JwtTokenService } from '../services/JwtTokenService';
import { AppDataSource } from '../database/data-source';
import { Repository } from 'typeorm';


export type UserRepoType = Repository<User>;
export const UserRepo: UserRepoType = AppDataSource.getRepository(User);


export const CreateUserSchema = z.object({
  firstName: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string()
    .min(7)
    .max(15)
    .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number'),
  userName: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username contains invalid characters')
    .optional()
    .nullable(),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'),
  role: z.enum(['user', 'admin', 'superadmin']).optional(),
});

export const LoginUserSchema = z.object({
  username: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9@_.\-+]+$/, 'Username must be a valid email, phone number, or username'),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/, 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'),
});

export class UserController {
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = CreateUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }
      const user = new User();
      Object.assign(user, parseResult.data);

      // Save user
      await UserRepo.save(user);
      
      return res.status(201).json({ message: 'User created successfully', user: user.toJSON() });
    } catch (err) {
      next(err);
    }
  }

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = LoginUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten() });
      }

      const { username, password } = parseResult.data;
      // Try to find user by email, phoneNumber, or userName
      const user = await UserRepo.findOne({
        where: [
          { email: username },
          { phoneNumber: username },
          { userName: username },
        ],
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!user.isValidPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = JwtTokenService.generateToken(user.id, user.role);

      // Update last login time
      user.lastLogin = new Date().toISOString();
      await UserRepo.save(user);
      
      // Set token in httpOnly cookie
      JwtTokenService.setTokenInCookies(res, token);
      JwtTokenService.setTokenInHeaders(res, token);
      
      return res.status(200).json({ message: 'Login successful', user: user.toJSON(), token });
    } catch (err) {
      next(err);
    }
  }

  logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      JwtTokenService.clearToken(res)
      return res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      next(err);
    }
  }

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.user || {};
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await UserRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user: user.toJSON() });
    } catch (err) {
      next(err);
    }
  }
}
