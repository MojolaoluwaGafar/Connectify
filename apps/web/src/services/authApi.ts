import { isAxiosError } from 'axios';

import * as mockApi from '../lib/mockApi';
import type { DiscoverProfile, Profile, User } from '../types';
import { clearAuth, setAuthToken } from '../utils/authToken';
import api, { PublicApi } from './api';

async function withFallback<T>(
  request: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const shouldFallback =
      isAxiosError(error) &&
      (error.response?.status === 404 ||
        error.response?.status === 501 ||
        error.code === 'ERR_NETWORK');

    if (shouldFallback) {
      return fallback();
    }

    throw error;
  }
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
): Promise<{ email: string }> {
  return withFallback(
    async () => {
      const { data } = await PublicApi.post('/api/v1/auth/register', {
        fullName,
        email,
        password,
      });

      if (data?.user) {
        return data.user;
      }

      return { email };
    },
    () => mockApi.signUp(fullName, email, password),
  );
}

export async function verifyEmail(email: string, code: string): Promise<void> {
  return withFallback(
    async () => {
      await PublicApi.post('/api/v1/auth/verify-email', { email, code });
    },
    () => mockApi.verifyEmail(email, code),
  );
}

export async function login(email: string, password: string): Promise<User> {
  return withFallback(
    async () => {
      const { data } = await PublicApi.post('/api/v1/auth/login', {
        email,
        password,
      });

      const user = data?.user ?? data?.data?.user ?? data;
      const token = data?.token ?? data?.data?.token;

      if (token) {
        setAuthToken(token);
      }

      if (user) {
        return user as User;
      }

      return mockApi.login(email, password);
    },
    () => mockApi.login(email, password),
  );
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/v1/auth/logout');
  } catch (error) {
    const shouldFallback =
      isAxiosError(error) &&
      (error.response?.status === 404 ||
        error.response?.status === 501 ||
        error.code === 'ERR_NETWORK');

    if (!shouldFallback) {
      throw error;
    }
  } finally {
    clearAuth();
    await mockApi.logout();
  }
}

export async function getCurrentUser(userId?: string): Promise<User | null> {
  return withFallback(
    async () => {
      const { data } = await api.get('/api/v1/auth/me');
      const user = data?.user ?? data?.data?.user ?? data;

      if (!user && userId) {
        return mockApi.getCurrentUser(userId);
      }

      return (user as User | null) ?? null;
    },
    async () => {
      if (userId) {
        return mockApi.getCurrentUser(userId);
      }

      const session = mockApi.getSession();
      return session ? mockApi.getCurrentUser(session.userId) : null;
    },
  );
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return withFallback(
    async () => {
      const { data } = await api.get(`/api/v1/profiles/${userId}`);
      const profile = data?.profile ?? data?.data?.profile ?? data;
      return (profile as Profile | null) ?? null;
    },
    () => mockApi.getProfile(userId),
  );
}

export async function getMyProfile(): Promise<Profile | null> {
  return withFallback(
    async () => {
      const { data } = await api.get('/api/v1/profiles/me/profile');
      const profile = data?.profile ?? data?.data?.profile ?? data;
      return (profile as Profile | null) ?? null;
    },
    async () => {
      const session = mockApi.getSession();
      if (!session) return null;
      return mockApi.getProfile(session.userId);
    },
  );
}

export async function saveProfile(
  userId: string,
  data: Omit<Profile, 'userId' | 'isComplete'>,
): Promise<Profile> {
  return withFallback(
    async () => {
      const { data: response } = await api.post('/api/v1/profiles/me/profile', {
        userId,
        ...data,
      });

      const profile = response?.profile ?? response?.data?.profile ?? response;
      return profile as Profile;
    },
    () => mockApi.saveProfile(userId, data),
  );
}

export async function getProfileById(
  profileId: string,
): Promise<DiscoverProfile | null> {
  return withFallback(
    async () => {
      const { data } = await api.get(`/api/v1/profiles/${profileId}`);
      const profile = data?.profile ?? data?.data?.profile ?? data;
      return (profile as DiscoverProfile | null) ?? null;
    },
    () => mockApi.getProfileById(profileId),
  );
}

export async function getDiscoverProfiles(filters: {
  search?: string;
  tab?: 'all' | 'near-me' | 'new';
  page?: number;
  pageSize?: number;
  excludeUserId?: string;
}) {
  return withFallback(
    async () => {
      const { data } = await api.get('/api/v1/profiles', { params: filters });
      return (data?.data ?? data) as Awaited<
        ReturnType<typeof mockApi.getDiscoverProfiles>
      >;
    },
    () => mockApi.getDiscoverProfiles(filters),
  );
}

export async function canMessage(
  userId: string,
  targetId: string,
): Promise<boolean> {
  return withFallback(
    async () => {
      const { data } = await api.get('/api/v1/profiles/can-message', {
        params: { userId, targetId },
      });

      const result = data?.canMessage ?? data?.data?.canMessage ?? data;
      return Boolean(result);
    },
    () => mockApi.canMessage(userId, targetId),
  );
}

export async function getWhoLikedMe(userId: string): Promise<DiscoverProfile[]> {
  return withFallback(
    async () => {
      const { data } = await api.get('/api/v1/likes/who-liked-me', {
        params: { userId },
      });
      const result = data?.items ?? data?.data?.items ?? data;
      return (result as DiscoverProfile[]) ?? [];
    },
    () => mockApi.getWhoLikedMe(userId),
  );
}

export async function getMatches(userId: string) {
  return withFallback(
    async () => {
      const { data } = await api.get('/api/v1/likes/matches', {
        params: { userId },
      });
      const result = data?.items ?? data?.data?.items ?? data;
      return result as Awaited<ReturnType<typeof mockApi.getMatches>>;
    },
    () => mockApi.getMatches(userId),
  );
}

export async function getSession() {
  const session = mockApi.getSession();
  if (!session) return null;

  return session;
}
