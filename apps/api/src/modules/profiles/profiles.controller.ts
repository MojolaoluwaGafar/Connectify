import type { Request, Response } from 'express';

import * as profilesService from './profiles.service.js';

export const profilesController = {
  create: async (request: Request, response: Response) => {
    // console.log(data)
    const data = request.body;
    if (!request.user) {
      return response.status(401).json({
        message: 'Authentication required',
      });
    }
    const userId = request.user.id;
    console.log(userId);

    try {
      const createdProfile = await profilesService.createProfile(userId, data);
      response.status(201).json({
        success: true,
        message: 'Profile Created',
        profile: createdProfile,
      });
    } catch (error) {
      console.error(error);
      response.status(500).json({
        success: false,
        message: error,
      });
    }
  },

  list: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({
        message: 'Authentication required',
      });
    }
    // await profilesService.listProfiles(request.query);
    // response.status(501).json({
    //   error: {
    //     code: 'NOT_IMPLEMENTED',
    //     message:
    //       'Profile discovery is scheduled for the next backend milestone.',
    //     requestId: request.requestId,
    //     details: {},
    //   },
    // });
    try {
      const result = await profilesService.listProfiles(
        request.query as Record<string, unknown>,
      );
      response
        .status(200)
        .json({ success: true, message: 'Profiles listed', data: result });
    } catch (error) {
      response.status(400).json({
        error: {
          code: 'INVALID_DISCOVERY_QUERY',
          message:
            error instanceof Error ? error.message : 'Invalid discovery query',
          requestId: request.requestId,
          details: {},
        },
      });
    }
  },

  getById: async (request: Request, response: Response) => {
    const profileId = Array.isArray(request.params.profileId)
      ? (request.params.profileId[0] ?? '')
      : (request.params.profileId ?? '');

    const profile = await profilesService.getProfileById(profileId);
    response.status(200).json({ profile });
  },

  getMe: async (request: Request, response: Response) => {
    const profile = await profilesService.getCurrentProfile(request.user?.id);
    response.status(200).json({ profile });
  },
};
