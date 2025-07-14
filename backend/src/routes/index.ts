// backend/src/routes/index.ts
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import authRoutes from './authRoutes';
import healthRoutes from './healthRoutes';

const router: ExpressRouter = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EQUALS TRUE Sign-Up API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      docs: '/api/docs',
    },
  });
});

export default router;