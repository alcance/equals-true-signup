import { Request, Response, NextFunction } from 'express';
import { JwtConfig } from '../config/jwt';
import { AppError } from './errorHandler';
import { JwtPayload } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  public static authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Access token required', 401);
      }

      const token = authHeader.substring(7);
      const decoded = JwtConfig.verifyToken(token);
      
      req.user = decoded;
      next();
    } catch (error) {
      next(new AppError('Invalid or expired token', 401));
    }
  };

  public static optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = JwtConfig.verifyToken(token);
        req.user = decoded;
      }
      
      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
}
