import { useEffect, useState, type ReactNode } from 'react';
import type { DiscoverProfile } from '../../types/index';
import * as api from '../../services/authApi';
import { useAuth } from '../authContext/useAuth';
import { LikesContext } from './likeContext';

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
    const liked = await api.getLikedByMe(user.id);
    setLikedIds(new Set(liked.map((p) => p.id)));
  }

  // Runs whenever the logged-in user changes (login, logout, session
  // rehydration on mount). `ignore` guards against a slow-resolving
  // request for a stale `user` overwriting state after a newer one has
  // already started (e.g. rapid logout/login while a fetch is in flight).
  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!user) {
        setLikedIds(new Set());
        return;
      }
      const liked = await api.getLikedByMe(user.id);
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
  // Liking and un-liking both go through here. Liking someone now always
  // unlocks messaging with them — if it also
  // happens to be a mutual like, the bigger "It's a Match!" modal takes
  // priority over the smaller "You liked them" one.
  async function toggleLike(profile: DiscoverProfile) {
    if (!user) return;

    if (likedIds.has(profile.id)) {
      await api.unlikeUser(user.id, profile.id);
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(profile.id);
        return next;
      });
      return;
    }

    const { matched } = await api.likeUser(user.id, profile.id);
    setLikedIds((prev) => new Set(prev).add(profile.id));
    if (matched) {
      setJustMatched(profile);
    } else {
      setJustLiked(profile);
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
