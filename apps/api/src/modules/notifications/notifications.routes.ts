import { Router } from 'express';

import { notificationsController } from './notifications.controller.js';
import { authMiddleware } from '../../core/middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get('/', notificationsController.list);
notificationsRouter.post('/read-all', notificationsController.markAllRead);
notificationsRouter.post(
  '/read-conversation/:conversationId',
  notificationsController.markConversationRead,
);
notificationsRouter.post(
  '/read-type/:type',
  notificationsController.markTypeRead,
);
