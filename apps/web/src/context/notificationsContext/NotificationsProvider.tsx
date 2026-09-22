import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../authContext/useAuth';
import { getActiveConversationId, socket } from '../../lib/socket';
import {
  getNotifications,
  markAllNotificationsRead,
  markConversationNotificationsReadApi,
  markTypeNotificationsReadApi,
  type ServerNotification,
} from '../../API/Services/Notifications/notifications';
import {
  NotificationsContext,
  type AppNotification,
  type NotificationType,
} from './notificationsContext';

const MAX_NOTIFICATIONS = 20;
// Real server-issued ids (Mongo ObjectId hex) vs this file's own ad-hoc
// locally-generated ones (e.g. `message-${conversationId}-${Date.now()}`).
const SERVER_ID_RE = /^[0-9a-f]{24}$/;

function truncate(text: string, max = 60) {
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

// Match AND message notifications carry enough to reopen the right
// conversation (MessagesPage only ever reads .id off selectedUser) — the
// server only sends back the other user's id, not a full profile. Without
// this, clicking a message notification just lands on /messages with
// whatever conversation (if any) happened to already be selected.
function toAppNotification(item: ServerNotification): AppNotification {
  return {
    id: item.id,
    type: item.type,
    text: item.text,
    createdAt: item.createdAt,
    read: item.read,
    profilePicture: item.profilePicture,
    navigateTo: item.navigateTo,
    conversationId: item.conversationId ?? undefined,
    navigateState:
      (item.type === 'match' || item.type === 'message') && item.relatedUserId
        ? {
            selectedUser: { id: item.relatedUserId, userId: item.relatedUserId },
          }
        : undefined,
  };
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

  // Loads whatever the bell missed while offline — without this, the bell
  // only ever knew about updates that happened to arrive while this tab had
  // a live socket connection. Also re-runs on every socket reconnect (not
  // just the first mount), since a brief network loss or a backgrounded
  // mobile tab mid-session is the same "missed it while disconnected" gap.
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let ignore = false;

    function loadNotifications() {
      getNotifications()
        .then((items) => {
          if (ignore) return;

          const serverItems = items.map(toAppNotification);

          setNotifications((prev) => {
            // A live socket push can land locally just before this GET's
            // snapshot was taken server-side, in which case the response
            // won't include it yet. Replacing outright would silently drop
            // it; instead keep any not-yet-server-confirmed entries this
            // fetch raced past (real notifications always outrank them once
            // they do show up, since they're matched and replaced by id).
            const serverIds = new Set(serverItems.map((n) => n.id));
            const unconfirmedLocal = prev.filter(
              (n) => !serverIds.has(n.id) && !SERVER_ID_RE.test(n.id),
            );

            return [...unconfirmedLocal, ...serverItems]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, MAX_NOTIFICATIONS);
          });
        })
        .catch((error) => {
          console.error('Failed to load notifications:', error);
        });
    }

    loadNotifications();
    socket.on('connect', loadNotifications);

    return () => {
      ignore = true;
      socket.off('connect', loadNotifications);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    function pushNotification(notification: AppNotification) {
      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    }

    const handleNewMessage = (payload: {
      conversationId: string;
      senderId: string;
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
        navigateState: payload.senderId
          ? {
              selectedUser: { id: payload.senderId, userId: payload.senderId },
            }
          : undefined,
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
    if (!user) return;

    const seenType = ROUTE_SEEN_TYPES[location.pathname];
    if (!seenType) return;

    setNotifications((prev) =>
      prev.map((n) => (n.type === seenType ? { ...n, read: true } : n)),
    );

    markTypeNotificationsReadApi(seenType).catch((error) => {
      console.error('Failed to mark notifications read:', error);
    });
  }, [location.pathname, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    markAllNotificationsRead().catch((error) => {
      console.error('Failed to mark notifications read:', error);
    });
  };

  const markConversationNotificationsRead = (conversationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.type === 'message' && n.conversationId === conversationId
          ? { ...n, read: true }
          : n,
      ),
    );

    markConversationNotificationsReadApi(conversationId).catch((error) => {
      console.error('Failed to mark notifications read:', error);
    });
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
