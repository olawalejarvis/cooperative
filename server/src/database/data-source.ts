import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { getLogger } from '../services/logger';

dotenv.config();
// Ensure environment variables are loaded
const logger = getLogger('database/data-source');
if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  logger.error('Database environment variables are not set. Please check your .env file.');
  throw new Error('Database environment variables are not set. Please check your .env file.');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // set to false in production
  logging: false, // disable logging by default
  
  // Enable logging only if the environment variable is set
  ...(process.env.DB_LOGGING === 'true' && { logging: true }),
  
  // Custom logger to handle query logging
  logger: {
    logQuery: (query: string, parameters?: any[]) => logger.info(`Query: ${query} -- Params: ${JSON.stringify(parameters)}`),
    logQueryError: (error: string, query: string, parameters?: any[]) => logger.error(`QueryError: ${error} -- Query: ${query} -- Params: ${JSON.stringify(parameters)}`),
    logQuerySlow: (time: number, query: string, parameters?: any[]) => logger.warn(`QuerySlow: ${time}ms -- Query: ${query} -- Params: ${JSON.stringify(parameters)}`),
    logSchemaBuild: (message: string) => logger.info(`SchemaBuild: ${message}`),
    logMigration: (message: string) => logger.info(`Migration: ${message}`),
    log: (level: 'log' | 'info' | 'warn', message: any) => {
      if (level === 'log' || level === 'info') logger.info(message);
      else if (level === 'warn') logger.warn(message);
    },
  },
  entities: [__dirname + '/../entity/*.ts'],
  migrations: [],
  subscribers: [],
});
