import type { Request, Response } from 'express'

import * as conversationsService from './conversations.service.js'

export const conversationsController = {
  list: async (request: Request, response: Response) => {
    await conversationsService.listConversations(request.user?.id)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Conversations are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  listMessages: async (request: Request, response: Response) => {
    const conversationId = Array.isArray(request.params.conversationId)
      ? request.params.conversationId[0] ?? ''
      : request.params.conversationId ?? ''

    await conversationsService.listMessages(conversationId)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Message reads are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  sendMessage: async (request: Request, response: Response) => {
    const conversationId = Array.isArray(request.params.conversationId)
      ? request.params.conversationId[0] ?? ''
      : request.params.conversationId ?? ''

    await conversationsService.sendMessage(conversationId, request.body)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Message creation is scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },
}
