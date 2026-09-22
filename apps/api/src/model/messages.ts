import mongoose, { Schema, Document } from 'mongoose';

export interface message extends Document {
  matchId: string; // deterministic "sortedUserIdA_sortedUserIdB" pair, not an ObjectId ref
  senderId: mongoose.Types.ObjectId;
  text: string;
  readBy: mongoose.Types.ObjectId[];
  deliveredAt: Date | null;
  // Users who deleted the conversation for themselves — the message stays
  // visible to everyone not listed here.
  deletedFor: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    deletedFor: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MessageSchema.index({ matchId: 1, createdAt: 1 });

export const Message = mongoose.model<message>('Message', MessageSchema);
