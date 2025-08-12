import { Pool } from 'pg';
import logger from '@/lib/logger';

// Database configuration
const pool = new Pool({
  user: "default", 
  host: 'ep-solitary-sky-a1yx7747-pooler.ap-southeast-1.aws.neon.tech',
  database: 'verceldb',
  password: 'urmW6NFL9YTS',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  min: 2,  // Minimum number of clients in the pool
  idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
  connectionTimeoutMillis: 10000, // Increased from 5000ms
  query_timeout: 30000, // Increased from 15000ms
  statement_timeout: 30000,
  maxUses: 7500, // Recycle connections after 7500 uses
  allowExitOnIdle: false, // Keep pool alive
});

// Pool event handlers
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err, 'DatabasePool');
});

pool.on('connect', () => {
  logger.debug('New client connected to database', 'DatabasePool');
});

pool.on('remove', () => {
  logger.debug('Client removed from pool', 'DatabasePool');
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database health check failed', error as Error, 'DatabasePool');
    return false;
  }
}

// Close pool function
export async function closeDatabasePool(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database pool closed successfully', 'DatabasePool');
  } catch (error) {
    logger.error('Error closing database pool', error as Error, 'DatabasePool');
  }
}

export default pool;