import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const dbName = process.env.PGDATABASE || 'stocksense_db';
const user = process.env.PGUSER || 'postgres';
const password = process.env.PGPASSWORD || 'postgres';
const host = process.env.PGHOST || 'localhost';
const port = parseInt(process.env.PGPORT || '5432', 10);

const runInit = async () => {
  console.log('⚡ Initializing StockSense Database...');

  // 1. Connect to default 'postgres' database to check/create 'stocksense_db'
  const rootPool = new Pool({
    user,
    host,
    password,
    port,
    database: 'postgres',
  });

  try {
    const rootClient = await rootPool.connect();
    console.log(`✅ Connected to default PostgreSQL instance at ${host}:${port}`);

    // Check if target database exists
    const checkDbRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDbRes.rows.length === 0) {
      console.log(`🔨 Database '${dbName}' does not exist. Creating database automatically...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`🎉 Database '${dbName}' created successfully!`);
    } else {
      console.log(`ℹ️ Database '${dbName}' already exists.`);
    }

    rootClient.release();
    await rootPool.end();

    // 2. Connect to the target 'stocksense_db' to run schema and seed scripts
    const targetPool = new Pool({
      user,
      host,
      password,
      port,
      database: dbName,
    });

    const client = await targetPool.connect();

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📜 Executing DDL Schema script (schema.sql)...');
    await client.query(schemaSql);
    console.log('✅ All Database Tables & Constraints created successfully!');

    // Read and run seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Executing Seed Data script (seed.sql)...');
    await client.query(seedSql);
    console.log('✅ Comprehensive Seed Data populated for all tables!');

    client.release();
    await targetPool.end();

    console.log('\n🎉 Database Setup Complete! All tables and seed data are ready in pgAdmin.\n');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

runInit();
