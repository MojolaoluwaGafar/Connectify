import { Router } from 'express'

import { profilesController } from './profiles.controller.js'

export const profilesRouter = Router()

profilesRouter.get('/', profilesController.list)
profilesRouter.get('/:profileId', profilesController.getById)
profilesRouter.get('/me/profile', profilesController.getMe)
