import type { Request, Response, NextFunction } from "express"
import JWT from "jsonwebtoken"
import type { JWTPayload } from "../../types/payload.js"
import { env } from "../../config/env.js"

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided",
    })
  }

  const token = authHeader.substring(7).trim()

  if (!env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables")
  }

  try {
    const decoded = JWT.verify(
      token,
      env.JWT_SECRET_KEY,
    ) as JWTPayload

    req.user = decoded

    next()
  } catch {
    return res.status(403).json({
      message: "Invalid or expired token",
    })
  }
}