import type { NextFunction, Request, Response } from 'express';

import * as profilesService from './profiles.service.js';
import { MAX_PHOTOS, profileInputSchema } from './profiles.validation.js';
import { uploadProfilePicture } from './profiles.service.js';

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export const profilesController = {
  create: async (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({
        message: 'Authentication required',
      });
    }
    const userId = request.user.id;
    try {
      // Already-hosted photos the client is keeping, in order — separate
      // from newly-picked files, which arrive as multipart uploads instead.
      const existingPhotos =
        typeof request.body.existingPhotos === 'string'
          ? ((parseJson(request.body.existingPhotos) as unknown[]) ?? [])
          : [];

      const uploadedFiles = Array.isArray(request.files)
        ? (request.files as Express.Multer.File[])
        : [];

      const uploadedUrls = await Promise.all(
        uploadedFiles.map((file) => uploadProfilePicture(file)),
      );

      const photos = [...existingPhotos, ...uploadedUrls].slice(
        0,
        MAX_PHOTOS,
      );

      const data = profileInputSchema.parse({
        ...request.body,
        age: Number(request.body.age),
        interests:
          typeof request.body.interests === 'string'
            ? JSON.parse(request.body.interests)
            : request.body.interests,
        // Multipart bodies only carry strings; a malformed value becomes
        // undefined so validation answers with a 400 rather than a crash.
        locationCoords:
          typeof request.body.locationCoords === 'string'
            ? parseJson(request.body.locationCoords)
            : request.body.locationCoords,
        photos,
      });

      const createdProfile = await profilesService.createProfile(
        userId,
        data,
      );
      response.status(201).json({
        success: true,
        message: 'Profile Created',
        profile: createdProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  list: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({
        message: 'Authentication required',
      });
    }
    try {
      const result = await profilesService.listProfiles(
        request.query as Record<string, unknown>,
        request.user.id,
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

    const data = await profilesService.getProfileById(
      profileId,
      request.user?.id,
    );
    response.status(200).json({ data });
  },

  getMe: async (request: Request, response: Response) => {
    const profile = await profilesService.getCurrentProfile(request.user?.id);
    response.status(200).json({ profile });
  },
};
