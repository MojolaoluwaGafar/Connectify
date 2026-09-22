import api from '../../api';
import type { NotificationType } from '../../../context/notificationsContext/notificationsContext';

// What the API actually returns — narrower than the client's AppNotification
// (no navigateState; that's a client-only concept built from relatedUserId).
export interface ServerNotification {
  id: string;
  type: NotificationType;
  text: string;
  read: boolean;
  profilePicture: string | null;
  navigateTo: string;
  conversationId: string | null;
  relatedUserId: string | null;
  createdAt: string;
}

export async function getNotifications(): Promise<ServerNotification[]> {
  const { data } = await api.get('/api/v1/notifications');
  return Array.isArray(data?.data) ? data.data : [];
}

export async function markAllNotificationsRead() {
  await api.post('/api/v1/notifications/read-all');
}

export async function markConversationNotificationsReadApi(
  conversationId: string,
) {
  await api.post(
    `/api/v1/notifications/read-conversation/${conversationId}`,
  );
}

export async function markTypeNotificationsReadApi(type: NotificationType) {
  await api.post(`/api/v1/notifications/read-type/${type}`);
}
