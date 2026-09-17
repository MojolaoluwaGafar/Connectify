import { useEffect, useState, type ReactNode } from 'react';
import type { DiscoverProfile } from '../../types/index';
import {
  getLikedByMe,
  getWhoLikedMe,
  likeUser,
  unlikeUser,
} from '../../API/Services/Likes/likes';
import { useAuth } from '../authContext/useAuth';
import { LikesContext } from './likeContext';
import { invalidateQuery } from '../../hooks/useApiQuery';
import { themedToast } from '../../utils/ToastFeedback';

function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  // Who liked *me*. Combined with likedIds this gives us matches without
  // a separate /matches request — a match is simply a like in both Sets.
  const [likedMeIds, setLikedMeIds] = useState<Set<string>>(new Set());
  const [justMatched, setJustMatched] = useState<DiscoverProfile | null>(null);
  const [justLiked, setJustLiked] = useState<DiscoverProfile | null>(null);

  async function refreshLikes() {
    if (!user) {
      setLikedIds(new Set());
      setLikedMeIds(new Set());
      return;
    }

    const [liked, likedMe] = await Promise.all([
      getLikedByMe(user.id),
      getWhoLikedMe(user.id),
    ]);

    setLikedIds(new Set(liked.map((p) => p.id)));
    setLikedMeIds(new Set(likedMe.map((p) => p.id)));
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!user) {
        setLikedIds(new Set());
        setLikedMeIds(new Set());
        return;
      }

      const [liked, likedMe] = await Promise.all([
        getLikedByMe(user.id),
        getWhoLikedMe(user.id),
      ]);

      if (!ignore) {
        setLikedIds(new Set(liked.map((p) => p.id)));
        setLikedMeIds(new Set(likedMe.map((p) => p.id)));
      }
    }

    run();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // A match is mutual: I liked them and they liked me.
  function isMatch(profileId: string) {
    return likedIds.has(profileId) && likedMeIds.has(profileId);
  }

  async function toggleLike(profile: DiscoverProfile) {
    if (!user) return;

    if (likedIds.has(profile.userId)) {
      try {
        await unlikeUser(user.id, profile.userId);
        setLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(profile.id);
          return next;
        });
        invalidateQuery(`you-liked:${user.id}`);
        themedToast.info(`You unliked ${profile.fullName}.`);
      } catch (error) {
        console.error('Failed to unlike profile:', error);
        themedToast.error('Could not unlike this profile. Please try again.');
      }
      return;
    }

    try {
      const data = await likeUser(user.id, profile.userId);
      setLikedIds((prev) => new Set(prev).add(profile.id));
      invalidateQuery(`you-liked:${user.id}`);

      // The backend tells us whether this like completed a mutual pair.
      // Trust it over the local Sets, since likedMeIds could be stale if
      // they liked us after our last fetch. A match already gets its own
      // MatchModal, so only the non-match case needs a toast here.
      if (data.matched) {
        setLikedMeIds((prev) => new Set(prev).add(profile.id));
        setJustMatched(profile);
      } else {
        setJustLiked(profile);
        themedToast.success(`You liked ${profile.fullName}.`);
      }
    } catch (error) {
      console.error('Failed to like profile:', error);
      themedToast.error('Could not like this profile. Please try again.');
    }
  }

  return (
    <LikesContext.Provider
      value={{
        likedIds,
        likedMeIds,
        isMatch,
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