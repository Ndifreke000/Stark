import WebSocket from 'ws';
import { logger } from './utils/logger';
import { executeQuery } from './database';
import { z } from 'zod';

const QueryMessage = z.object({
  type: z.literal('query'),
  payload: z.object({
    query: z.string(),
  }),
});

type CustomWebSocket = WebSocket & {
  isAlive: boolean;
  userId?: string;
};

export function setupWebSocketHandlers(wss: WebSocket.Server): void {
  wss.on('connection', function connection(ws: CustomWebSocket) {
    ws.isAlive = true;

    ws.on('message', async function incoming(data) {
      try {
        const message = JSON.parse(data.toString());
        
        const parseResult = QueryMessage.safeParse(message);
        if (parseResult.success) {
          const { payload: { query } } = parseResult.data;
          
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

    ws.on('pong', function heartbeat() {
      ws.isAlive = true;
    });

    ws.on('close', function close() {
      logger.info('Client disconnected');
    });
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(rawWs: WebSocket) {
      const ws = rawWs as CustomWebSocket;
      if (!ws.isAlive) {
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping(() => {
        // Ping callback is optional but helps with error handling
        ws.isAlive = true;
      });
    });
  }, 30000);

  wss.on('close', function close() {
    clearInterval(interval);
  });
}
