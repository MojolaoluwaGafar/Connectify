import { Router } from 'express'

export const conversationsRouter = Router()

conversationsRouter.get('/', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Conversations are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

conversationsRouter.get('/:conversationId/messages', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Message reads are scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})

conversationsRouter.post('/:conversationId/messages', (_request, response) => {
  response.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Message creation is scheduled for the next backend milestone.',
      requestId: _request.requestId,
      details: {},
    },
  })
})
