// backend/src/server.ts
import dotenv from 'dotenv';
import { App } from './app';
import { DatabaseConnection } from './config/database'; // Assuming this file exists and handles DB connection
import { logger } from './utils/logger'; // Assuming this file exists

// Load environment variables from .env file
dotenv.config();

class Server {
  private app: App;
  private port: number;

  constructor() {
    this.app = new App();
    this.port = parseInt(process.env.PORT || '3001', 10);

    // Bind error handlers early to catch issues during setup as well
    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
      logger.error(`Unhandled Rejection at Promise: ${promise}, reason: ${reason.message || reason}`, reason);
      // In production, you might want to exit here after a short delay to allow logs to flush
      // process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error(`Uncaught Exception: ${error.message}`, error);
      // Exit the process for uncaught exceptions, as the application state is unpredictable
      process.exit(1);
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.connect();
      logger.info('Database connected successfully');

      // Start server
      this.app.listen(this.port);
      logger.info(`Server running on port ${this.port}`);
      logger.info(`API Documentation: http://localhost:${this.port}/api/docs`); // Informative log
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1); // Exit if server fails to start
    }
  }

  public async shutdown(): Promise<void> {
    logger.info('Initiating server shutdown...');
    try {
      // Disconnect database (if connection exists and has a disconnect method)
      if (DatabaseConnection && typeof DatabaseConnection.disconnect === 'function') {
        await DatabaseConnection.disconnect();
        logger.info('Database disconnected successfully');
      }
      
      // Add any other cleanup logic here (e.g., closing open file handles, message queues)

      logger.info('Server shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
      // Continue to exit even if shutdown has errors, to prevent hang
    } finally {
      process.exit(0); // Ensure process exits after shutdown attempts
    }
  }
}

const server = new Server();

// Graceful shutdown on SIGTERM (e.g., from `kill` command or Docker stop)
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received, attempting graceful shutdown...');
  await server.shutdown();
});

// Graceful shutdown on SIGINT (e.g., Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received, attempting graceful shutdown...');
  await server.shutdown();
});

// Start the server application
server.start().catch((error) => {
  logger.error('Application failed to start during initial setup:', error);
  process.exit(1); // Ensure exit if the initial start process fails
});
