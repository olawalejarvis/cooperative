import * as Express from 'express';
import { JwtPayload } from '../services/JwtTokenService';

export interface Request extends Express.Request {
    // Custom properties can be added here
}

export interface Response extends Express.Response {
    // Custom properties can be added here
}

export interface NextFunction extends Express.NextFunction {
    // Custom properties can be added here
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
