export interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime?: number;
  error?: string;
}

export interface SavedQuery {
  id: string;
  title: string;
  description?: string;
  sql: string;
  tags?: string[];
  result?: QueryResult;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

const STORAGE_KEY = 'starklytics_queries';

function read(): SavedQuery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to read queries from storage', e);
    return [];
  }
}

function write(queries: SavedQuery[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
  } catch (e) {
    console.warn('Failed to write queries to storage', e);
  }
}

export function getQueries(): SavedQuery[] {
  return read();
}

export function getQueryById(id: string): SavedQuery | undefined {
  return read().find((q) => q.id === id);
}

export function saveQueryResult(queryId: string, result: QueryResult): SavedQuery | undefined {
  const queries = read();
  const query = queries.find((q) => q.id === queryId);
  if (!query) return undefined;

  query.result = result;
  query.updatedAt = new Date().toISOString();
  write(queries);
  return query;
}

export function createQuery(title: string, sql: string, description = '', tags: string[] = []): SavedQuery {
  const queries = read();
  const now = new Date().toISOString();
  const query: SavedQuery = {
    id: Date.now().toString(),
    title,
    description,
    sql,
    tags,
    createdAt: now,
    updatedAt: now,
    isPublic: false,
  };
  queries.unshift(query);
  write(queries);
  return query;
}

export function updateQuery(id: string, updates: Partial<SavedQuery>): SavedQuery | undefined {
  const queries = read();
  const query = queries.find((q) => q.id === id);
  if (!query) return undefined;

  Object.assign(query, updates);
  query.updatedAt = new Date().toISOString();
  write(queries);
  return query;
}

export function deleteQuery(id: string): boolean {
  const queries = read();
  const index = queries.findIndex((q) => q.id === id);
  if (index === -1) return false;

  queries.splice(index, 1);
  write(queries);
  return true;
}

export function searchQueries(searchTerm: string): SavedQuery[] {
  const queries = read();
  if (!searchTerm) return queries;

  const term = searchTerm.toLowerCase();
  return queries.filter((query) => 
    query.title.toLowerCase().includes(term) ||
    query.description?.toLowerCase().includes(term) ||
    query.sql.toLowerCase().includes(term) ||
    query.tags?.some(tag => tag.toLowerCase().includes(term))
  );
}
