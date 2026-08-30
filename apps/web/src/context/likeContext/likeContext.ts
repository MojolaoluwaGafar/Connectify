import { createContext } from 'react';
import type { DiscoverProfile } from '../../types';

interface LikesContextValue {
  likedIds: Set<string>;
  toggleLike: (profile: DiscoverProfile) => Promise<void>;
  justMatched: DiscoverProfile | null;
  clearMatch: () => void;
  justLiked: DiscoverProfile | null;
  clearLiked: () => void;
  refreshLikes: () => Promise<void>;
}

export const LikesContext = createContext<LikesContextValue | undefined>(
  undefined,
);
