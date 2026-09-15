import { Like } from "../../model/likes.js";
import { Profile } from "../../model/profile.js";
import mongoose from "mongoose";

export async function likeProfile(likerId: string, likedUserId: string) {
  // I (by I, i mean Chidera ) removed the payload validation for now if any error occurs later add in the payload thank you

  // temporal: testing for matches 
  const existingLike = await Like.findOne({likerId: likedUserId,
    likedUserId: likerId
  });
  const matched = !!existingLike
  console.log("EXISTING LIKES", existingLike);
  


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
    // temporally added to test matches 
    matched: matched,
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

export const whoLikedMe = async (userId: string) => {
  const likes = await Like.find({
    likedUserId: new mongoose.Types.ObjectId(userId),
  });
  console.log("WHO LIKED ME LIKES", likes);
  
  const likerIds = likes.map((like) => like.likerId);
  console.log("WHO LIKED ME LIKER IDS:", likerIds);
  

  const profiles = await Profile.find({ userId: { $in: likerIds } });
   console.log("WHO LIKED ME PROFILES:", profiles);

  return profiles.map((profile) => ({
    ...profile.toObject(),
    id: profile.userId.toString(),
    userId: profile.userId.toString(),
  }));
};

export const getMatches = async (userId: string)=>{
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find everyone I liked
  const myLikes = await Like.find({
    likerId: userObjectId,
  });

  const likedUserIds = myLikes.map((like) => like.likedUserId);

  // Find the people who also liked me
  const mutualLikes = await Like.find({
    likerId: { $in: likedUserIds },
    likedUserId: userObjectId,
  });

  const matchedUserIds = mutualLikes.map((like) => like.likerId);

  // Get their profiles
  const profiles = await Profile.find({
    userId: { $in: matchedUserIds },
  });

  return profiles.map((profile) => ({
    ...profile.toObject(),
    id: profile.userId.toString(),
    userId: profile.userId.toString(),
  })); 
}