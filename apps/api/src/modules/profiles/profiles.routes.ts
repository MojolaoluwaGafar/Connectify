import { Router } from 'express'

export const profilesRouter = Router()

profilesRouter.get('/', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Profile discovery is scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

profilesRouter.get('/:profileId', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Public profile reads are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

profilesRouter.get('/me/profile', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Editable profile reads are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})
