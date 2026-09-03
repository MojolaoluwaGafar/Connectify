import type { JWTPayload } from './payload.js'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      user?: JWTPayload
    }
  }
}

export {}