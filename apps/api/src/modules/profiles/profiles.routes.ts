import { Router } from 'express'

import { profilesController } from './profiles.controller.js'
import { authMiddleware } from '../../core/middleware/auth.js'

export const profilesRouter = Router()

profilesRouter.get('/', profilesController.list)
profilesRouter.get('/me/profile', authMiddleware, profilesController.getMe)
profilesRouter.get('/:profileId', profilesController.getById)
profilesRouter.post('/createProfile', authMiddleware, profilesController.create)
