import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = getPool();
  try {
    return await client.query(text, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
