import { ProfileListResponseSchema } from '@connecti/shared';
import api from '../../api';
import type { DiscoverProfile, ICreateProfile, Profile } from '../../../types';

export interface ProfileListFilters {
  search?: string;
  tab?: 'all' | 'new' | 'near-me';
  gender?: 'male' | 'female' | 'non-binary';
  page?: number;
  pageSize?: number;
  excludeUserId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  // Stable per-session shuffle key for tab: 'all' — same seed across page
  // requests keeps pagination consistent; a new one gives a fresh random order.
  seed?: number;
}

export const ProfileServices = {
  async createProfile(data: ICreateProfile) {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('age', String(data.age));
    formData.append('gender', data.gender);
    formData.append('location', data.location);
    formData.append('locationCoords', JSON.stringify(data.locationCoords));
    formData.append('occupation', data.occupation);
    formData.append('about', data.about);
    formData.append('interests', JSON.stringify(data.interests));

    // Photos already hosted (kept from before) travel as URLs; anything
    // newly picked is a File and goes up as an actual upload instead — two
    // separate buckets on the wire. photoOrder records where each one sits
    // in the gallery (e.g. "existing:1", "new:0") so the server can
    // reassemble the real order instead of just concatenating existing+new,
    // which would silently swap in the wrong photo as the main one whenever
    // an existing photo and a new upload are interleaved.
    const existingPhotos: string[] = [];
    const photoOrder: string[] = [];
    let newPhotoIndex = 0;

    for (const photo of data.photos) {
      if (typeof photo === 'string') {
        photoOrder.push(`existing:${existingPhotos.length}`);
        existingPhotos.push(photo);
      } else {
        photoOrder.push(`new:${newPhotoIndex}`);
        formData.append('photos', photo);
        newPhotoIndex += 1;
      }
    }

    formData.append('existingPhotos', JSON.stringify(existingPhotos));
    formData.append('photoOrder', JSON.stringify(photoOrder));

    return api.post('/api/v1/profiles/createProfile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async listAllProfiles(filters: ProfileListFilters = {}) {
    const { data } = await api.get('/api/v1/profiles', {
      params: filters,
    });
    const response = ProfileListResponseSchema.parse(data);

    return response.data;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (!userId) return null;
    const { data } = await api.get(`/api/v1/profiles/${userId}`);
    return (data?.data as Profile | null) ?? null;
  },

  async getMyProfile(): Promise<Profile | null> {
    const { data } = await api.get('/api/v1/profiles/me/profile');

    // The backend always responds `{ profile: Profile | null }`. A brand-new
    // user legitimately gets `profile: null` back — that must NOT fall
    // through to the other fallbacks below (`??` treats `null` as nullish,
    // so a naive `data?.profile ?? data?.data?.profile ?? data` chain would
    // skip right past a real `null` and return the whole response object
    // instead, which is truthy and breaks every `!profile` check downstream).
    if (data && typeof data === 'object' && 'profile' in data) {
      return (data.profile as Profile | null) ?? null;
    }

    const profile = data?.data?.profile ?? data;
    return (profile as Profile | null) ?? null;
  },

  async saveProfile(
    userId: string,
    data: Omit<Profile, 'userId' | 'isComplete'>,
  ): Promise<Profile> {
    const { data: response } = await api.post('/api/v1/profiles/me/profile', {
      userId,
      ...data,
    });

    const profile = response?.profile ?? response?.data?.profile ?? response;
    return profile as Profile;
  },

  async getProfileById(profileId: string): Promise<DiscoverProfile | null> {
    if (!profileId) return null;
    const { data } = await api.get(`/api/v1/profiles/${profileId}`);
    const profile = data?.data as Partial<DiscoverProfile> | null | undefined;

    if (!profile) return null;

    return {
      ...profile,
      id: profile.id ?? profile.userId ?? profileId,
      userId: profile.userId ?? profile.id ?? profileId,
      interests: profile.interests ?? profile.interest ?? [],
      joinedDaysAgo: profile.joinedDaysAgo ?? 0,
    } as DiscoverProfile;
  },
};

export const getProfile = ProfileServices.getProfile;
export const getMyProfile = ProfileServices.getMyProfile;
export const saveProfile = ProfileServices.saveProfile;
export const getProfileById = ProfileServices.getProfileById;
export const listAllProfiles = ProfileServices.listAllProfiles;
export const createProfile = ProfileServices.createProfile;
export const getDiscoverProfiles = ProfileServices.listAllProfiles;
