import pg from 'pg';
import { env } from '../lib/env.js';

let pool;
export function db() {
  if (!pool) {
    const url = env('DATABASE_URL');
    if (!url) throw new Error('DATABASE_URL is not set');
    pool = new pg.Pool({ connectionString: url, max: 5 });
  }
  return pool;
}

export async function q(text, params = []) {
  const res = await db().query(text, params);
  return res.rows;
}

export async function closeDb() {
  if (pool) await pool.end();
  pool = undefined;
}
