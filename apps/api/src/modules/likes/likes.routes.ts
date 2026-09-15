import { Router } from 'express'

import { likesController } from './likes.controller.js'
import { authMiddleware } from '../../core/middleware/auth.js'

export const likesRouter = Router()

likesRouter.get('/liked-by-me', authMiddleware, likesController.likedByMe)
likesRouter.get("/who-liked-me", authMiddleware, likesController.whoLikedMe);
likesRouter.get("/matches", authMiddleware, likesController.matches);

likesRouter.put('/profiles/:profileId/like', authMiddleware, likesController.like)
likesRouter.delete('/profiles/:profileId/like', authMiddleware, likesController.unlike)
