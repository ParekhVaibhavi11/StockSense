import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configure pool with DATABASE_URL or individual PG credentials
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'stocksense_db',
      password: process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || '5432', 10),
    };

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('⚡ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
});

/**
 * Execute a raw parameterised SQL query
 * @param {string} text - SQL Query string
 * @param {Array} params - Array of parameters for $1, $2 placeholder substitution
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Acquire a client connection from the pool for atomic SQL transactions (BEGIN/COMMIT/ROLLBACK)
 */
export const getClient = () => pool.connect();
