import { Router } from 'express'

import { preferencesController } from './preferences.controller.js'

export const preferencesRouter = Router()

preferencesRouter.get('/me/preferences', preferencesController.get)
preferencesRouter.patch('/me/preferences', preferencesController.update)
