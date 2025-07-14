// backend/src/middleware/validation.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api';

export class ValidationMiddleware {
  public static validateSignup = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
      fullName: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Full name must be at least 2 characters',
        'any.required': 'Full name is required',
      }),
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters',
          'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
          'any.required': 'Password is required',
        }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details?.[0]?.message || 'Validation failed';
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: errorMessage,
      };
      res.status(400).json(response);
      return;
    }

    next();
  };

  public static validateLogin = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required',
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details?.[0]?.message || 'Validation failed';
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: errorMessage,
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
}
