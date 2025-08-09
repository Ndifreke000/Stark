import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { setupWebSocketHandlers } from './websocket';
import { logger } from './utils/logger';
import { setupRoutes } from './routes';
import { initializeDatabase } from './database';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Setup WebSocket handlers
setupWebSocketHandlers(wss);

// Setup REST routes
setupRoutes(app);

// Initialize database
initializeDatabase()
  .then(() => {
    // Start server
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  });
