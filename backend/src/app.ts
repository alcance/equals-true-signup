// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { specs } from './utils/swagger';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP',
    });

    // Apply rate limiter except for Swagger docs
    this.app.use((req, res, next) => {
      if (req.path.startsWith('/api/docs')) return next();
      return limiter(req, res, next);
    });

    // Serve Swagger JSON spec
    this.app.get('/api/docs/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(specs);
    });

    // Serve Swagger UI
    this.app.use(
      '/api/docs',
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: 'http://3.16.159.186:3001/api/docs/swagger.json',
          validatorUrl: null,
        },
      })
    );
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`API Documentation: http://localhost:${port}/api/docs`);
    });
  }
}

