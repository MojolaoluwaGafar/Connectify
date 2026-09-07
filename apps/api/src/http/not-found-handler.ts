import type { RequestHandler } from 'express'

import { logger } from '../core/logger/logger.js'

export const notFoundHandler: RequestHandler = (request, response) => {
  logger.warn('Route not found', {
    method: request.method,
    url: request.originalUrl,
    requestId: request.requestId,
  })

  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `No route matches ${request.method} ${request.originalUrl}.`,
      requestId: request.requestId,
    },
  })
}
