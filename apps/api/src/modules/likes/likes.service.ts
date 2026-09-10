import { Like } from "../../model/likes.js";
import { Profile } from "../../model/profile.js";
import mongoose from "mongoose";

export async function likeProfile(likerId: string, likedUserId: string) {
  // I (by I, i mean Chidera ) removed the payload validation for now if any error occurs later add in the payload thank you

  const like = new Like({
    likerId: likerId,
    likedUserId: likedUserId,
  });
  await like.save();

  return {
    message: "Profile liked successfully.",
    status: "success",
    likerId: likerId,
    likedUserId: likedUserId,
  };
}

export async function unlikeProfile(likerId: string, likedUserId: string) {
  await Like.deleteOne({ likerId: likerId, likedUserId: likedUserId });
  return {
    message: "Profile unliked successfully.",
    status: "success",
    likerId: likerId,
    likedUserId: likedUserId,
  };
}

export async function likedByMe(likerId: string) {
  const likes = await Like.find({
    likerId: new mongoose.Types.ObjectId(likerId),
  });

  console.log("LIKES FOUND:", likes);
  console.log("LIKER ID:", likerId);

  const likedUserIds = likes.map((like) => like.likedUserId);

  console.log("LIKED USER IDS:", likedUserIds);

  const profiles = await Profile.find({
    userId: { $in: likedUserIds },
  });

  return profiles.map((profile) => ({
    ...profile.toObject(),
    id: profile.userId.toString(),
    userId: profile.userId.toString(),
  }));
}