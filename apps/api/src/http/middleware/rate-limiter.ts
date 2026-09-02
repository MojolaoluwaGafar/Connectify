import type { RequestHandler } from 'express'
import { ApiErrorEnvelopeSchema } from '@connecti/shared'

interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
  message?: string
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function rateLimiter(options: RateLimitOptions = {}): RequestHandler {
  const windowMs = options.windowMs ?? 60_000
  const maxRequests = options.maxRequests ?? 120
  const message = options.message ?? 'Too many requests. Please try again later.'

  return (request, response, next) => {
    const forwardedFor = request.headers['x-forwarded-for']
    const ipValue =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]?.trim() ?? request.ip ?? 'unknown'
        : request.ip ?? 'unknown'

    const now = Date.now()
    const existing = buckets.get(ipValue)

    if (!existing || existing.resetAt <= now) {
      buckets.set(ipValue, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    if (existing.count >= maxRequests) {
      const payload = ApiErrorEnvelopeSchema.parse({
        error: {
          code: 'RATE_LIMITED',
          message,
          requestId: request.requestId,
          details: {
            retryAfterMs: Math.max(existing.resetAt - now, 0),
          },
        },
      })

      response.status(429).json(payload)
      return
    }

    existing.count += 1
    next()
  }
}
