import { Request, Response, NextFunction } from 'express';
import { DatabaseConnection } from '../config/database';
import { ApiResponse } from '../types/api';

export class HealthController {
  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     uptime:
   *                       type: number
   *                     timestamp:
   *                       type: string
   *                     database:
   *                       type: string
   */
  public check = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbHealthy = await DatabaseConnection.healthCheck();
      
      const response: ApiResponse = {
        success: true,
        message: 'Service is healthy',
        data: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          database: dbHealthy ? 'connected' : 'disconnected',
          environment: process.env.NODE_ENV || 'development',
        },
      };

      const statusCode = dbHealthy ? 200 : 503;
      res.status(statusCode).json(response);
    } catch (error) {
      next(error);
    }
  };

  public ready = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbHealthy = await DatabaseConnection.healthCheck();
      
      if (dbHealthy) {
        res.status(200).json({ status: 'ready' });
      } else {
        res.status(503).json({ status: 'not ready' });
      }
    } catch (error) {
      res.status(503).json({ status: 'not ready' });
    }
  };
}