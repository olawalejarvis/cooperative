import { Request, Response, NextFunction } from 'express';
import { getLogger } from '../services/logger';

const logger = getLogger('middleware/responseErrorInterceptor');

/**
 * Middleware to handle errors in the response.
 * It logs the error and sends a standardized error response.
 * @param err
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export function responseErrorInterceptor(err: any, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logger.error(`Error: ${err?.message || err}`);
  logger.error(err?.stack);


  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known error types
  if (err.name === 'ValidationError' || err.status === 400) {
    return res.status(400).json({ error: err.message || 'Bad Request' });
  }

  // Default to 500 Internal Server Error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}
