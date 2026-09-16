import type { Conversation } from '../../../types';
import api from '../../api';

function extractConversations(data: unknown): Conversation[] {
  if (Array.isArray(data)) return data as Conversation[];

  if (typeof data === 'object' && data !== null) {
    const payload = data as {
      items?: unknown;
      data?: unknown;
    };

    if (Array.isArray(payload.items)) {
      return payload.items as Conversation[];
    }

    if (Array.isArray(payload.data)) {
      return payload.data as Conversation[];
    }

    // Kept for safety in case some other endpoint nests as { data: { items } }
    const nested = payload.data as { items?: unknown } | undefined;
    if (Array.isArray(nested?.items)) {
      return nested!.items as Conversation[];
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
  
): Promise<Conversation[]> {
  try {
    const { data } = await api.get('/api/v1/conversations');
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
export async function getMessages(conversationId: string) {
  const { data } = await api.get(
    `/api/v1/conversations/${conversationId}/messages`,
  );

  return Array.isArray(data?.data) ? data.data : [];
}
export async function markConversationRead(conversationId: string) {
  await api.post(`/api/v1/conversations/${conversationId}/read`);
}

export const MessagesService = {
  canMessage,
  getMessages,
  getConversations,
  markConversationRead,

};
