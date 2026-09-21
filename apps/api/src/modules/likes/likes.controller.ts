import type { Request, Response } from 'express'

import * as likesService from './likes.service.js'

export const likesController = {
  like: async (request: Request, response: Response) => {
    const result = Array.isArray(request.params.profileId)
      ? (request.params.profileId[0] ?? "")
      : (request.params.profileId ?? "");

      // temporal this was not stored in a like result variable so i added this 
    const likeResult = await likesService.likeProfile(
      request.user!.id,
      result,
    ); 

    response.status(200).json({
      message: "Profile liked successfully.",
      status: "success",
      likerId: request.user!.id,
      likedUserId: result,
 matched:likeResult.matched
    });
  }, //..

  unlike: async (request: Request, response: Response) => {
    const result = Array.isArray(request.params.profileId)
      ? (request.params.profileId[0] ?? "")
      : (request.params.profileId ?? "");

    await likesService.unlikeProfile(request.user!.id, result);
    response.status(200).json({
      message: "Profile unliked successfully.",
      status: "success",
      likerId: request.user!.id,
      likedUserId: result,
    });
  },

  likedByMe: async (request: Request, response: Response) => {
    const result = await likesService.likedByMe(request.user!.id);

    response.status(200).json({
      items: result,
    });
  },

  whoLikedMe: async(request:Request, response:Response)=>{
    const result = await likesService.whoLikedMe(request.user!.id);
    response.status(200).json({
      items:result,
    })
  },
  matches: async (request: Request, response: Response) => {
  const result = await likesService.getMatches(request.user!.id);

  response.status(200).json({
    items: result,
  });
},
};
