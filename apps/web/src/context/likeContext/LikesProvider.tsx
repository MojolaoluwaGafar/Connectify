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
    console.log("TOGGLE LIKE:", profile);

    if (likedIds.has(profile.id)) {
      await api.unlikeUser(user.id, profile.userId);
      console.log("PROFILE BEING UNLIKED:", profile);
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(profile.id);
        return next;
      });
      return;
    }

    // ill come back to you later 
     const data =await api.likeUser(user.id,profile.userId);
     console.log("PROFILE BEING LIKED:", profile, "RESPONSE:", data);
    setLikedIds((prev) => new Set(prev).add(profile.id));
    
    if (data.matched) {
      setJustMatched(profile);
    } else {
      setJustLiked(profile);
    }

    // setJustMatched(profile);
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



// {
//   "email":"timilehingafar@gmail.com",
//   "password": "P@ss1234%"
// }

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYTE2MGM0NmNiNTg2Y2M5MjliZTg3ZCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzg5MzQ1MzM3LCJleHAiOjE3ODk5NTAxMzd9.Un6lvt-nHZfCtev4ii8KDa07GbbUHu-0aIu_eLQDvOE