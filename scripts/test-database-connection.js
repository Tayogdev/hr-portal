#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run this to test if your database connection is working properly
 */

const { Pool } = require('pg');

// Simple logger for production readiness
const logger = {
  info: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(message);
    }
  },
  error: (message, error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(message, error);
    }
  },
  warn: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(message);
    }
  }
};

const pool = new Pool({
  user: "default", 
  host: 'ep-solitary-sky-a1yx7747-pooler.ap-southeast-1.aws.neon.tech',
  database: 'verceldb',
  password: 'urmW6NFL9YTS',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  query_timeout: 30000,
  statement_timeout: 30000,
});

async function testConnection() {
  logger.info('🔍 Testing database connection...\n');
  
  try {
    logger.info('1. Testing basic connection...');
    const client = await pool.connect();
    logger.info('   ✅ Connection established successfully');
    
    logger.info('\n2. Testing simple query...');
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    logger.info('   ✅ Query executed successfully');
    logger.info(`   📅 Current time: ${result.rows[0].current_time}`);
    logger.info(`   🗄️  Database: ${result.rows[0].db_version.split(' ')[0]}`);
    
    logger.info('\n3. Testing table access...');
    const tableResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('events', 'registeredEvent', 'users')
      ORDER BY table_name
    `);
    
    if (tableResult.rows.length > 0) {
      logger.info('   ✅ Required tables found:');
      tableResult.rows.forEach(row => {
        logger.info(`      - ${row.table_name} (${row.table_type})`);
      });
    } else {
      logger.warn('   ⚠️  No required tables found');
    }
    
    client.release();
    logger.info('\n🎉 All tests passed! Database connection is working properly.');
    
  } catch (error) {
    logger.error('\n❌ Database connection test failed:', error.message);
    
    if (error.message.includes('timeout')) {
      logger.error('\n💡 This appears to be a connection timeout issue.');
      logger.error('   Possible causes:');
      logger.error('   - Network connectivity issues');
      logger.error('   - Database server overload');
      logger.error('   - Firewall blocking connection');
      logger.error('   - Database credentials expired');
    } else if (error.message.includes('connection')) {
      logger.error('\n💡 This appears to be a connection issue.');
      logger.error('   Possible causes:');
      logger.error('   - Database server down');
      logger.error('   - Invalid connection parameters');
      logger.error('   - Network configuration issues');
    }
    
    logger.error('\n🔧 Troubleshooting steps:');
    logger.error('   1. Check your internet connection');
    logger.error('   2. Verify database credentials');
    logger.error('   3. Check if database service is running');
    logger.error('   4. Try again in a few minutes');
    
  } finally {
    await pool.end();
    logger.info('\n🔌 Database pool closed.');
  }
}

// Run the test
testConnection().catch((error) => {
  logger.error('Test script failed:', error.message);
  process.exit(1);
});
