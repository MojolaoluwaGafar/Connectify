import { createContext } from 'react';

export type NotificationType = 'message' | 'match' | 'like';

export interface AppNotification {
  id: string;
  type: NotificationType;
  text: string;
  createdAt: string; // ISO
  read: boolean;
  profilePicture?: string | null;
  navigateTo: string;
  navigateState?: Record<string, unknown>;
  // Only set on 'message' notifications — lets a conversation being opened
  // clear the notification for it, even when that happens without ever
  // opening the bell (e.g. clicking straight into Messages).
  conversationId?: string;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  // Marks every 'message' notification for this conversation as read —
  // call this wherever a conversation is opened/read directly.
  markConversationNotificationsRead: (conversationId: string) => void;
}

export const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);
