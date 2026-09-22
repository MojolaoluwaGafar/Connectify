import mongoose from 'mongoose';
import { profile, Profile } from '../../model/profile.js';
import cloudinary, {
  profileMediaUploadOptions,
} from '../../config/Cloudinary.js';
import type { ProfileInput } from './profiles.validation.js';
import { orderBySeed } from './seeded-order.js';

const GENDER_FILTERS = ['male', 'female', 'non-binary', 'prefer-not-to-say'];

const DEFAULT_NEARBY_RADIUS_KM = 50;
const MAX_NEARBY_RADIUS_KM = 500;

export async function createProfile(userId: string, data: ProfileInput) {
  const {
    fullName,
    gender,
    interests,
    occupation,
    about,
    age,
    location,
    locationCoords,
    photos,
  } = data;

  // The main photo is always whichever one is first in the gallery, so
  // every consumer that only knows about `profilePicture` keeps working.
  const profilePicture = photos[0] ?? null;

  const updatedProfile = await Profile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      userId: new mongoose.Types.ObjectId(userId),
      fullName,
      gender,
      interests,
      occupation,
      about,
      age,
      location,
      locationCoords,
      profilePicture,
      photos,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  if (!updatedProfile) {
    throw new Error('Profile could not be saved');
  }

  return formatProfile(updatedProfile.toObject());
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

  const gender =
    typeof query.gender === 'string' && GENDER_FILTERS.includes(query.gender)
      ? query.gender
      : '';

  const baseFilter: Record<string, unknown> = {};

  if (gender) {
    baseFilter.gender = gender;
  }

  if (excludeUserId && mongoose.isValidObjectId(excludeUserId)) {
    baseFilter.userId = {
      $ne: new mongoose.Types.ObjectId(excludeUserId),
    };
  }

  if (search) {
    baseFilter.$or = [
      {
        fullName: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        interests: {
          $regex: search,
          $options: 'i',
        },
      },
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
      .select('+locationCoords')
      .lean();

    const origin = currentUserProfile?.locationCoords?.coordinates;

    if (!origin || origin.length !== 2) {
      throw new Error(
        'Set your location in your profile to see nearby matches',
      );
    }

    const radiusKm = Math.min(
      Math.max(Number(query.radius) || DEFAULT_NEARBY_RADIUS_KM, 1),
      MAX_NEARBY_RADIUS_KM,
    );

    return listNearbyProfiles(
      baseFilter,
      origin as [number, number],
      radiusKm,
      skip,
      page,
      pageSize,
    );
  }

  if (tab === 'all') {
    // Same seed -> same order every time, so paging through stays stable
    // within one browsing session (the frontend generates the seed once and
    // reuses it for every page request). A new seed — e.g. a fresh page
    // load — gives a different order, which is the "random" part.
    const seed = Number(query.seed) || 0;

    const matchingIds = await Profile.find(baseFilter).select('_id').lean();
    const shuffledIds = orderBySeed(
      matchingIds.map((doc) => String(doc._id)),
      seed,
    );
    const total = shuffledIds.length;
    const pageIds = shuffledIds.slice(skip, skip + pageSize);

    const docs = await Profile.find({ _id: { $in: pageIds } }).lean();
    const docsById = new Map(docs.map((doc) => [String(doc._id), doc]));
    const items = pageIds
      .map((id) => docsById.get(id))
      .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));

    return formatDiscoveryResult(items, total, page, pageSize);
  }

  // "new" tab: newest first. Profiles have no createdAt field, but an
  // ObjectId's leading bytes are its creation time, so sorting by _id is
  // newest-to-oldest (and unique, so paging never repeats or skips).
  const profileQuery = Profile.find(baseFilter)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(pageSize);

  const [items, total] = await Promise.all([
    profileQuery.lean(),
    Profile.countDocuments(baseFilter),
  ]);

  return formatDiscoveryResult(items, total, page, pageSize);
}

// Nearest first, within radiusKm of the caller's own coordinates. $geoNear must
// be the first stage; $sort adds _id as a tiebreaker because everyone in the
// same place shares identical coordinates (distance ties), which would
// otherwise let profiles repeat or vanish between pages.
async function listNearbyProfiles(
  filter: Record<string, unknown>,
  origin: [number, number],
  radiusKm: number,
  skip: number,
  page: number,
  pageSize: number,
) {
  const [result] = await Profile.aggregate<{
    items: Array<Record<string, any>>;
    total: Array<{ count: number }>;
  }>([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: origin },
        key: 'locationCoords',
        distanceField: 'distanceMeters',
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: filter,
      },
    },
    { $sort: { distanceMeters: 1, _id: 1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: pageSize }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  return formatDiscoveryResult(
    result?.items ?? [],
    result?.total[0]?.count ?? 0,
    page,
    pageSize,
  );
}

// Coordinates come from place-level geocoding (a city or district centre), so
// distances are approximate — don't imply street-level precision.
function formatDistance(meters: number) {
  const km = Math.round(meters / 1000);
  return km < 1 ? 'In your area' : `${km} km away`;
}

// Profiles have no createdAt field; the ObjectId carries the creation time.
function daysSinceCreated(item: Record<string, any>) {
  const createdAt: Date | undefined =
    item.createdAt ?? item._id?.getTimestamp?.();

  return createdAt
    ? Math.max(
        Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000),
        0,
      )
    : 0;
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
    items: items.map(({ locationCoords: _hidden, distanceMeters, ...item }) => ({
      ...item,
      distanceLabel:
        typeof distanceMeters === 'number'
          ? formatDistance(distanceMeters)
          : undefined,
      id: String(item.userId),
      userId: String(item.userId),
      interest: item.interests ?? [],
      isComplete: isProfileComplete(item),
      joinedDaysAgo: daysSinceCreated(item),
    })),
    total,
    page,
    pageSize,
  };
}

// locationCoords is only returned when people look at their own profile — it's
// what the edit form needs to prefill the location, and nobody else's business.
export async function getProfileById(userId: string, viewerId?: string) {
  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  const query = Profile.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (viewerId === userId) {
    query.select('+locationCoords');
  }

  const item = await query.lean();

  return item ? formatProfile(item) : null;
}

export async function getCurrentProfile(userId: string | undefined) {
  if (!userId) {
    return null;
  }

  return getProfileById(userId, userId);
}

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
    isComplete: isProfileComplete(item),
  };
}

export async function uploadProfilePicture(file: {
  buffer: Buffer;
  mimetype: string;
}) {
  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        ...profileMediaUploadOptions,
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error('Profile image upload failed'));
          return;
        }

        resolve(result.secure_url);
      },
    );

    upload.end(file.buffer);
  });
}
