import type { Request, Response } from 'express';

import * as profilesService from './profiles.service.js';

export const profilesController = {
  list: async (request: Request, response: Response) => {
    await profilesService.listProfiles(request.query);
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message:
          'Profile discovery is scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    });
  },

  getById: async (request: Request, response: Response) => {
    const profileId = Array.isArray(request.params.profileId)
      ? (request.params.profileId[0] ?? '')
      : (request.params.profileId ?? '');

    await profilesService.getProfileById(profileId);
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message:
          'Public profile reads are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    });
  },

  getMe: async (request: Request, response: Response) => {
    await profilesService.getCurrentProfile(request.user?.id);
    response.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message:
          'Editable profile reads are scheduled for the next backend milestone.',
        requestId: request.requestId,
        details: {},
      },
    });
  },
};
