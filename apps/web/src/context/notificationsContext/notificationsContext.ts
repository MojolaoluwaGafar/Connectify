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
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

export const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);
