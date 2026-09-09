import type { Request, Response } from 'express'

import * as likesService from './likes.service.js'

export const likesController = {
  like: async (request: Request, response: Response) => {
    const profileId = Array.isArray(request.params.profileId)
      ? request.params.profileId[0] ?? ''
      : request.params.profileId ?? ''

    await likesService.likeProfile(profileId, request.body)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Likes are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  unlike: async (request: Request, response: Response) => {
    const profileId = Array.isArray(request.params.profileId)
      ? request.params.profileId[0] ?? ''
      : request.params.profileId ?? ''

    await likesService.unlikeProfile(profileId)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Removing likes is scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  likedByMe: async (_request: Request, response: Response) => {
    response.status(200).json({ items: [] })
  },
}
