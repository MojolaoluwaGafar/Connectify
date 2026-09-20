import mongoose from 'mongoose';

import { getMatches } from '../likes/likes.service.js';
import { AppError } from '../../core/errors/app-error.js';
import { pushSocketEvent } from '../../core/realtime/pushSocketEvent.js';
import { Like } from '../../model/likes.js';
import { Message } from '../../model/messages.js';

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

// Order-independent conversation identity for a pair of users — no
// persisted Match document exists, so this is derived rather than
// looked up. Sorting means either participant computes the same id.
export function getConversationId(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join('_');
}

export function parseConversationId(conversationId: string) {
  const parts = conversationId.split('_');
  if (parts.length !== 2) return null;

  const [a, b] = parts;
  if (
    !a ||
    !b ||
    !mongoose.isValidObjectId(a) ||
    !mongoose.isValidObjectId(b)
  ) {
    return null;
  }

  return [a, b] as const;
}

// A conversation only ever has two participants, so the recipient of any
// given message is simply "whichever half of matchId isn't the sender".
function formatMessage(item: Record<string, any>) {
  const senderId = String(item.senderId);
  const parsed = parseConversationId(item.matchId);
  const recipientId = parsed?.find((id) => id !== senderId);

  const readBy: string[] = (item.readBy ?? []).map((id: any) => String(id));
  const isRead = Boolean(recipientId && readBy.includes(recipientId));
  const isDelivered = isRead || Boolean(item.deliveredAt);

  const status: 'sent' | 'delivered' | 'read' = isRead
    ? 'read'
    : isDelivered
      ? 'delivered'
      : 'sent';

  return {
    id: String(item._id),
    matchId: item.matchId,
    senderId,
    text: item.text,
    sentAt: item.createdAt.toISOString(),
    status,
  };
}

async function areMutuallyLiked(userIdA: string, userIdB: string) {
  const [likedByA, likedByB] = await Promise.all([
    Like.exists({
      likerId: toObjectId(userIdA),
      likedUserId: toObjectId(userIdB),
    }),
    Like.exists({
      likerId: toObjectId(userIdB),
      likedUserId: toObjectId(userIdA),
    }),
  ]);

  return Boolean(likedByA && likedByB);
}

// Authorizes that `userId` belongs to this conversation AND that the
// two users are still a mutual match — someone unliking after the fact
// should lose message access, same as canMessage() presumably enforces.
export async function assertParticipant(
  conversationId: string,
  userId: string,
) {
  const parsed = parseConversationId(conversationId);

  if (!parsed) {
    throw new AppError(
      404,
      'CONVERSATION_NOT_FOUND',
      'Conversation not found',
    );
  }

  const [a, b] = parsed;

  if (userId !== a && userId !== b) {
    throw new AppError(
      403,
      'NOT_A_PARTICIPANT',
      'You are not part of this conversation',
    );
  }

  const otherUserId = userId === a ? b : a;

  const matched = await areMutuallyLiked(userId, otherUserId);

  if (!matched) {
    throw new AppError(
      403,
      'NOT_MATCHED',
      'You can only message people you have matched with',
    );
  }

  return otherUserId;
}

export async function listConversations(userId: string | undefined) {
  if (!userId || !mongoose.isValidObjectId(userId)) return [];

  const currentUserId = userId;

  const matchedProfiles = await getMatches(currentUserId);

  const conversations = await Promise.all(
    matchedProfiles.map(async (profile: any) => {
      const conversationId = getConversationId(currentUserId, profile.userId);

      const [lastMessage, unreadCount] = await Promise.all([
        Message.findOne({ matchId: conversationId })
          .sort({ createdAt: -1 })
          .lean(),
        Message.countDocuments({
          matchId: conversationId,
          senderId: { $ne: toObjectId(currentUserId) },
          readBy: { $ne: toObjectId(currentUserId) },
        }),
      ]);

      return {
        matchId: conversationId,
        otherUser: profile,
        lastMessage: lastMessage ? formatMessage(lastMessage) : null,
        unreadCount,
      };
    }),
  );

  return conversations.sort((a, b) => {
    const aTime = a.lastMessage?.sentAt ?? '';
    const bTime = b.lastMessage?.sentAt ?? '';
    return bTime.localeCompare(aTime);
  });
}

export async function listMessagesService(
  conversationId: string,
  userId: string,
) {
  await assertParticipant(conversationId, userId);

  const messages = await Message.find({ matchId: conversationId })
    .sort({ createdAt: 1 })
    .lean();

  return messages.map(formatMessage);
}

export async function sendMessageService(
  conversationId: string,
  senderId: string,
  payload: { content?: string; text?: string },
) {
  await assertParticipant(conversationId, senderId);

  const text = (payload.text ?? payload.content ?? '').trim();

  if (!text) {
    throw new AppError(400, 'EMPTY_MESSAGE', 'Message text is required');
  }

  const message = await Message.create({
    matchId: conversationId,
    senderId: toObjectId(senderId),
    text,
  });

  return formatMessage(message.toObject());
}

export async function markRead(conversationId: string, userId: string) {
  const otherUserId = await assertParticipant(conversationId, userId);

  const { modifiedCount } = await Message.updateMany(
    {
      matchId: conversationId,
      senderId: { $ne: toObjectId(userId) },
      readBy: { $ne: toObjectId(userId) },
    },
    { $addToSet: { readBy: toObjectId(userId) } },
  );

  // markRead runs on the REST API process, which has no direct handle on
  // the socket server, so the sender's tick update has to cross over via
  // the internal notify bridge instead of a plain io.emit.
  if (modifiedCount > 0) {
    await pushSocketEvent(otherUserId, 'messages_read', {
      conversationId,
      readerId: userId,
    });
  }
}

// Marks a single just-sent message delivered — called right after creation,
// when the socket layer already knows the recipient is online.
export async function markMessageDelivered(messageId: string) {
  const updated = await Message.findOneAndUpdate(
    { _id: messageId, deliveredAt: null },
    { $set: { deliveredAt: new Date() } },
    { new: true },
  ).lean();

  return updated ? formatMessage(updated) : null;
}

// Catches up any messages that were sent while `userId` was offline, run
// when they reconnect. Returns one entry per conversation that had pending
// messages so the caller can notify each sender exactly once.
export async function markDeliveredForUser(userId: string) {
  const pending = await Message.find({
    senderId: { $ne: toObjectId(userId) },
    deliveredAt: null,
  }).lean();

  const toMark = pending.filter((message) =>
    parseConversationId(message.matchId)?.includes(userId),
  );

  if (toMark.length === 0) return [];

  await Message.updateMany(
    { _id: { $in: toMark.map((message) => message._id) } },
    { $set: { deliveredAt: new Date() } },
  );

  const byConversation = new Map<string, string>();
  for (const message of toMark) {
    if (!byConversation.has(message.matchId)) {
      byConversation.set(message.matchId, String(message.senderId));
    }
  }

  return Array.from(byConversation, ([conversationId, senderId]) => ({
    conversationId,
    senderId,
  }));
}
