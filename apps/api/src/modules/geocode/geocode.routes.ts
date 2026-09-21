import { Router } from 'express';

import { authMiddleware } from '../../core/middleware/auth.js';
import { rateLimiter } from '../../http/middleware/rate-limiter.js';
import { geocodeController } from './geocode.controller.js';

export const geocodeRouter = Router();

// Each keystroke (after the client's debounce) is an upstream geocoder call on
// a cache miss, so this is stricter than the app-wide limit.
geocodeRouter.get(
  '/autocomplete',
  authMiddleware,
  rateLimiter({ scope: 'geocode', windowMs: 60_000, maxRequests: 40 }),
  geocodeController.autocomplete,
);
