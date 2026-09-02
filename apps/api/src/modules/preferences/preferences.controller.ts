import type { Request, Response } from 'express'

import * as preferencesService from './preferences.service.js'

export const preferencesController = {
  get: async (request: Request, response: Response) => {
    await preferencesService.getPreferences(request.user?.id)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Notification preferences are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },

  update: async (request: Request, response: Response) => {
    await preferencesService.updatePreferences(request.user?.id, request.body)
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Preference updates are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    })
  },
}
