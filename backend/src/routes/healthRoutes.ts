// backend/src/routes/healthRoutes.ts
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { HealthController } from '../controllers/healthController';

const router: ExpressRouter = Router();
const healthController = new HealthController();

router.get('/', healthController.check);
router.get('/ready', healthController.ready);

export default router;
