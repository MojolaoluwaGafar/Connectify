import type { Request, Response } from 'express'

import * as authService from './auth.service.js'

export const authController = {
  register: async (request: Request, response: Response) => {
    await authService.registerUser(request.body)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Authentication routes are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  verifyEmail: async (request: Request, response: Response) => {
    await authService.verifyUserEmail(request.body)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Email verification is scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  login: async (request: Request, response: Response) => {
    await authService.loginUser(request.body)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Login is scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  getMe: async (request: Request, response: Response) => {
    await authService.getCurrentUser(request.user)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Session hydration is scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },
}
