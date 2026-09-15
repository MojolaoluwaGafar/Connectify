import type { Conversation } from '../../../types';
import api from '../../api';

function extractConversations(data: unknown): Conversation[] {
  if (Array.isArray(data)) return data as Conversation[];

  if (typeof data === 'object' && data !== null) {
    const payload = data as {
      items?: unknown;
      data?: { items?: unknown };
    };

    if (Array.isArray(payload.items)) {
      return payload.items as Conversation[];
    }

    if (Array.isArray(payload.data?.items)) {
      return payload.data.items as Conversation[];
    }
  }

  return [];
}

export async function canMessage(
  _userId: string,
  _targetId: string,
): Promise<boolean> {
  // The API does not currently expose a can-message endpoint.
  return false;
}

export async function getConversations(
  userId: string,
): Promise<Conversation[]> {
  try {
    const { data } = await api.get('/api/v1/conversations', {
      params: { userId },
    });
    return extractConversations(data);
  } catch (error: unknown) {
    const status =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 501) {
      return [];
    }

    throw error;
  }
}

export const MessagesService = {
  canMessage,
  getConversations,
};
