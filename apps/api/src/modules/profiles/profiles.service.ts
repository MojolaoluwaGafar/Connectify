import mongoose from 'mongoose';
import { profile, Profile } from '../../model/profile.js';


export async function createProfile(userId: string, data: profile, ) {
  console.log(data);
 const iscomplete = isComplete(data)
  const {
    fullName,
    gender,
    interests,
    occupation,
    about,
    age,
    location,
    profilePicture,
    locationCoords,
  } = data;

  const newProfile = await Profile.findOneAndUpdate(
    { userId },
    {
      userId,
      fullName,
      gender,
      interests,
      occupation,
      about,
      age,
      location,
      profilePicture,
      locationCoords,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return formatProfile(newProfile.toObject());
}

export const isComplete = (profileData: profile) => {
  const hasRequiredFields =
    profileData.fullName.trim() !== '' &&
    profileData.age >= 18 &&
    profileData.location.trim() !== '' &&
    profileData.gender.trim() !== '' &&
    profileData.interests.length > 0 &&
    profileData.about.trim() !== '';

  return hasRequiredFields;
};

export async function listProfiles(
  query: Record<string, unknown>,
  currentUserId?: string,
) {
  const page = Math.max(Number(query.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 8, 1), 50);
  const skip = (page - 1) * pageSize;

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const tab =
    query.tab === 'near-me' || query.tab === 'new' ? query.tab : 'all';

  const excludeUserId =
    typeof query.excludeUserId === 'string' ? query.excludeUserId : '';

  const baseFilter: Record<string, unknown> = {};

  if (excludeUserId && mongoose.isValidObjectId(excludeUserId)) {
    baseFilter.userId = {
      $ne: new mongoose.Types.ObjectId(excludeUserId),
    };
  }

  if (search) {
    baseFilter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { interests: { $regex: search, $options: 'i' } },
    ];
  }

  if (tab === 'near-me') {
    if (!currentUserId || !mongoose.isValidObjectId(currentUserId)) {
      throw new Error(
        'A valid signed-in user is required for nearby discovery',
      );
    }

    const currentUserProfile = await Profile.findOne({
      userId: new mongoose.Types.ObjectId(currentUserId),
    })
      .select('location')
      .lean();

    if (!currentUserProfile?.location) {
      throw new Error(
        'Set your location in your profile to see nearby matches',
      );
    }

    baseFilter.location = currentUserProfile.location;
  }

  const profileQuery = Profile.find(baseFilter)
    .sort(tab === 'new' ? { createdAt: -1 } : { _id: -1 })
    .skip(skip)
    .limit(pageSize);

  const [items, total] = await Promise.all([
    profileQuery.lean(),
    Profile.countDocuments(baseFilter),
  ]);

  return formatDiscoveryResult(items, total, page, pageSize);
}

function formatDiscoveryResult(
  items: Array<Record<string, any>>,
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    message: 'Profile discovery successful.',
    status: 'success',
    items: items.map((item) => ({
      ...item,
      id: String(item.userId),
      userId: String(item.userId),
      interest: item.interests ?? [],
      joinedDaysAgo: item.createdAt
        ? Math.floor(
            (Date.now() - new Date(item.createdAt).getTime()) / 86400000,
          )
        : 0,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getProfileById(userId: string) {
  if (!mongoose.isValidObjectId(userId)) return null;
  const item = await Profile.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();
  return item ? formatProfile(item) : null;
}

export async function getCurrentProfile(userId: string | undefined) {
  if (!userId) return null;
  return getProfileById(userId);
}

// Mirrors the required-field rules enforced client-side in
// ProfileEditPage's validate(), so "complete" means the same thing on
// both ends. A profile can exist (via upsert) without being complete —
// e.g. right after the first partial save, or if required fields are
// blanked out on a later edit.
export function isProfileComplete(item: Record<string, any>): boolean {
  const interests = item.interests ?? [];

  return Boolean(
    typeof item.fullName === 'string' &&
    item.fullName.trim().length >= 2 &&
    typeof item.age === 'number' &&
    Number.isInteger(item.age) &&
    item.age >= 18 &&
    item.age <= 100 &&
    typeof item.gender === 'string' &&
    item.gender.length > 0 &&
    typeof item.location === 'string' &&
    item.location.trim().length > 0 &&
    typeof item.about === 'string' &&
    item.about.trim().length >= 10 &&
    Array.isArray(interests) &&
    interests.length > 0 &&
    typeof item.occupation === 'string' &&
    item.occupation.trim().length > 0 &&
    typeof item.profilePicture === 'string' &&
    item.profilePicture.trim().length > 0,
  );
}

function formatProfile(item: Record<string, any>) {
  return {
    ...item,
    userId: String(item.userId),
    interest: item.interests ?? [],
    isComplete: true,
  }
}
