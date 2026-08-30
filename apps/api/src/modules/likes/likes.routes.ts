import { Router } from 'express'

export const likesRouter = Router()

likesRouter.put('/profiles/:profileId/like', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Likes are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

likesRouter.delete('/profiles/:profileId/like', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Removing likes is scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})
