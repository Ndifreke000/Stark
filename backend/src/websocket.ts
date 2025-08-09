import { WebSocket, WebSocketServer } from 'ws';
import { logger } from './utils/logger';
import { executeQuery } from './database';
import { z } from 'zod';

// Message validation schemas
const QueryMessage = z.object({
  type: z.literal('query'),
  payload: z.object({
    query: z.string(),
  }),
});

type WebSocketClient = WebSocket & {
  isAlive: boolean;
  userId?: string;
};

export const setupWebSocketHandlers = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocketClient) => {
    ws.isAlive = true;

    // Handle incoming messages
    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Validate query messages
        if (QueryMessage.safeParse(message).success) {
          const { payload: { query } } = message;
          
          const startTime = Date.now();
          try {
            const results = await executeQuery(query);
            const duration = Date.now() - startTime;

            ws.send(JSON.stringify({
              type: 'query_result',
              payload: results,
              duration,
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: {
                message: error instanceof Error ? error.message : 'Query execution failed',
              },
            }));
          }
        }
      } catch (error) {
        logger.error('Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: {
            message: 'Invalid message format',
          },
        }));
      }
    });

    // Handle client ping/pong
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle client disconnect
    ws.on('close', () => {
      logger.info('Client disconnected');
    });
  });

  // Setup ping interval to check client connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  // Cleanup on server close
  wss.on('close', () => {
    clearInterval(interval);
  });
};
