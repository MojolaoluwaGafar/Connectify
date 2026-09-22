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
import { socket } from '../../lib/socket';
import { isMatchNotificationsEnabled } from '../../utils/notificationPreferences';

const PROFILE_INCOMPLETE_MESSAGE =
  'Complete your profile before liking people — you can finish it from the Profile page.';

function isProfileIncompleteError(error: unknown) {
  const code = (
    error as { response?: { data?: { error?: { code?: string } } } }
  )?.response?.data?.error?.code;

  return code === 'PROFILE_INCOMPLETE';
}

function LikesProvider({ children }: { children: ReactNode }) {
  const { user, profile: myProfile } = useAuth();
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

  // Realtime push for the person who liked first: when the other side
  // likes back, the REST response only tells *them* about the match — we
  // learn about it here instead of waiting for a refetch.
  useEffect(() => {
    if (!user) return;

    const handleNewMatch = (data: { profile: DiscoverProfile }) => {
      const profile = data.profile;

      // The match itself always counts (isMatch/likedMeIds stay accurate
      // regardless of the setting) — only the popup is opt-out-able.
      setLikedMeIds((prev) => new Set(prev).add(profile.userId));

      if (isMatchNotificationsEnabled()) {
        setJustMatched(profile);
      }
    };

    socket.on('new_match', handleNewMatch);

    return () => {
      socket.off('new_match', handleNewMatch);
    };
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

    // Unliking above stays open to everyone; only *liking* needs a finished
    // profile. The API enforces the same rule — this just saves the round trip.
    if (!myProfile?.isComplete) {
      themedToast.warning(PROFILE_INCOMPLETE_MESSAGE);
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

        if (isMatchNotificationsEnabled()) {
          setJustMatched(profile);
        }
      } else {
        setJustLiked(profile);
        themedToast.success(`You liked ${profile.fullName}.`);
      }
    } catch (error) {
      if (isProfileIncompleteError(error)) {
        themedToast.warning(PROFILE_INCOMPLETE_MESSAGE);
        return;
      }

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