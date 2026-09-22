// ============================================================================
// Core data shapes for Connectify.
//
// TODO: BACKEND — these interfaces should mirror your MongoDB/Mongoose
// schemas exactly. When the real API is built, these types can mostly be
// copy-pasted into a `shared/types` package (or kept here and just pointed
// at real API responses instead of mock data).
// ============================================================================

export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface User {
  id: string;
  fullName: string;
  email: string;
  // TODO: BACKEND — never store/return plaintext passwords. This field only
  // exists here because our fake backend has no server to hash things on.
  password: string;
  isEmailVerified: boolean;
  createdAt: string;
}

// GeoJSON point — coordinates are [longitude, latitude], in that order.
export interface LocationCoords {
  type: 'Point';
  coordinates: [number, number];
}

export interface Profile {
  userId: string;
  isComplete?: boolean;
  fullName: string;
  age: number;
  gender: Gender;
  location: string;
  // Only present on your own profile — the API never returns other people's.
  locationCoords?: LocationCoords;
  occupation: string;
  about: string;
  interest?: string[];
  interests?: string[];
  profilePicture: string | null;
  // Full gallery, main photo first (photos[0] === profilePicture).
  photos?: string[];
}
export interface ICreateProfile {
  fullName: string;
  age: number;
  gender: Gender;
  location: string;
  locationCoords: LocationCoords;
  occupation: string;
  about: string;
  interests: string[];
  // Already-hosted URLs mixed with newly-picked files, in gallery order —
  // the first entry becomes the profile's main photo.
  photos: (string | File)[];
}

export interface DiscoverProfile extends Profile {
  id: string; // same as userId, convenience for lists/keys
  interests: string[];
  distanceLabel?: string; // e.g. "12 km away" — set on the near-me tab only
  joinedDaysAgo: number; // used for the "New" filter
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  matchedAt: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  sentAt: string;
  status?: MessageStatus;
}

export interface Conversation {
  matchId: string;
  otherUser: DiscoverProfile;
  lastMessage: Message | null;
  unreadCount: number;
}
