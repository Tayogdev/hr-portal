import { Pool } from 'pg';

const pool = new Pool({
  user: "default", 
  host: 'ep-solitary-sky-a1yx7747-pooler.ap-southeast-1.aws.neon.tech',
  database: 'verceldb',
  password: 'urmW6NFL9YTS',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
