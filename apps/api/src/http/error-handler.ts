import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import { ApiErrorEnvelopeSchema } from '@connecti/shared'

import { env } from '../config/env.js'
import { AppError } from '../core/errors/app-error.js'

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  _next,
) => {
  const requestId = request.requestId

  if (error instanceof ZodError) {
    const payload = ApiErrorEnvelopeSchema.parse({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        requestId,
        details: error.flatten(),
      },
    })

    response.status(400).json(payload)
    return
  }

  if (error instanceof AppError) {
    const payload = ApiErrorEnvelopeSchema.parse({
      error: {
        code: error.code,
        message: error.message,
        requestId,
        details: error.details,
      },
    })

    response.status(error.statusCode).json(payload)
    return
  }

  console.error({ requestId, error })
  const payload = ApiErrorEnvelopeSchema.parse({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      requestId,
      ...(env.NODE_ENV === 'production' ? {} : { details: undefined }),
    },
  })

  response.status(500).json(payload)
}
