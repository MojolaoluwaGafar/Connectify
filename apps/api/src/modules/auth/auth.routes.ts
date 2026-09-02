import { Router } from 'express'

import { authController } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', authController.register)
authRouter.post('/verify-email', authController.verifyEmail)
authRouter.post('/login', authController.login)
authRouter.get('/me', authController.getMe)
