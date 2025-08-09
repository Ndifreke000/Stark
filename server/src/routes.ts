import { Express } from 'express';
import { z } from 'zod';
import { getSavedQueries, saveQuery } from './database';
import { logger } from './utils/logger';

// Validation schemas
const SaveQuerySchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
  userId: z.string(),
});

export const setupRoutes = (app: Express) => {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Get saved queries
  app.get('/queries/:userId', async (req, res) => {
    try {
      const queries = await getSavedQueries(req.params.userId);
      res.json(queries);
    } catch (error) {
      logger.error('Failed to get saved queries:', error);
      res.status(500).json({ 
        error: 'Failed to get saved queries' 
      });
    }
  });

  // Save query
  app.post('/queries', async (req, res) => {
    try {
      const validation = SaveQuerySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request body',
          details: validation.error.errors 
        });
      }

      const { name, query, userId } = validation.data;
      await saveQuery(userId, name, query);
      
      res.status(201).json({ 
        message: 'Query saved successfully' 
      });
    } catch (error) {
      logger.error('Failed to save query:', error);
      res.status(500).json({ 
        error: 'Failed to save query' 
      });
    }
  });
};
