import { Router } from 'express'

import { authRouter } from '../modules/auth/auth.routes.js'
import { conversationsRouter } from '../modules/conversations/conversations.routes.js'
import { geocodeRouter } from '../modules/geocode/geocode.routes.js'
import { healthRouter } from '../modules/health/health.routes.js'
import { likesRouter } from '../modules/likes/likes.routes.js'
import { preferencesRouter } from '../modules/preferences/preferences.routes.js'
import { profilesRouter } from '../modules/profiles/profiles.routes.js'

export const v1Router = Router()

v1Router.use('/health', healthRouter)
v1Router.use('/auth', authRouter)
v1Router.use('/profiles', profilesRouter)
v1Router.use('/geocode', geocodeRouter)
v1Router.use('/likes', likesRouter)
v1Router.use('/conversations', conversationsRouter)
v1Router.use('/preferences', preferencesRouter)
