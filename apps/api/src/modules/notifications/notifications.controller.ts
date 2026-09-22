import type { Request, Response } from 'express';

import * as notificationsService from './notifications.service.js';

export const notificationsController = {
  list: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    const items = await notificationsService.listNotifications(
      request.user.id,
    );

    response.status(200).json({ data: items });
  },

  markAllRead: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    await notificationsService.markAllRead(request.user.id);

    response.status(200).json({ data: { success: true } });
  },

  markConversationRead: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    const conversationId = Array.isArray(request.params.conversationId)
      ? (request.params.conversationId[0] ?? '')
      : (request.params.conversationId ?? '');

    await notificationsService.markConversationNotificationsRead(
      request.user.id,
      conversationId,
    );

    response.status(200).json({ data: { success: true } });
  },

  markTypeRead: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    const type = request.params.type;

    if (type !== 'message' && type !== 'match' && type !== 'like') {
      return response.status(400).json({
        error: {
          code: 'INVALID_NOTIFICATION_TYPE',
          message: "type must be 'message', 'match', or 'like'",
          requestId: request.requestId,
          details: {},
        },
      });
    }

    await notificationsService.markTypeNotificationsRead(
      request.user.id,
      type,
    );

    response.status(200).json({ data: { success: true } });
  },
};
