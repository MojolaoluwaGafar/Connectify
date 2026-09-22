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

// Rebuilds the gallery in its real order from the client's photoOrder
// markers ("existing:<i>" / "new:<j>") — concatenating existingPhotos then
// uploadedUrls would silently put the wrong photo first (and therefore make
// it the profile picture) whenever an existing photo and a new upload are
// interleaved in the gallery. Falls back to the old concatenation if an
// older client doesn't send photoOrder.
function orderPhotos(
  existingPhotos: string[],
  uploadedUrls: string[],
  photoOrder: unknown,
): string[] {
  if (!Array.isArray(photoOrder) || photoOrder.length === 0) {
    return [...existingPhotos, ...uploadedUrls];
  }

  const ordered: string[] = [];

  for (const token of photoOrder) {
    if (typeof token !== 'string') continue;

    const [kind, indexPart] = token.split(':');
    const index = Number(indexPart);

    if (kind === 'existing' && existingPhotos[index] !== undefined) {
      ordered.push(existingPhotos[index]);
    } else if (kind === 'new' && uploadedUrls[index] !== undefined) {
      ordered.push(uploadedUrls[index]);
    }
  }

  return ordered;
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

      const photoOrder =
        typeof request.body.photoOrder === 'string'
          ? parseJson(request.body.photoOrder)
          : undefined;

      const photos = orderPhotos(
        existingPhotos as string[],
        uploadedUrls,
        photoOrder,
      ).slice(0, MAX_PHOTOS);

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
