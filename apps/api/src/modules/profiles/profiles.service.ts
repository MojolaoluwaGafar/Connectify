import mongoose from "mongoose"
import { profile, Profile } from "../../model/profile.js"

export async function createProfile(userId: string, data: profile) {
  console.log(data)
  const { fullName, gender, interests, occupation, about, age, location, profilePicture, locationCoords} = data
  const newProfile = await Profile.create( {
      userId, fullName, gender, interests, occupation, about, age, location, profilePicture, locationCoords
    })
 return newProfile
}

export async function listProfiles(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page) || 1, 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 8, 1), 50)
  const skip = (page - 1) * pageSize
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const tab = query.tab === 'near-me' || query.tab === 'new' ? query.tab : 'all'
  const excludeUserId = typeof query.excludeUserId === 'string' ? query.excludeUserId : ''
  const baseFilter: Record<string, unknown> = {}

  if (excludeUserId && mongoose.isValidObjectId(excludeUserId)) {
    baseFilter.userId = { $ne: new mongoose.Types.ObjectId(excludeUserId) }
  }

  if (search) {
    baseFilter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { interests: { $regex: search, $options: 'i' } },
    ]
  }

  if (tab === 'near-me') {
    const lat = Number(query.lat)
    const lng = Number(query.lng)
    const radius = Math.min(Math.max(Number(query.radius) || 25, 1), 100)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error('Latitude and longitude are required for nearby discovery')
    }

    const [result] = await Profile.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          key: 'locationCoords',
          distanceField: 'distanceMeters',
          maxDistance: radius * 1000,
          spherical: true,
          query: baseFilter,
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          items: [{ $skip: skip }, { $limit: pageSize }],
        },
      },
    ])

    const total = result?.metadata?.[0]?.total ?? 0
    return formatDiscoveryResult(result?.items ?? [], total, page, pageSize)
  }

  const profileQuery = Profile.find(baseFilter)
    .sort(tab === 'new' ? { createdAt: -1 } : { _id: -1 })
    .skip(skip)
    .limit(pageSize)
  const [items, total] = await Promise.all([
    profileQuery.lean(),
    Profile.countDocuments(baseFilter),
  ])

  return formatDiscoveryResult(items, total, page, pageSize)
}

function formatDiscoveryResult(items: Array<Record<string, any>>, total: number, page: number, pageSize: number) {
  return {
    items: items.map((item) => ({
      ...item,
      id: String(item.userId),
      userId: String(item.userId),
      interest: item.interests ?? [],
      joinedDaysAgo: item.createdAt
        ? Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86400000)
        : 0,
      ...(item.distanceMeters !== undefined
        ? { distanceLabel: `${(item.distanceMeters / 1000).toFixed(1)} km away` }
        : {}),
    })),
    total,
    page,
    pageSize,
  }
}

export async function getProfileById(userId: string) {
  if (!mongoose.isValidObjectId(userId)) return null

  const item = await Profile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean()
  return item ? formatProfile(item) : null
}

export async function getCurrentProfile(userId: string | undefined) {
  if (!userId) return null
  return getProfileById(userId)
}

function formatProfile(item: Record<string, any>) {
  return {
    ...item,
    userId: String(item.userId),
    interest: item.interests ?? [],
    isComplete: true,
  }
}

