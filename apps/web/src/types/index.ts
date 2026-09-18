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

export interface Profile {
  userId: string;
  isComplete?: boolean;
  fullName: string;
  age: number;
  gender: Gender;
  location: string;
  occupation: string;
  about: string;
  interest?: string[];
  interests?: string[];
  profilePicture: string | null;
  //   locationCoords?: {
  //     type: 'Point';
  //     coordinates: [number, number];
  //   };
  //   isComplete: boolean;
  // }
}
export interface ICreateProfile {
  fullName: string;
  age: number;
  gender: Gender;
  location: string;
  occupation: string;
  about: string;
  interests: string[];
  profilePicture: string | File | null;
  locationCoords?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface DiscoverProfile extends Profile {
  id: string; // same as userId, convenience for lists/keys
  interests: string[];
  distanceLabel?: string; // e.g. "Near Me" — used for filtering
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

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  sentAt: string;
}

export interface Conversation {
  matchId: string;
  otherUser: DiscoverProfile;
  lastMessage: Message | null;
  unreadCount: number;
}
