import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './utils/logger';
import { executeQuery } from './database';
import { z } from 'zod';

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
}

// Message validation schemas
const QueryMessageSchema = z.object({
  type: z.literal('query'),
  payload: z.object({
    query: z.string(),
  }),
});

export const setupWebSocketHandlers = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket) => {
    ws.isAlive = true;

    // Handle incoming messages
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Validate query messages
        if (QueryMessageSchema.safeParse(data).success) {
          const { payload: { query } } = data;
          
          try {
            const results = await executeQuery(query);
            ws.send(JSON.stringify({
              type: 'query_result',
              payload: results,
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
    wss.clients.forEach((client) => {
      const ws = client as WebSocketClient;
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
