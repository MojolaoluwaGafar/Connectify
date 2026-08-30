import { Router } from 'express'

export const authRouter = Router()

authRouter.post('/register', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Authentication routes are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

authRouter.post('/verify-email', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Email verification is scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

authRouter.post('/login', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Login is scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

authRouter.get('/me', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Session hydration is scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})
