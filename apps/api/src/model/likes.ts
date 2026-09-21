import mongoose, {Schema , Document} from 'mongoose'

export interface LikeInt extends Document{
   likerId: mongoose.Types.ObjectId;
   likedUserId: mongoose.Types.ObjectId;
}

export const LikeSchema: Schema = new Schema(
  {
    likerId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likedUserId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

LikeSchema.index(
    {likerId: 1, likedUserId: 1},
    {unique:true}
)

// Compound index above can't serve a lookup filtered on likedUserId alone
// (e.g. "who liked me") — that needs its own index.
LikeSchema.index({ likedUserId: 1 })

export const Like = mongoose.model<LikeInt>("Like", LikeSchema)