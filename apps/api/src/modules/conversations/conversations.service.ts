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

// What `viewerId` sees for one conversation: newest message they haven't
// deleted, and how many of the other person's messages they haven't read.
async function getConversationSummary(
  conversationId: string,
  viewerId: string,
) {
  const viewer = toObjectId(viewerId);

  const [lastMessage, unreadCount] = await Promise.all([
    Message.findOne({ matchId: conversationId, deletedFor: { $ne: viewer } })
      .sort({ createdAt: -1 })
      .lean(),
    Message.countDocuments({
      matchId: conversationId,
      senderId: { $ne: viewer },
      readBy: { $ne: viewer },
      deletedFor: { $ne: viewer },
    }),
  ]);

  return {
    lastMessage: lastMessage ? formatMessage(lastMessage) : null,
    unreadCount,
  };
}

export async function listConversations(userId: string | undefined) {
  if (!userId || !mongoose.isValidObjectId(userId)) return [];

  const currentUserId = userId;

  const matchedProfiles = await getMatches(currentUserId);

  const conversations = await Promise.all(
    matchedProfiles.map(async (profile: any) => {
      const conversationId = getConversationId(currentUserId, profile.userId);
      const { lastMessage, unreadCount } = await getConversationSummary(
        conversationId,
        currentUserId,
      );

      return {
        matchId: conversationId,
        otherUser: profile,
        lastMessage,
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

  const messages = await Message.find({
    matchId: conversationId,
    deletedFor: { $ne: toObjectId(userId) },
  })
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

export type DeleteMessageScope = 'me' | 'everyone';

// scope 'me' hides any message in the conversation (sent or received) from
// the caller only. scope 'everyone' removes the message for both people and
// is limited to the caller's own messages — deleting someone else's would
// edit the other person's side of the conversation.
export async function deleteMessageService(
  conversationId: string,
  userId: string,
  messageId: string,
  scope: DeleteMessageScope = 'everyone',
) {
  const otherUserId = await assertParticipant(conversationId, userId);

  const message = mongoose.isValidObjectId(messageId)
    ? await Message.findOne({ _id: messageId, matchId: conversationId })
    : null;

  if (!message) {
    throw new AppError(404, 'MESSAGE_NOT_FOUND', 'Message not found');
  }

  if (scope === 'me') {
    const updated = await Message.findByIdAndUpdate(
      message._id,
      { $addToSet: { deletedFor: toObjectId(userId) } },
      { new: true },
    );

    // Once both people have hidden it nobody can see it, so drop it for good.
    if (updated && updated.deletedFor.length >= 2) {
      await updated.deleteOne();
    }

    const mine = await getConversationSummary(conversationId, userId);
    return { messageId, ...mine };
  }

  if (String(message.senderId) !== userId) {
    throw new AppError(
      403,
      'NOT_MESSAGE_OWNER',
      'You can only delete your own messages',
    );
  }

  await message.deleteOne();

  const [mine, theirs] = await Promise.all([
    getConversationSummary(conversationId, userId),
    getConversationSummary(conversationId, otherUserId),
  ]);

  // The other person's open chat and conversation list need to drop the
  // message too, with their own view of what the new last message is.
  await pushSocketEvent(otherUserId, 'message_deleted', {
    conversationId,
    messageId,
    lastMessage: theirs.lastMessage,
    unreadCount: theirs.unreadCount,
  });

  return { messageId, ...mine };
}

// "Delete conversation" clears the history for the caller only — the other
// participant keeps their copy. Messages both sides have deleted are gone
// for good, so they're purged rather than left orphaned.
export async function deleteConversationService(
  conversationId: string,
  userId: string,
) {
  const otherUserId = await assertParticipant(conversationId, userId);

  await Message.updateMany(
    { matchId: conversationId },
    { $addToSet: { deletedFor: toObjectId(userId) } },
  );

  await Message.deleteMany({
    matchId: conversationId,
    deletedFor: { $all: [toObjectId(userId), toObjectId(otherUserId)] },
  });
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
