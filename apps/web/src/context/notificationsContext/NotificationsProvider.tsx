import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../authContext/useAuth';
import { getActiveConversationId, socket } from '../../lib/socket';
import {
  NotificationsContext,
  type AppNotification,
  type NotificationType,
} from './notificationsContext';

const MAX_NOTIFICATIONS = 20;

function truncate(text: string, max = 60) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

// Routes whose mere visit means the user has seen that kind of update —
// clears the matching notifications without requiring a bell click.
const ROUTE_SEEN_TYPES: Record<string, NotificationType> = {
  '/matches': 'match',
  '/likes': 'like',
};

function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Fresh account/session — don't carry a previous user's notifications over.
  useEffect(() => {
    if (!user) setNotifications([]);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    function pushNotification(notification: AppNotification) {
      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    }

    const handleNewMessage = (payload: {
      conversationId: string;
      senderName: string;
      text: string;
    }) => {
      // The user is already reading this conversation, so a notification
      // for it is just noise (the toast in App.tsx skips it for the same
      // reason) — it would otherwise fill the bell with the live chat.
      if (payload.conversationId === getActiveConversationId()) return;

      // The toast/popup toggles in Settings only govern the toast and the
      // match popup — the bell itself always records every notification,
      // regardless of that preference.
      pushNotification({
        id: `message-${payload.conversationId}-${Date.now()}`,
        type: 'message',
        text: `${payload.senderName}: ${truncate(payload.text ?? '')}`,
        createdAt: new Date().toISOString(),
        read: false,
        navigateTo: '/messages',
        conversationId: payload.conversationId,
      });
    };

    const handleNewMatch = (data: {
      profile: { fullName: string; userId: string; profilePicture?: string | null };
    }) => {
      const profile = data.profile;

      pushNotification({
        id: `match-${profile.userId}-${Date.now()}`,
        type: 'match',
        text: `You matched with ${profile.fullName}!`,
        createdAt: new Date().toISOString(),
        read: false,
        profilePicture: profile.profilePicture,
        navigateTo: '/messages',
        navigateState: { selectedUser: profile },
      });
    };

    const handleNewLike = (data: {
      profile: { fullName: string; userId: string; profilePicture?: string | null };
    }) => {
      const profile = data.profile;

      pushNotification({
        id: `like-${profile.userId}-${Date.now()}`,
        type: 'like',
        text: `${profile.fullName} liked your profile`,
        createdAt: new Date().toISOString(),
        read: false,
        profilePicture: profile.profilePicture,
        navigateTo: '/likes',
      });
    };

    socket.on('new_message_notification', handleNewMessage);
    socket.on('new_match', handleNewMatch);
    socket.on('new_like', handleNewLike);

    return () => {
      socket.off('new_message_notification', handleNewMessage);
      socket.off('new_match', handleNewMatch);
      socket.off('new_like', handleNewLike);
    };
  }, [user]);

  // Visiting the page a notification type points to counts as having seen
  // it, even if the bell itself was never opened.
  useEffect(() => {
    const seenType = ROUTE_SEEN_TYPES[location.pathname];
    if (!seenType) return;

    setNotifications((prev) =>
      prev.map((n) => (n.type === seenType ? { ...n, read: true } : n)),
    );
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markConversationNotificationsRead = (conversationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.type === 'message' && n.conversationId === conversationId
          ? { ...n, read: true }
          : n,
      ),
    );
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        markConversationNotificationsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export default NotificationsProvider;
