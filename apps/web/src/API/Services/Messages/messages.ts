import type { Conversation, Message } from '../../../types';
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
  return true;
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

export type DeleteMessageScope = 'me' | 'everyone';

// 'me' hides the message from this user only (works on received messages
// too); 'everyone' removes your own message for both people.
export async function deleteMessage(
  conversationId: string,
  messageId: string,
  scope: DeleteMessageScope,
): Promise<{ lastMessage: Message | null }> {
  const { data } = await api.delete(
    `/api/v1/conversations/${conversationId}/messages/${messageId}`,
    { params: { scope } },
  );

  return { lastMessage: data?.data?.lastMessage ?? null };
}

// Clears the chat history for the current user only.
export async function deleteConversation(conversationId: string) {
  await api.delete(`/api/v1/conversations/${conversationId}`);
}

export const MessagesService = {
  canMessage,
  getMessages,
  getConversations,
  markConversationRead,
  deleteMessage,
  deleteConversation,
};
