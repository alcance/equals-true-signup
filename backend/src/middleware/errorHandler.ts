import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../types/api';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';

  // Check if it's an operational error
  if ('statusCode' in error && 'isOperational' in error) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Handle specific error types
  if (error.message.includes('email') && error.message.includes('unique')) {
    statusCode = 409;
    message = 'Email address already exists';
  }

  if (error.message.includes('Invalid token')) {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  // Create response object conditionally
  const response: ApiResponse = {
    success: false,
    message,
  };

  // Only add error property if in development mode
  if (process.env.NODE_ENV === 'development') {
    response.error = error.message;
  }

  res.status(statusCode).json(response);
};

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
