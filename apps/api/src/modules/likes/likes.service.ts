import { Like } from '../../model/likes.js';
import { Profile } from '../../model/profile.js';
import mongoose from 'mongoose';
import { pushSocketEvent } from '../../core/realtime/pushSocketEvent.js';
import { AppError } from '../../core/errors/app-error.js';
import { isProfileComplete } from '../profiles/profiles.service.js';
import { createNotification } from '../notifications/notifications.service.js';

function formatProfile(profile: any) {
  return {
    ...profile,
    id: profile.userId.toString(),
    userId: profile.userId.toString(),
  };
}

async function notifyMatch(recipientId: string, likerId: string) {
  const likerProfile = await Profile.findOne({ userId: likerId }).lean();
  if (!likerProfile) return;

  await pushSocketEvent(recipientId, 'new_match', {
    profile: formatProfile(likerProfile),
  });

  // Persisted so the bell still shows this after the recipient was offline
  // for it — the socket push above only reaches them if they're online now.
  await createNotification({
    recipientId,
    type: 'match',
    text: `You matched with ${likerProfile.fullName}!`,
    navigateTo: '/messages',
    profilePicture: likerProfile.profilePicture,
    relatedUserId: likerId,
  });
}

async function notifyLike(recipientId: string, likerId: string) {
  const likerProfile = await Profile.findOne({ userId: likerId }).lean();
  if (!likerProfile) return;

  await pushSocketEvent(recipientId, 'new_like', {
    profile: formatProfile(likerProfile),
  });

  await createNotification({
    recipientId,
    type: 'like',
    text: `${likerProfile.fullName} liked your profile`,
    navigateTo: '/likes',
    profilePicture: likerProfile.profilePicture,
    relatedUserId: likerId,
  });
}

export async function likeProfile(likerId: string, likedUserId: string) {
  // I (by I, i mean Chidera ) removed the payload validation for now if any error occurs later add in the payload thank you

  if (likerId === likedUserId) {
    throw new AppError(
      400,
      'CANNOT_LIKE_SELF',
      'You cannot like your own profile.',
    );
  }

  // Liking is what puts someone in front of other people, so it requires a
  // finished profile of your own. Browsing stays open to everyone.
  const likerProfile = await Profile.findOne({ userId: likerId }).lean();

  if (!likerProfile || !isProfileComplete(likerProfile)) {
    throw new AppError(
      403,
      'PROFILE_INCOMPLETE',
      'Complete your profile before liking other people.',
    );
  }

  // temporal: testing for matches
  const existingLike = await Like.findOne({
    likerId: likedUserId,
    likedUserId: likerId,
  });
  const matched = !!existingLike;
  // console.log('EXISTING LIKES', existingLike);

  try {
    const like = new Like({ likerId, likedUserId });
    await like.save();
  } catch (error: any) {
    // Duplicate key = this exact like already exists — treat as a no-op
    // success rather than an error. This can legitimately happen from a
    // double-click, a retried request, or (as here) frontend/DB state
    // having drifted apart after an earlier failed unlike.
    if (error?.code !== 11000) {
      throw error;
    }
  }

  // Fire-and-forget, but caught: an uncaught rejection here would hit the
  // process-wide `unhandledRejection` handler and take the whole API down
  // for every user, not just fail this one like.
  if (matched) {
    // likedUserId liked us first and is waiting — they get the realtime
    // push. likerId (us) already learns about the match from this
    // request's own response, so no need to notify ourselves too.
    notifyMatch(likedUserId, likerId).catch((error) => {
      console.error('Failed to notify match:', error);
    });
  } else {
    // Not mutual (yet) — still let the recipient know someone liked them,
    // for the notification bell. Doesn't imply a match.
    notifyLike(likedUserId, likerId).catch((error) => {
      console.error('Failed to notify like:', error);
    });
  }

  return {
    message: 'Profile liked successfully.',
    status: 'success',
    likerId,
    likedUserId,
    matched,
  };
}

export async function unlikeProfile(likerId: string, likedUserId: string) {
  await Like.deleteOne({ likerId: likerId, likedUserId: likedUserId });
  return {
    message: 'Profile unliked successfully.',
    status: 'success',
    likerId: likerId,
    likedUserId: likedUserId,
  };
}

export async function likedByMe(likerId: string) {
  // Excludes any stray self-like from before this was blocked at creation
  // — defense in depth, not just a rely-on-the-guard-above assumption.
  const likes = await Like.find({
    likerId: new mongoose.Types.ObjectId(likerId),
    likedUserId: { $ne: new mongoose.Types.ObjectId(likerId) },
  });

  // console.log('LIKES FOUND:', likes);
  // console.log('LIKER ID:', likerId);

  const likedUserIds = likes.map((like) => like.likedUserId);

  // console.log('LIKED USER IDS:', likedUserIds);

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
    likerId: { $ne: new mongoose.Types.ObjectId(userId) },
  });
  // console.log('WHO LIKED ME LIKES', likes);

  const likerIds = likes.map((like) => like.likerId);
  // console.log('WHO LIKED ME LIKER IDS:', likerIds);

  const profiles = await Profile.find({ userId: { $in: likerIds } });
  // console.log('WHO LIKED ME PROFILES:', profiles);

  return profiles.map((profile) => ({
    ...profile.toObject(),
    id: profile.userId.toString(),
    userId: profile.userId.toString(),
  }));
};

export const getMatches = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find everyone I liked
  const myLikes = await Like.find({
    likerId: userObjectId,
  });

  const likedUserIds = myLikes.map((like) => like.likedUserId);

  // Find the people who also liked me
  const mutualLikes = await Like.find({
    likerId: { $in: likedUserIds, $ne: userObjectId },
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
};
