import type { Request, Response } from 'express';

import * as conversationsService from './conversations.service.js';
import { AppError } from '../../core/errors/app-error.js';

function paramId(request: Request, key: string) {
  const value = request.params[key];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function handleError(error: unknown, request: Request, response: Response) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        requestId: request.requestId,
        details: {},
      },
    });
  }

  console.error(error);
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      requestId: request.requestId,
      details: {},
    },
  });
}

export const conversationsController = {
  list: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    try {
      const result = await conversationsService.listConversations(
        request.user.id,
      );
      response.status(200).json({ data: result });
    } catch (error) {
      handleError(error, request, response);
    }
  },

  listMessages: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    try {
      const result = await conversationsService.listMessagesService(
        paramId(request, 'conversationId'),
        request.user.id,
      );
      response.status(200).json({ data: result });
    } catch (error) {
      handleError(error, request, response);
    }
  },

  sendMessage: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    try {
      const result = await conversationsService.sendMessageService(
        paramId(request, 'conversationId'),
        request.user.id,
        request.body,
      );
      response.status(201).json({ data: result });
    } catch (error) {
      handleError(error, request, response);
    }
  },

  markRead: async (request: Request, response: Response) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    try {
      await conversationsService.markRead(
        paramId(request, 'conversationId'),
        request.user.id,
      );
      response.status(200).json({ data: { success: true } });
    } catch (error) {
      handleError(error, request, response);
    }
  },
};
