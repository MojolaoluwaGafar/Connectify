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

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  MONGODB_URI: z
    .string()
    .trim()
    .min(1, 'Set MONGODB_URI to your MongoDB Atlas connection string.'),

  JWT_SECRET_KEY: z.string().default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
})

const parsedEnvironment = environmentSchema.parse(process.env)

export const env = {
  ...parsedEnvironment,
  corsOrigins: parsedEnvironment.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
