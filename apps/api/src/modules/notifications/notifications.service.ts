import { Notification } from '../../model/notification.js';

const MAX_NOTIFICATIONS_PER_USER = 20;

export type NotificationType = 'message' | 'match' | 'like';

export interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  text: string;
  navigateTo: string;
  profilePicture?: string | null;
  conversationId?: string | null;
  relatedUserId?: string | null;
}

function formatNotification(item: Record<string, any>) {
  return {
    id: String(item._id),
    type: item.type,
    text: item.text,
    read: item.read,
    profilePicture: item.profilePicture ?? null,
    navigateTo: item.navigateTo,
    conversationId: item.conversationId ?? null,
    relatedUserId: item.relatedUserId ?? null,
    createdAt: item.createdAt.toISOString(),
  };
}

// Persists a notification and trims that user's history back down to the
// cap — mirrors the client's old in-memory MAX_NOTIFICATIONS limit, just
// durable now instead of reset on every reload.
export async function createNotification(input: CreateNotificationInput) {
  await Notification.create({
    userId: input.recipientId,
    type: input.type,
    text: input.text,
    navigateTo: input.navigateTo,
    profilePicture: input.profilePicture ?? null,
    conversationId: input.conversationId ?? null,
    relatedUserId: input.relatedUserId ?? null,
  });

  // _id as a tiebreaker: createdAt alone is millisecond-resolution, and two
  // notifications created in the same millisecond (a like immediately
  // followed by its resulting match, say) would otherwise sort
  // nondeterministically, risking trimming the newer one instead of the
  // older one.
  const excess = await Notification.find({ userId: input.recipientId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(MAX_NOTIFICATIONS_PER_USER)
    .select('_id');

  if (excess.length > 0) {
    await Notification.deleteMany({
      _id: { $in: excess.map((doc) => doc._id) },
    });
  }
}

export async function listNotifications(userId: string) {
  const items = await Notification.find({ userId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(MAX_NOTIFICATIONS_PER_USER)
    .lean();

  return items.map(formatNotification);
}

export async function markAllRead(userId: string) {
  await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } },
  );
}

export async function markConversationNotificationsRead(
  userId: string,
  conversationId: string,
) {
  await Notification.updateMany(
    { userId, type: 'message', conversationId, read: false },
    { $set: { read: true } },
  );
}

export async function markTypeNotificationsRead(
  userId: string,
  type: NotificationType,
) {
  await Notification.updateMany(
    { userId, type, read: false },
    { $set: { read: true } },
  );
}
