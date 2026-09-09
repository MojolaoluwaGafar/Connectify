import { Router } from 'express';

import { profilesController } from './profiles.controller.js';
import { authMiddleware } from '../../core/middleware/auth.js';

export const profilesRouter = Router();

profilesRouter.get('/', authMiddleware, profilesController.list);
profilesRouter.get('/:profileId', profilesController.getById);
profilesRouter.get('/me/profile', profilesController.getMe);
profilesRouter.post(
  '/createProfile',
  authMiddleware,
  profilesController.create,
);
