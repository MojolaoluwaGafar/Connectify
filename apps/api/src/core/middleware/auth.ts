import { Request, Response, NextFunction } from "express"
import JWT from "jsonwebtoken"
import type { JWTPayload } from "../../types/payload.js";
import { env } from '../../config/env.js'


export interface AuthRequest extends Request {
    user? : JWTPayload
}

const jwt_secret_key : string | undefined = env.JWT_SECRET_KEY

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!jwt_secret_key) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = JWT.verify(token!, jwt_secret_key!) as unknown as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
