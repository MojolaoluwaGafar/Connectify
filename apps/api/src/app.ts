import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { env } from './config/env.js'
import { errorHandler } from './http/error-handler.js'
import { rateLimiter } from './http/middleware/rate-limiter.js'
import { requestLogger } from './http/middleware/request-logger.js'
import { notFoundHandler } from './http/not-found-handler.js'
import { requestContext } from './http/request-context.js'
import { v1Router } from './routes/v1.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(requestContext)
  app.use(rateLimiter({ windowMs: 60_000, maxRequests: 120 }))
  app.use(requestLogger)

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' })
  })

  app.use('/api/v1', v1Router)
  app.use('/v1', v1Router)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
