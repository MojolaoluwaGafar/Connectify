// ============================================================================
// MOCK API — simulates a full backend with Express + MongoDB.
//
// TODO: BACKEND — every exported function below is written to look exactly
// like a real API call: it's `async`, it can `throw` a typed error, and it
// returns plain data. That's on purpose — when the real backend exists, you
// swap the *inside* of each function for a `fetch('/api/...')` call and
// nothing in your components has to change.
//
// Example of what this becomes:
//   export async function login(email, password) {
//     const res = await fetch('/api/auth/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//     });
//     if (!res.ok) throw new ApiError((await res.json()).message);
//     return res.json();
//   }
// ============================================================================

import { mockProfiles } from '../data/mockProfile';
import type {
  Conversation,
  DiscoverProfile,
  Like,
  Match,
  Message,
  Profile,
  User,
} from '../types';
import { readStore, writeStore } from './storage';

export class ApiError extends Error {}

// Simulated network latency so loading states feel real.
const delay = (ms = 550) => new Promise((res) => setTimeout(res, ms));

// ---- Storage shape --------------------------------------------------------
interface StoredUser extends User {}

const USERS_KEY = 'users';
const PROFILES_KEY = 'profiles';
const VERIFY_CODES_KEY = 'verify_codes'; // TODO: BACKEND — real emails, not stored codes
const RESET_TOKENS_KEY = 'reset_tokens'; // TODO: BACKEND — real emails, not stored tokens
const LIKES_KEY = 'likes';
const MESSAGES_KEY = 'messages';
const SESSION_KEY = 'session';

function getUsers(): StoredUser[] {
  return readStore<StoredUser[]>(USERS_KEY, []);
}
function saveUsers(users: StoredUser[]) {
  writeStore(USERS_KEY, users);
}
function getProfiles(): Record<string, Profile> {
  return readStore<Record<string, Profile>>(PROFILES_KEY, {});
}
function saveProfiles(profiles: Record<string, Profile>) {
  writeStore(PROFILES_KEY, profiles);
}
function getLikes(): Like[] {
  return readStore<Like[]>(LIKES_KEY, []);
}
function saveLikes(likes: Like[]) {
  writeStore(LIKES_KEY, likes);
}
function getMessages(): Message[] {
  return readStore<Message[]>(MESSAGES_KEY, []);
}
function saveMessages(messages: Message[]) {
  writeStore(MESSAGES_KEY, messages);
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// Merges the 20 static demo profiles with any *real* accounts that have
// saved a profile. This is what makes it possible to sign up a second real
// account (in the same browser) and actually match with it — without this,
// Discover would only ever show the fake seed data.
function getAllDiscoverProfiles(): DiscoverProfile[] {
  const users = getUsers();
  const profiles = getProfiles();
  const realProfiles: DiscoverProfile[] = users
    .filter((u) => profiles[u.id])
    .map((u) => {
      const p = profiles[u.id];
      const joinedDaysAgo = Math.floor(
        (Date.now() - new Date(u.createdAt).getTime()) / 86_400_000,
      );
      return { ...p, id: u.id, joinedDaysAgo };
    });
  // Real accounts go first — otherwise a freshly created profile lands on
  // page 3 behind the 20 static demo profiles and is easy to miss.
  return [...realProfiles, ...mockProfiles];
}

// Seed a couple of "who liked you" entries the first time the app runs, so
// the Likes/Matches pages aren't empty on a fresh browser.
function seedIfEmpty() {
  const likes = getLikes();
  if (likes.length === 0) {
    const seeded: Like[] = mockProfiles.slice(0, 5).map((p) => ({
      id: uid('like'),
      fromUserId: p.id,
      toUserId: '__seed_pending__', // patched to real user id on first login
      createdAt: new Date().toISOString(),
    }));
    saveLikes(seeded);
  }
}

// ============================================================================
// AUTH
// ============================================================================

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ email: string }> {
  await delay();
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new ApiError('An account with this email already exists.');
  }
  const newUser: StoredUser = {
    id: uid('user'),
    fullName,
    email,
    password, // TODO: BACKEND — hash with bcrypt server-side, never store plaintext
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);

  // TODO: BACKEND — actually send an email via SendGrid/Resend/Nodemailer.
  // Here we just generate a 6-digit code and store it so VerifyEmail can
  // check against it.
  const codes = readStore<Record<string, string>>(VERIFY_CODES_KEY, {});
  codes[email.toLowerCase()] = String(
    Math.floor(100000 + Math.random() * 900000),
  );
  writeStore(VERIFY_CODES_KEY, codes);

  // Dev convenience: log the "email" to the console so it can be tested
  // without a real inbox.
  // eslint-disable-next-line no-console
  console.info(
    `[mock email] Verification code for ${email}:`,
    codes[email.toLowerCase()],
  );

  return { email };
}

export async function resendVerificationCode(email: string): Promise<void> {
  await delay(400);
  const codes = readStore<Record<string, string>>(VERIFY_CODES_KEY, {});
  codes[email.toLowerCase()] = String(
    Math.floor(100000 + Math.random() * 900000),
  );
  writeStore(VERIFY_CODES_KEY, codes);
  // eslint-disable-next-line no-console
  console.info(
    `[mock email] New verification code for ${email}:`,
    codes[email.toLowerCase()],
  );
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  await delay();
  const codes = readStore<Record<string, string>>(VERIFY_CODES_KEY, {});
  if (codes[email.toLowerCase()] !== code) {
    throw new ApiError('That code is incorrect or has expired.');
  }
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new ApiError('Account not found.');
  user.isEmailVerified = true;
  saveUsers(users);
}

export async function login(email: string, password: string): Promise<User> {
  await delay();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    throw new ApiError('Incorrect email or password.');
  }
  if (!user.isEmailVerified) {
    throw new ApiError('Please verify your email before logging in.');
  }
  writeStore(SESSION_KEY, { userId: user.id });

  // Patch any seeded "likes" to point at this real user, first login only.
  seedIfEmpty();
  const likes = getLikes();
  let touched = false;
  likes.forEach((l) => {
    if (l.toUserId === '__seed_pending__') {
      l.toUserId = user.id;
      touched = true;
    }
  });
  if (touched) saveLikes(likes);

  return user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay();
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  // Note: we don't throw if the user isn't found — that would leak which
  // emails are registered. Real backends do the same thing.
  if (user) {
    const tokens = readStore<Record<string, string>>(RESET_TOKENS_KEY, {});
    tokens[email.toLowerCase()] = uid('reset');
    writeStore(RESET_TOKENS_KEY, tokens);
    // eslint-disable-next-line no-console
    console.info(
      `[mock email] Password reset token for ${email}:`,
      tokens[email.toLowerCase()],
    );
  }
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await delay();
  const tokens = readStore<Record<string, string>>(RESET_TOKENS_KEY, {});
  if (tokens[email.toLowerCase()] !== token) {
    throw new ApiError('This reset link is invalid or has expired.');
  }
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new ApiError('Account not found.');
  user.password = newPassword;
  saveUsers(users);
  delete tokens[email.toLowerCase()];
  writeStore(RESET_TOKENS_KEY, tokens);
}

export function getSession(): { userId: string } | null {
  return readStore<{ userId: string } | null>(SESSION_KEY, null);
}

export async function logout(): Promise<void> {
  await delay(200);
  writeStore(SESSION_KEY, null);
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  await delay(300);
  return getUsers().find((u) => u.id === userId) ?? null;
}

// ============================================================================
// PROFILE
// ============================================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  await delay(300);
  return getProfiles()[userId] ?? null;
}

export async function saveProfile(
  userId: string,
  data: Omit<Profile, 'userId' | 'isComplete'>,
): Promise<Profile> {
  await delay();
  const profiles = getProfiles();
  const isComplete = Boolean(
    data.fullName && data.age && data.gender && data.location && data.bio,
  );
  const profile: Profile = { userId, ...data, isComplete };
  profiles[userId] = profile;
  saveProfiles(profiles);
  return profile;
}

// ============================================================================
// DISCOVER
// ============================================================================

export interface DiscoverFilters {
  search?: string;
  tab?: 'all' | 'near-me' | 'new';
  page?: number;
  pageSize?: number;
  excludeUserId?: string;
}

export interface DiscoverResult {
  items: DiscoverProfile[];
  total: number;
  page: number;
  pageSize: number;
}

// Treat everyone in the current user's own city as "near me" — simple and
// good enough for a mock without real geolocation.
function isNearMe(profile: DiscoverProfile, myLocation?: string) {
  if (!myLocation) return false;
  const city = myLocation.split(',')[0]?.trim().toLowerCase();
  return profile.location.toLowerCase().includes(city);
}

export async function getDiscoverProfiles(
  filters: DiscoverFilters,
): Promise<DiscoverResult> {
  await delay(400);
  const {
    search = '',
    tab = 'all',
    page = 1,
    pageSize = 8,
    excludeUserId,
  } = filters;

  const myProfile = excludeUserId ? getProfiles()[excludeUserId] : undefined;

  let items = getAllDiscoverProfiles().filter((p) => p.id !== excludeUserId);

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.interests.some((i) => i.toLowerCase().includes(q)) ||
        p.location.toLowerCase().includes(q),
    );
  }

  if (tab === 'near-me') {
    items = items.filter((p) => isNearMe(p, myProfile?.location));
  } else if (tab === 'new') {
    items = [...items]
      .sort((a, b) => a.joinedDaysAgo - b.joinedDaysAgo)
      .filter((p) => p.joinedDaysAgo <= 10);
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { items: pageItems, total, page, pageSize };
}

export async function getProfileById(
  id: string,
): Promise<DiscoverProfile | null> {
  await delay(300);
  return getAllDiscoverProfiles().find((p) => p.id === id) ?? null;
}

// ============================================================================
// LIKES + MATCHES
// ============================================================================

export async function likeUser(
  fromUserId: string,
  toUserId: string,
): Promise<{ matched: boolean }> {
  await delay(350);
  const likes = getLikes();
  const already = likes.some(
    (l) => l.fromUserId === fromUserId && l.toUserId === toUserId,
  );
  if (!already) {
    likes.push({
      id: uid('like'),
      fromUserId,
      toUserId,
      createdAt: new Date().toISOString(),
    });
    saveLikes(likes);
  }
  // A match happens when the like is mutual (industry-standard rule — we
  // never surface a "match" with someone who hasn't consented by liking
  // back). Shared interests are used elsewhere to rank/suggest people in
  // Discover, but do not create a Match on their own.
  const matched = likes.some(
    (l) => l.fromUserId === toUserId && l.toUserId === fromUserId,
  );
  return { matched };
}

export async function unlikeUser(
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  await delay(300);
  const likes = getLikes().filter(
    (l) => !(l.fromUserId === fromUserId && l.toUserId === toUserId),
  );
  saveLikes(likes);
}

export async function getLikedByMe(userId: string): Promise<DiscoverProfile[]> {
  await delay(300);
  const likes = getLikes().filter((l) => l.fromUserId === userId);
  return likes
    .map((l) => getAllDiscoverProfiles().find((p) => p.id === l.toUserId))
    .filter((p): p is DiscoverProfile => Boolean(p));
}

export async function getWhoLikedMe(
  userId: string,
): Promise<DiscoverProfile[]> {
  await delay(300);
  const likes = getLikes().filter((l) => l.toUserId === userId);
  return likes
    .map((l) => getAllDiscoverProfiles().find((p) => p.id === l.fromUserId))
    .filter((p): p is DiscoverProfile => Boolean(p));
}

export async function hasLiked(
  userId: string,
  targetId: string,
): Promise<boolean> {
  const likes = getLikes();
  return likes.some((l) => l.fromUserId === userId && l.toUserId === targetId);
}

// A stable, order-independent id for a pair of users — so the conversation
// thread is the exact same one whether user A or user B looks it up. The
// old scheme (`match_${myId}_${theirId}`) produced a *different* string
// depending who was asking, which meant two real accounts could end up
// writing to two disconnected threads instead of one shared conversation.
function conversationId(userIdA: string, userIdB: string): string {
  return `convo_${[userIdA, userIdB].sort().join('_')}`;
}

// Returns who a user can message: anyone they've liked, OR anyone who's
// liked them — messaging doesn't require the like to be mutual on both
// sides, just present on at least one side.
function getConnectedIds(userId: string): {
  mutual: string[];
  anyDirection: string[];
} {
  const likes = getLikes();
  const iLiked = new Set(
    likes.filter((l) => l.fromUserId === userId).map((l) => l.toUserId),
  );
  const likedMe = new Set(
    likes.filter((l) => l.toUserId === userId).map((l) => l.fromUserId),
  );
  const mutual = [...iLiked].filter((id) => likedMe.has(id));
  const anyDirection = Array.from(new Set([...iLiked, ...likedMe]));
  return { mutual, anyDirection };
}

// ============================================================================
// MATCHES + MESSAGING PERMISSIONS
// ============================================================================

// Mutual likes only — this is the "It's a Match!" milestone shown on the
// Matches page. Messaging itself doesn't require this (see canMessage).
export async function getMatches(
  userId: string,
): Promise<{ match: Match; profile: DiscoverProfile }[]> {
  await delay(400);
  const { mutual } = getConnectedIds(userId);

  return mutual
    .map((otherId) => {
      const profile = getAllDiscoverProfiles().find((p) => p.id === otherId);
      if (!profile) return null;
      const match: Match = {
        id: conversationId(userId, otherId),
        userAId: userId,
        userBId: otherId,
        matchedAt: new Date().toISOString(),
      };
      return { match, profile };
    })
    .filter((m): m is { match: Match; profile: DiscoverProfile } => Boolean(m));
}

// Can these two people message each other? Yes if either has liked the
// other — a like from just one side is enough to open the conversation,
// it doesn't need to be reciprocated first.
export async function canMessage(
  userId: string,
  targetId: string,
): Promise<boolean> {
  const { anyDirection } = getConnectedIds(userId);
  return anyDirection.includes(targetId);
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function getConversations(
  userId: string,
): Promise<Conversation[]> {
  await delay(350);
  const { anyDirection } = getConnectedIds(userId);
  const messages = getMessages();

  return anyDirection
    .map((otherId): Conversation | null => {
      const profile = getAllDiscoverProfiles().find((p) => p.id === otherId);
      if (!profile) return null;
      const matchId = conversationId(userId, otherId);
      const threadMessages = messages
        .filter((m) => m.matchId === matchId)
        .sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
        );
      return {
        matchId,
        otherUser: profile,
        lastMessage: threadMessages[0] ?? null,
      };
    })
    .filter((c): c is Conversation => Boolean(c));
}

export async function getMessagesForMatch(matchId: string): Promise<Message[]> {
  await delay(250);
  return getMessages()
    .filter((m) => m.matchId === matchId)
    .sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  text: string,
): Promise<Message> {
  await delay(300);
  const messages = getMessages();
  const message: Message = {
    id: uid('msg'),
    matchId,
    senderId,
    text,
    sentAt: new Date().toISOString(),
  };
  messages.push(message);
  saveMessages(messages);
  return message;
}

// True if this id belongs to someone who actually signed up (vs. one of the
// 20 static demo profiles). Used to skip the simulated auto-reply for real
// accounts — a real person should reply from their own session, not get a
// canned response typed for them.
export function isRealUser(id: string): boolean {
  return getUsers().some((u) => u.id === id);
}
