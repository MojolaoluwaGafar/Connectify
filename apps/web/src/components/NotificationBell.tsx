import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, ThumbsUp } from 'lucide-react';
import { useNotifications } from '../context/notificationsContext/useNotifications';
import type { AppNotification } from '../context/notificationsContext/notificationsContext';

function typeIcon(type: AppNotification['type']) {
  switch (type) {
    case 'message':
      return <MessageCircle size={16} className="text-blue-600" />;
    case 'match':
      return <Heart size={16} className="text-violet-600" />;
    case 'like':
      return <ThumbsUp size={16} className="text-pink-600" />;
  }
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click — same pattern the profile/mobile menus already use.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleToggle() {
    // markAllRead has side effects (state + a network call) and updater
    // functions are expected to be pure — StrictMode double-invokes them in
    // dev, which would fire the request twice. Decide the next state first,
    // then act on it, instead of doing the side effect inside the updater.
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  }

  function handleSelect(notification: AppNotification) {
    setOpen(false);
    navigate(notification.navigateTo, {
      state: notification.navigateState,
    });
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              Notifications
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                Nothing yet — new matches, likes, and messages show up here.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleSelect(notification)}
                  className="flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {typeIcon(notification.type)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-gray-800">
                      {notification.text}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-400">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </span>

                  {!notification.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
