import type { Request, Response } from 'express';
import { z } from 'zod';

import { searchPlaces } from './geocode.service.js';

const autocompleteQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
});

export const geocodeController = {
  autocomplete: async (request: Request, response: Response) => {
    const { q } = autocompleteQuerySchema.parse(request.query);
    const { suggestions, provider } = await searchPlaces(q);

    response.status(200).json({ data: suggestions, provider });
  },
};
