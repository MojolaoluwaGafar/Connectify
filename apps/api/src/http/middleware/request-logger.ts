import type { RequestHandler } from 'express'

import { logger } from '../../core/logger/logger.js'

export const requestLogger: RequestHandler = (request, response, next) => {
  const start = Date.now()

  response.on('finish', () => {
    logger.info(`${request.method} ${request.originalUrl} ${response.statusCode}`, {
      durationMs: Date.now() - start,
      requestId: request.requestId,
    })
  })

  next()
}
