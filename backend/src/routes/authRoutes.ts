// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { AuthController } from '../controllers/authController';
import { ValidationMiddleware } from '../middleware/validation';
import { AuthMiddleware } from '../middleware/auth';
import { RateLimitConfig } from '../middleware/rateLimiting';

const router: ExpressRouter = Router();
const authController = new AuthController();

// Apply rate limiting to auth routes
router.use(RateLimitConfig.auth);

// Public routes
router.post(
  '/signup',
  RateLimitConfig.signup,
  ValidationMiddleware.validateSignup,
  authController.signup
);

router.post(
  '/login',
  ValidationMiddleware.validateLogin,
  authController.login
);

// Protected routes
router.get(
  '/verify',
  AuthMiddleware.authenticate,
  authController.verify
);

export default router;
