import { Pool } from 'pg';

const pool = new Pool({
  user: "default", 
  host: 'ep-solitary-sky-a1yx7747-pooler.ap-southeast-1.aws.neon.tech',
  database: 'verceldb',
  password: 'urmW6NFL9YTS',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },

  // ✅ Performance optimizations inside the same object
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  query_timeout: 10000, // Return an error after 10 seconds if query is still running
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
