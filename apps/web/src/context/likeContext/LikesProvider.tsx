import { useEffect, useState, type ReactNode } from 'react';
import type { DiscoverProfile } from '../../types/index';
import {
  getLikedByMe,
  likeUser,
  unlikeUser,
} from '../../API/Services/Likes/likes';
import { useAuth } from '../authContext/useAuth';
import { LikesContext } from './likeContext';
import { invalidateQuery } from '../../hooks/useApiQuery';

function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [justMatched, setJustMatched] = useState<DiscoverProfile | null>(null);
  const [justLiked, setJustLiked] = useState<DiscoverProfile | null>(null);

  async function refreshLikes() {
    if (!user) {
      setLikedIds(new Set());
      return;
    }
    const liked = await getLikedByMe(user.id);
    setLikedIds(new Set(liked.map((profile) => profile.id)));
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!user) {
        setLikedIds(new Set());
        return;
      }
      const liked = await getLikedByMe(user.id);
      if (!ignore) {
        setLikedIds(new Set(liked.map((p) => p.id)));
      }
    }

    run();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function toggleLike(profile: DiscoverProfile) {
    if (!user) return;

    if (likedIds.has(profile.id)) {
      try {
        await unlikeUser(user.id, profile.userId);
        setLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(profile.id);
          return next;
        });
        // Un-syncs LikesPage's cached "You Liked" list from this action
        // so it refetches fresh data next time it's viewed, instead of
        // relying solely on the local likedIds filter to hide it.
        invalidateQuery(`you-liked:${user.id}`);
      } catch (error) {
        console.error('Failed to unlike profile:', error);
      }
      return;
    }

    try {
      const data = await likeUser(user.id, profile.userId);
      setLikedIds((prev) => new Set(prev).add(profile.id));

      // The "You Liked" cache in LikesPage has no way to know this new
      // like happened — without this, the profile won't appear there
      // until the cache naturally expires (staleTime) or a hard reload.
      invalidateQuery(`you-liked:${user.id}`);

      if (data.matched) {
        setJustMatched(profile);
      } else {
        setJustLiked(profile);
      }
    } catch (error) {
      console.error('Failed to like profile:', error);
    }
  }

  return (
    <LikesContext.Provider
      value={{
        likedIds,
        toggleLike,
        justMatched,
        clearMatch: () => setJustMatched(null),
        justLiked,
        clearLiked: () => setJustLiked(null),
        refreshLikes,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
}

export default LikesProvider;
