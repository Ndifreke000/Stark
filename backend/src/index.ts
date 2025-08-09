import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { setupWebSocketHandlers } from './websocket';
import { setupRoutes } from './routes';
import { initDatabase } from './database';
import { logger } from './utils/logger';
import dotenv from 'dotenv';

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
initDatabase()
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
