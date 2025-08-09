import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function initializeDatabase(): Promise<void> {
  if (!db) {
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

export async function executeQuery(query: string): Promise<any[]> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  await db.run('INSERT INTO queries (query) VALUES (?)', query);
  
  try {
    const results = await db.all(query);
    return results;
  } catch (error) {
    throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
