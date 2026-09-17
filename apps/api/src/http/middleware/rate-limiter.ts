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

// Buckets are only ever read/written for IPs that are still making requests,
// so without this sweep every distinct IP that's ever hit the server stays
// in memory forever.
const SWEEP_INTERVAL_MS = 5 * 60_000
setInterval(() => {
  const now = Date.now()
  for (const [ip, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(ip)
    }
  }
}, SWEEP_INTERVAL_MS).unref()

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
