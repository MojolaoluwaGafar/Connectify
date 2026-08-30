// ============================================================================
// localStorage-backed persistence.
//
// TODO: BACKEND — this whole file goes away once MongoDB is real. It exists
// only so refreshing the page doesn't lose your fake signup / likes / chats.
// ============================================================================

const PREFIX = 'connectify_';

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}
