import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/connecti'),
  JWT_SECRET: z.string().default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

const parsedEnvironment = environmentSchema.parse(process.env)

export const env = {
  ...parsedEnvironment,
  corsOrigins: parsedEnvironment.CORS_ORIGIN.split(',').map((origin) =>
    origin.trim(),
  ),
}
