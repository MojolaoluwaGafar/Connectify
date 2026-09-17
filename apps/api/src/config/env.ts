import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
})

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  SOCKET_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  // Shared secret so the REST API process can push realtime events (e.g. a
  // new match) through the separate socket process's internal HTTP endpoint.
  INTERNAL_SOCKET_SECRET: z.string().default('dev-internal-socket-secret'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  MONGODB_URI: z
    .string()
    .trim()
    .min(1, 'Set MONGODB_URI to your MongoDB Atlas connection string.'),

  JWT_SECRET_KEY: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  BREVO_API_KEY: z.string().trim().optional().default(''),
  EMAIL_FROM: z.string().trim().optional().default(''),
  APP_EMAIL: z.string().trim().optional().default(''),
  APP_PASSWORD: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().trim().optional().default(''),
  SMTP_HOST: z.string().trim().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
})

const parsedEnvironment = environmentSchema.parse(process.env)

export const env = {
  ...parsedEnvironment,
  corsOrigins: parsedEnvironment.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  socketInternalUrl: `http://localhost:${parsedEnvironment.SOCKET_PORT}`,
}
