import { Router } from 'express';

import { conversationsController } from './conversations.controller.js';
import { authMiddleware } from '../../core/middleware/auth.js';

export const conversationsRouter = Router();

conversationsRouter.get('/', authMiddleware, conversationsController.list);
conversationsRouter.get(
  '/:conversationId/messages',
  conversationsController.listMessages,
);
conversationsRouter.post(
  '/:conversationId/messages',
  conversationsController.sendMessage,
);
conversationsRouter.post(
  '/:conversationId/read',
  conversationsController.markRead,
);
