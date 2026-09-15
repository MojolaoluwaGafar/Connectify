import mongoose, {Schema , Document} from 'mongoose'

export interface LikeInt extends Document{
   likerId: mongoose.Types.ObjectId;
   likedUserId: mongoose.Types.ObjectId;
}

export const LikeSchema:Schema = new Schema({
likerId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
},
likedUserId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}
})

LikeSchema.index(
    {likerId: 1, likedUserId: 1},
    {unique:true}
)

export const Like = mongoose.model<LikeInt>("Like", LikeSchema)