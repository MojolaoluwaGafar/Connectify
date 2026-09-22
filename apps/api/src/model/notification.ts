import mongoose, { Schema, Document } from 'mongoose';

export interface notification extends Document {
  userId: mongoose.Types.ObjectId; // recipient
  type: 'message' | 'match' | 'like';
  text: string;
  read: boolean;
  profilePicture: string | null;
  navigateTo: string;
  // Only set on 'message' notifications — lets a conversation being opened
  // mark just its own notifications read.
  conversationId: string | null;
  // The other user involved (sender/liker/matcher) — enough for the client
  // to rebuild navigateState without the server needing to know its shape.
  relatedUserId: string | null;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['message', 'match', 'like'],
    },
    text: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    navigateTo: {
      type: String,
      required: true,
    },
    conversationId: {
      type: String,
      default: null,
    },
    relatedUserId: {
      type: String,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<notification>(
  'Notification',
  NotificationSchema,
);
