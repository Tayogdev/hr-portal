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

  // ✅ Performance optimizations for better speed
  max: 20, // Increased maximum number of clients in the pool
  min: 2, // Minimum number of clients to keep in the pool
  idleTimeoutMillis: 60000, // Close idle clients after 60 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  query_timeout: 15000, // Return an error after 15 seconds if query is still running
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
  // Statement timeout to prevent long-running queries
  statement_timeout: 30000
});

// Handle pool errors
pool.on('error', () => {
  // Log error without console.error for production
});

export default pool;