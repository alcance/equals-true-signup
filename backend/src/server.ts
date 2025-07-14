// backend/src/server.ts
import dotenv from 'dotenv';
import { App } from './app';
import { DatabaseConnection } from './config/database';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

class Server {
  private app: App;
  private port: number;

  constructor() {
    this.app = new App();
    this.port = parseInt(process.env.PORT || '3001', 10);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.connect();
      logger.info('Database connected successfully');

      // Start server
      this.app.listen(this.port);
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await DatabaseConnection.disconnect();
      logger.info('Server shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

const server = new Server();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await server.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  await server.shutdown();
  process.exit(0);
});

// Start server
server.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});