const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Whole calendar days between two dates in the viewer's local timezone —
// comparing local midnights (not raw 24h spans) so a message sent at 11pm
// last night still counts as "yesterday" at 1am.
function daysAgo(date: Date, now: Date) {
  return Math.round(
    (startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) /
      DAY_MS,
  );
}

// Stable key for grouping messages by local calendar day.
export function getDayKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// "10:42 AM" — used on message bubbles.
export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Divider label between days in a chat: Today / Yesterday / weekday for the
// past week / full date beyond that.
export function formatDayLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  const diff = daysAgo(date, now);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';

  if (diff > 1 && diff < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

// Compact timestamp for a conversation list row: time if today, otherwise
// Yesterday / weekday / short date.
export function formatConversationTime(iso: string, now = new Date()) {
  const date = new Date(iso);
  const diff = daysAgo(date, now);

  if (diff === 0) return formatMessageTime(iso);
  if (diff === 1) return 'Yesterday';

  if (diff > 1 && diff < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : '2-digit',
  });
}
