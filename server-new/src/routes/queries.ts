import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import { getDatabase } from '../database/schema';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

const router = Router();

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  }
}

// Custom error class for API errors
export class APIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Middleware to handle async routes
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>): RequestHandler => 
  (req, res, next) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };

// Query routes
router.post('/query', asyncHandler(async (req, res) => {
  const querySchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  });

  const { title, content } = querySchema.parse(req.body);
  const db = getDatabase();
  
  const result = await db.run(
    'INSERT INTO queries (id, user_id, title, content) VALUES (?, ?, ?, ?)',
    [randomUUID(), req.user.id, title, content]
  );

  logger.info(`New query created: ${title}`);
  res.status(201).json({ id: result.lastID });
}));

router.get('/query/:id', asyncHandler(async (req, res) => {
  const db = getDatabase();
  const query = await db.get('SELECT * FROM queries WHERE id = ?', [req.params.id]);
  
  if (!query) {
    throw new APIError(404, 'Query not found');
  }

  res.json(query);
}));

router.get('/queries', asyncHandler(async (req, res) => {
  const db = getDatabase();
  const queries = await db.all('SELECT * FROM queries WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(queries);
}));

router.put('/query/:id', asyncHandler(async (req, res) => {
  const querySchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
  });

  const updates = querySchema.parse(req.body);
  const db = getDatabase();
  
  const setClause = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = [...Object.values(updates), req.params.id, req.user.id];
  
  const result = await db.run(
    `UPDATE queries SET ${setClause} WHERE id = ? AND user_id = ?`,
    values
  );

  if (result.changes === 0) {
    throw new APIError(404, 'Query not found or unauthorized');
  }

  logger.info(`Query updated: ${req.params.id}`);
  res.status(200).json({ message: 'Query updated successfully' });
}));

router.delete('/query/:id', asyncHandler(async (req, res) => {
  const db = getDatabase();
  const result = await db.run(
    'DELETE FROM queries WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );

  if (result.changes === 0) {
    throw new APIError(404, 'Query not found or unauthorized');
  }

  logger.info(`Query deleted: ${req.params.id}`);
  res.status(204).send();
}));

export default router;
