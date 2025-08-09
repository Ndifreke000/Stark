import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { logger } from './utils/logger';
import { initializeDatabase } from './database';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Simple test data
const testData = {
  transactions: [
    { hash: '0x123...', from: '0xabc...', to: '0xdef...', value: '1.5 ETH' },
    { hash: '0x456...', from: '0xghi...', to: '0xjkl...', value: '0.5 ETH' }
  ]
};

// WebSocket handler
wss.on('connection', (ws) => {
  logger.info('Client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'query') {
        // Send test data back
        ws.send(JSON.stringify({
          type: 'query_result',
          payload: testData.transactions
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid request' }
      }));
    }
  });
});

// Test endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/queries', (req, res) => {
  const { name, query, userId } = req.body;
  res.status(201).json({
    message: 'Query saved successfully',
    data: { name, query, userId }
  });
});

app.get('/queries/:userId', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Test Query',
      query: 'SELECT * FROM transactions LIMIT 10',
      created_at: new Date().toISOString()
    }
  ]);
});

// Start server
server.listen(port, () => {
  logger.info(`Test server running on port ${port}`);
});
