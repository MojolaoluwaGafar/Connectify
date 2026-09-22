import { Router } from 'express';

import { conversationsController } from './conversations.controller.js';
import { authMiddleware } from '../../core/middleware/auth.js';

export const conversationsRouter = Router();

conversationsRouter.use(authMiddleware);

conversationsRouter.get('/', conversationsController.list);

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

conversationsRouter.delete(
  '/:conversationId/messages/:messageId',
  conversationsController.deleteMessage,
);

conversationsRouter.delete(
  '/:conversationId',
  conversationsController.deleteConversation,
);