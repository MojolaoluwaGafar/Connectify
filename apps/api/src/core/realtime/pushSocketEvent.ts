import { env } from '../../config/env.js';

export type InternalSocketEvent =
  | 'new_match'
  | 'new_like'
  | 'messages_read'
  | 'messages_delivered'
  | 'message_deleted';

// Best-effort push to the (separate) socket process so the recipient learns
// about the change immediately instead of waiting for their next fetch. The
// REST flow that triggers this must never fail because of it.
export async function pushSocketEvent(
  recipientId: string,
  event: InternalSocketEvent,
  payload: unknown,
) {
  try {
    await fetch(`${env.socketInternalUrl}/internal/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': env.INTERNAL_SOCKET_SECRET,
      },
      body: JSON.stringify({ recipientId, event, payload }),
    });
  } catch (error) {
    console.error(`Failed to push realtime ${event} notification:`, error);
  }
}
