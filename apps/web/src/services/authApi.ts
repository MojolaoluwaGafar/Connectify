import type { Conversation, DiscoverProfile, Profile, User } from '../types';
import { clearAuth, getAuthToken, setAuthToken } from '../utils/authToken';
import api, { PublicApi } from './api';

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ email: string }> {
  const { data } = await PublicApi.post('/api/v1/auth/register', {
    fullName,
    email,
    password,
  });

  return data?.user ?? data?.data ?? { email };
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  await PublicApi.post('/api/v1/auth/verify-email', { email, code });
}

export async function resendVerificationCode(email: string): Promise<void> {
  await PublicApi.post('/api/v1/auth/resend-verification', { email });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await PublicApi.post('/api/v1/auth/forgot-password', { email });
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await PublicApi.post('/api/v1/auth/reset-password', {
    email,
    token,
    newPassword,
    confirmPassword: newPassword,
  });
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await PublicApi.post('/api/v1/auth/login', {
    email,
    password,
  });

  const user = data?.user ?? data?.data?.user ?? data;
  const token = data?.token ?? data?.data?.token;

  if (token) {
    setAuthToken(token);
  }

  return user as User;
}

export async function logout(): Promise<void> {
  clearAuth();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await api.get('/api/v1/auth/me');
  return (data?.data as User | null) ?? null;
}
export async function getProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;
  const { data } = await api.get(`/api/v1/profiles/${userId}`);
  return (data?.profile as Profile | null) ?? null;
}
export async function getMyProfile(): Promise<Profile | null> {
  const { data } = await api.get('/api/v1/profiles/me/profile');
  const profile = data?.profile ?? data?.data?.profile ?? data;
  return (profile as Profile | null) ?? null;
}

export async function saveProfile(
  userId: string,
  data: Omit<Profile, 'userId' | 'isComplete'>,
): Promise<Profile> {
  const { data: response } = await api.post('/api/v1/profiles/me/profile', {
    userId,
    ...data,
  });

  const profile = response?.profile ?? response?.data?.profile ?? response;
  return profile as Profile;
}

export async function getProfileById(
  profileId: string,
): Promise<DiscoverProfile | null> {
  const { data } = await api.get(`/api/v1/profiles/${profileId}`);
  const profile = data?.profile ?? data?.data?.profile ?? data;
  return (profile as DiscoverProfile | null) ?? null;
}

export async function getDiscoverProfiles(filters: {
  search?: string;
  tab?: 'all' | 'near-me' | 'new';
  page?: number;
  pageSize?: number;
  excludeUserId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<{
  items: DiscoverProfile[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await api.get('/api/v1/profiles', { params: filters });
  return data?.data ?? data;
}

export async function canMessage(
  userId: string,
  targetId: string,
): Promise<boolean> {
  const { data } = await api.get('/api/v1/profiles/can-message', {
    params: { userId, targetId },
  });

  const result = data?.canMessage ?? data?.data?.canMessage ?? data;
  return Boolean(result);
}

export async function getWhoLikedMe(
  userId: string,
): Promise<DiscoverProfile[]> {
  const { data } = await api.get('/api/v1/likes/who-liked-me', {
    params: { userId },
  });
  const result = data?.items ?? data?.data?.items ?? data;
  return (result as DiscoverProfile[]) ?? [];
}

export async function getMatches(
  userId: string,
): Promise<Array<{ profile: DiscoverProfile }>> {
  const { data } = await api.get('/api/v1/likes/matches', {
    params: { userId },
  });
  return (data?.items ?? data?.data?.items ?? data) as Array<{
    profile: DiscoverProfile;
  }>;
}

export async function getSession() {
  const token = getAuthToken();
  return token ? { token } : null;
}

export async function likeUser(
  userId: string,
  targetId: string,
): Promise<{ matched: boolean }> {
  const { data } = await api.put(`/api/v1/likes/profiles/${targetId}/like`, {
    userId,
  });
  return data?.data ?? data;
}

export async function unlikeUser(
  _userId: string,
  targetId: string,
): Promise<void> {
  await api.delete(`/api/v1/likes/profiles/${targetId}/like`);
}

export async function getLikedByMe(userId: string): Promise<DiscoverProfile[]> {
  const { data } = await api.get('/api/v1/likes/liked-by-me', {
    params: { userId },
  });
  return (data?.items ?? data?.data?.items ?? data ?? []) as DiscoverProfile[];
}

export async function getConversations(
  userId: string,
): Promise<Conversation[]> {
  const { data } = await api.get('/api/v1/conversations', {
    params: { userId },
  });
  return (data?.items ?? data?.data?.items ?? data ?? []) as Conversation[];
}
