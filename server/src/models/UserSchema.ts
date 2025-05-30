import { z } from 'zod';

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
  organizationId: z.string().uuid(),
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

export const SearchUsersQuerySchema = z.object({
  q: z.string()
    .trim()
    .max(100)
    .regex(/^[a-zA-Z0-9@_.\-+]+$/, 'Search query must be alphanumeric or contain valid characters like @, _, -, +')
    .optional()
    .default(''),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  deleted: z.boolean().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['user', 'admin', 'superadmin']).optional(),
  createdBy: z.string().uuid().optional()  
});

export type SearchUsersQuery = z.infer<typeof SearchUsersQuerySchema>;
