import JWT from 'jsonwebtoken'

import { env } from '../../config/env.js'
import type { JWTPayload } from '../../types/payload.js'

export const verifyAuthToken = (token: string): JWTPayload | null => {
  try {
    const decoded = JWT.verify(token, env.JWT_SECRET_KEY)

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.id !== 'string' ||
      typeof decoded.role !== 'string'
    ) {
      return null
    }

    return {
      id: decoded.id,
      role: decoded.role,
    }
  } catch {
    return null
  }
}