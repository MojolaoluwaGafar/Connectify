import type { DiscoverProfile } from '../../../types';
import api from '../../api';

export async function getMatches(userId: string): Promise<DiscoverProfile[]> {
  const { data } = await api.get("/api/v1/likes/matches", {
    params: { userId },
  });

  return (data?.items ?? data?.data?.items ?? data ?? []) as DiscoverProfile[];
}
