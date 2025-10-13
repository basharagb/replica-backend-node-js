import { env } from './env.js';

export const appConfig = {
  appName: 'Silo Monitoring API',
  version: '1.0.0',
  environment: env.NODE_ENV,
  server: {
    host: env.HOST,
    port: env.PORT,
  },
  database: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
  },
};