// Shared with SettingsPage, which owns the toggle UI for these — keeping the
// storage keys here too so nothing else has to duplicate the string literal.
export const NEW_MATCHES_STORAGE_KEY = "newMatches";
export const NEW_MESSAGES_STORAGE_KEY = "newMessages";

function readPreference(key: string): boolean {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : true;
  } catch {
    return true;
  }
}

export function isMatchNotificationsEnabled(): boolean {
  return readPreference(NEW_MATCHES_STORAGE_KEY);
}

export function isMessageNotificationsEnabled(): boolean {
  return readPreference(NEW_MESSAGES_STORAGE_KEY);
}
