import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

function getConnectionConfig() {
  const isCloudRun = process.env.K_SERVICE !== undefined;
  
  if (isCloudRun) {
    // Cloud Run environment
    return {
      host: '/cloudsql/grantrigbydev:us-east1:postgres',
      database: 'postgres',
      user: 'freelance_db_owner',
      password: process.env.DB_PASSWORD,
      // Unix socket connection
      connectionString: process.env.DATABASE_URL
    };
  } else {
    // Local development environment
    return {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'freelance_db_owner',
      password: process.env.DB_PASSWORD,
      // TCP connection
      connectionString: process.env.DATABASE_URL
    };
  }
}

const pool = new Pool(getConnectionConfig());
export const db = drizzle(pool, { schema });