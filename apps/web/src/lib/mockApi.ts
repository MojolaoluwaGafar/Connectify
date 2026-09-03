// ============================================================================
// MOCK API — simulates a full backend with Express + MongoDB.
//
// TODO: BACKEND — every exported function below is written to look exactly
// like a real API call: it's `async`, it can `throw` a typed error, and it
// returns plain data. That's on purpose — when the real backend exists, you
// swap the inside of each function for a `fetch('/api/...')` call and nothing
// in your components has to change.
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

const API_BASE_URL = 'http://localhost:3001/api/v1'

// Simulated network latency for the remaining mock API functionality.
const delay = (ms = 550) => new Promise((res) => setTimeout(res, ms));

// ============================================================================
// AUTH HELPERS
// ============================================================================

const TOKEN_KEY = 'connecti_token';
const USER_KEY = 'connecti_user';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function saveAuthenticatedUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getStoredAuthenticatedUser(): User | null {
  const stored = localStorage.getItem(USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function removeAuthenticatedUser() {
  localStorage.removeItem(USER_KEY);
}

async function parseApiResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message ||
        data?.message ||
        'Something went wrong.',
    );
  }

  return data;
}

// ============================================================================
// STORAGE — STILL USED BY PROFILE/DISCOVER/MOCK FEATURES
// ============================================================================

interface StoredUser extends User {}

const USERS_KEY = 'users';
const PROFILES_KEY = 'profiles';
const LIKES_KEY = 'likes';
const MESSAGES_KEY = 'messages';

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

// ============================================================================
// AUTH
// ============================================================================

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ email: string }> {
  console.log('Sending signup request...')
  console.log('API URL:', `${API_BASE_URL}/auth/register`)
  console.log('Signup data:', { fullName, email })

  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      },
    )
     
    console.log('Backend response status:', response.status)

    const data = await parseApiResponse(response)

    console.log('Backend response:', data)

    return {
      email: data.data.email,
    }
  } catch (error) {
    console.error('SIGNUP REQUEST FAILED:', error)
    throw error
  }
}

export async function verifyEmail(
  email: string,
  code: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/auth/verify-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code,
      }),
    },
  );
  

  await parseApiResponse(response);
}

export async function resendVerificationCode(
  email: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/auth/resend-verification`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    },
  );

  await parseApiResponse(response);
}

export async function login(
  email: string,
  password: string,
): Promise<User> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await parseApiResponse(response);

  const token = data.data.token;
  const user = data.data.user as User;

  saveToken(token);
  saveAuthenticatedUser(user);

  return user;
}

export async function requestPasswordReset(
  email: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/auth/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    },
  );

  await parseApiResponse(response);
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/auth/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
        newPassword,
        confirmPassword: newPassword,
      }),
    },
  );

  await parseApiResponse(response);
}

export function getSession(): { token: string } | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  return { token };
}

export async function logout(): Promise<void> {
  removeToken();
  removeAuthenticatedUser();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 401 || response.status === 403) {
    removeToken();
    removeAuthenticatedUser();
    return null;
  }

  const data = await parseApiResponse(response);

  const user = data.data as User;

  saveAuthenticatedUser(user);

  return user;
}

// ============================================================================
// PROFILE
// ============================================================================

export async function getProfile(
  userId: string,
): Promise<Profile | null> {
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
    data.fullName &&
      data.age &&
      data.gender &&
      data.location &&
      data.bio,
  );

  const profile: Profile = {
    userId,
    ...data,
    isComplete,
  };

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

function getAllDiscoverProfiles(): DiscoverProfile[] {
  const users = getUsers();
  const profiles = getProfiles();

  const realProfiles: DiscoverProfile[] = users
    .filter((u) => profiles[u.id])
    .map((u) => {
      const p = profiles[u.id];

      const joinedDaysAgo = Math.floor(
        (Date.now() - new Date(u.createdAt).getTime()) /
          86_400_000,
      );

      return {
        ...p,
        id: u.id,
        joinedDaysAgo,
      };
    });

  return [...realProfiles, ...mockProfiles];
}

function isNearMe(
  profile: DiscoverProfile,
  myLocation?: string,
) {
  if (!myLocation) return false;

  const city = myLocation
    .split(',')[0]
    ?.trim()
    .toLowerCase();

  return profile.location
    .toLowerCase()
    .includes(city);
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

  const myProfile = excludeUserId
    ? getProfiles()[excludeUserId]
    : undefined;

  let items = getAllDiscoverProfiles().filter(
    (p) => p.id !== excludeUserId,
  );

  if (search.trim()) {
    const q = search.trim().toLowerCase();

    items = items.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.interests.some((i) =>
          i.toLowerCase().includes(q),
        ) ||
        p.location.toLowerCase().includes(q),
    );
  }

  if (tab === 'near-me') {
    items = items.filter((p) =>
      isNearMe(p, myProfile?.location),
    );
  } else if (tab === 'new') {
    items = [...items]
      .sort(
        (a, b) =>
          a.joinedDaysAgo - b.joinedDaysAgo,
      )
      .filter((p) => p.joinedDaysAgo <= 10);
  }

  const total = items.length;

  const start = (page - 1) * pageSize;

  const pageItems = items.slice(
    start,
    start + pageSize,
  );

  return {
    items: pageItems,
    total,
    page,
    pageSize,
  };
}

export async function getProfileById(
  id: string,
): Promise<DiscoverProfile | null> {
  await delay(300);

  return (
    getAllDiscoverProfiles().find(
      (p) => p.id === id,
    ) ?? null
  );
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
    (l) =>
      l.fromUserId === fromUserId &&
      l.toUserId === toUserId,
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

  const matched = likes.some(
    (l) =>
      l.fromUserId === toUserId &&
      l.toUserId === fromUserId,
  );

  return { matched };
}

export async function unlikeUser(
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  await delay(300);

  const likes = getLikes().filter(
    (l) =>
      !(
        l.fromUserId === fromUserId &&
        l.toUserId === toUserId
      ),
  );

  saveLikes(likes);
}

export async function getLikedByMe(
  userId: string,
): Promise<DiscoverProfile[]> {
  await delay(300);

  const likes = getLikes().filter(
    (l) => l.fromUserId === userId,
  );

  return likes
    .map((l) =>
      getAllDiscoverProfiles().find(
        (p) => p.id === l.toUserId,
      ),
    )
    .filter(
      (p): p is DiscoverProfile => Boolean(p),
    );
}

export async function getWhoLikedMe(
  userId: string,
): Promise<DiscoverProfile[]> {
  await delay(300);

  const likes = getLikes().filter(
    (l) => l.toUserId === userId,
  );

  return likes
    .map((l) =>
      getAllDiscoverProfiles().find(
        (p) => p.id === l.fromUserId,
      ),
    )
    .filter(
      (p): p is DiscoverProfile => Boolean(p),
    );
}

export async function hasLiked(
  userId: string,
  targetId: string,
): Promise<boolean> {
  const likes = getLikes();

  return likes.some(
    (l) =>
      l.fromUserId === userId &&
      l.toUserId === targetId,
  );
}

// ============================================================================
// MATCHES + MESSAGING PERMISSIONS
// ============================================================================

function conversationId(
  userIdA: string,
  userIdB: string,
): string {
  return `convo_${[userIdA, userIdB]
    .sort()
    .join('_')}`;
}

function getConnectedIds(userId: string): {
  mutual: string[];
  anyDirection: string[];
} {
  const likes = getLikes();

  const iLiked = new Set(
    likes
      .filter((l) => l.fromUserId === userId)
      .map((l) => l.toUserId),
  );

  const likedMe = new Set(
    likes
      .filter((l) => l.toUserId === userId)
      .map((l) => l.fromUserId),
  );

  const mutual = [...iLiked].filter((id) =>
    likedMe.has(id),
  );

  const anyDirection = Array.from(
    new Set([...iLiked, ...likedMe]),
  );

  return {
    mutual,
    anyDirection,
  };
}

export async function getMatches(
  userId: string,
): Promise<
  { match: Match; profile: DiscoverProfile }[]
> {
  await delay(400);

  const { mutual } = getConnectedIds(userId);

  return mutual
    .map((otherId) => {
      const profile =
        getAllDiscoverProfiles().find(
          (p) => p.id === otherId,
        );

      if (!profile) return null;

      const match: Match = {
        id: conversationId(
          userId,
          otherId,
        ),
        userAId: userId,
        userBId: otherId,
        matchedAt: new Date().toISOString(),
      };

      return {
        match,
        profile,
      };
    })
    .filter(
      (
        m,
      ): m is {
        match: Match;
        profile: DiscoverProfile;
      } => Boolean(m),
    );
}

export async function canMessage(
  userId: string,
  targetId: string,
): Promise<boolean> {
  const { anyDirection } =
    getConnectedIds(userId);

  return anyDirection.includes(targetId);
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function getConversations(
  userId: string,
): Promise<Conversation[]> {
  await delay(350);

  const { anyDirection } =
    getConnectedIds(userId);

  const messages = getMessages();

  return anyDirection
    .map(
      (
        otherId,
      ): Conversation | null => {
        const profile =
          getAllDiscoverProfiles().find(
            (p) => p.id === otherId,
          );

        if (!profile) return null;

        const matchId = conversationId(
          userId,
          otherId,
        );

        const threadMessages = messages
          .filter(
            (m) => m.matchId === matchId,
          )
          .sort(
            (a, b) =>
              new Date(b.sentAt).getTime() -
              new Date(a.sentAt).getTime(),
          );

        return {
          matchId,
          otherUser: profile,
          lastMessage:
            threadMessages[0] ?? null,
        };
      },
    )
    .filter(
      (c): c is Conversation =>
        Boolean(c),
    );
}

export async function getMessagesForMatch(
  matchId: string,
): Promise<Message[]> {
  await delay(250);

  return getMessages()
    .filter(
      (m) => m.matchId === matchId,
    )
    .sort(
      (a, b) =>
        new Date(a.sentAt).getTime() -
        new Date(b.sentAt).getTime(),
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

export function isRealUser(
  id: string,
): boolean {
  return getUsers().some(
    (u) => u.id === id,
  );
}