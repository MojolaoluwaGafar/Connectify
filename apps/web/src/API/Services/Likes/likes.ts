import type { DiscoverProfile } from '../../../types';
import api from '../../api';

function extractItems(data: unknown): DiscoverProfile[] {
  if (Array.isArray(data)) return data as DiscoverProfile[];

  if (typeof data === 'object' && data !== null) {
    const payload = data as {
      items?: unknown;
      data?: { items?: unknown };
    };

    if (Array.isArray(payload.items)) {
      return payload.items as DiscoverProfile[];
    }

    if (Array.isArray(payload.data?.items)) {
      return payload.data.items as DiscoverProfile[];
    }
  }

  return [];
}

export async function getWhoLikedMe(userId: string): Promise<DiscoverProfile[]> {
  const { data } = await api.get('/api/v1/likes/who-liked-me', {
    params: { userId },
  });
  return extractItems(data);
}

export async function likeUser(
  userId: string,
  targetId: string,
): Promise<{ matched: boolean }> {
  const { data } = await api.put(`/api/v1/likes/profiles/${targetId}/like`, {
    userId,
  });

  return {
    matched: Boolean(data?.matched ?? data?.data?.matched),
  };
}

export async function likeProfile(profileId: string) {
  return api.put(`/api/v1/likes/profiles/${profileId}/like`);
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
  return extractItems(data);
}

export const LikesService = {
  getWhoLikedMe,
  likeUser,
  likeProfile,
  unlikeUser,
  getLikedByMe,
};
