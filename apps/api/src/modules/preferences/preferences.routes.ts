import { Router } from 'express'

export const preferencesRouter = Router()

preferencesRouter.get('/me/preferences', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Notification preferences are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

preferencesRouter.patch('/me/preferences', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Preference updates are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})
