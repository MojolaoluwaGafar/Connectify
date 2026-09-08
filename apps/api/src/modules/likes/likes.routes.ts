import { Router } from 'express'

import { likesController } from './likes.controller.js'

export const likesRouter = Router()

likesRouter.get('/liked-by-me', likesController.likedByMe)
likesRouter.put('/profiles/:profileId/like', likesController.like)
likesRouter.delete('/profiles/:profileId/like', likesController.unlike)
