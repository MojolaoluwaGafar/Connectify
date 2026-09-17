import { useEffect, useState, type ReactNode } from 'react';
import type { DiscoverProfile } from '../../types/index';

import {
  getLikedByMe,
  likeUser,
  unlikeUser,
} from '../../API/Services/Likes/likes';

import { useAuth } from '../authContext/useAuth';
import { LikesContext } from './likeContext';

import { toast } from 'react-toastify';

function LikesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [justMatched, setJustMatched] =
    useState<DiscoverProfile | null>(null);
  const [justLiked, setJustLiked] =
    useState<DiscoverProfile | null>(null);

  async function refreshLikes() {
    if (!user) {
      setLikedIds(new Set());
      return;
    }

    try {
      const liked = await getLikedByMe(user.id);

      setLikedIds(
        new Set(liked.map((profile) => profile.userId)),
      );
    } catch (error) {
      console.error('Failed to refresh likes:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not load your likes.',
      );
    }
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!user) {
        setLikedIds(new Set());
        return;
      }

      try {
        const liked = await getLikedByMe(user.id);

        if (!ignore) {
          setLikedIds(
            new Set(liked.map((profile) => profile.userId)),
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error('Failed to load likes:', error);

          toast.error(
            error instanceof Error
              ? error.message
              : 'Could not load your likes.',
          );
        }
      }
    }

    run();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function toggleLike(profile: DiscoverProfile) {
    if (!user) {
      toast.error('Please log in to like a profile.');
      return;
    }

    try {
      const isCurrentlyLiked = likedIds.has(profile.id);

      if (isCurrentlyLiked) {
        await unlikeUser(user.id, profile.userId);

        setLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(profile.id);
          next.delete(profile.userId);
          return next;
        });

        setJustLiked(null);

        toast.success(`You unliked ${profile.fullName}.`);

        return;
      }

      const data = await likeUser(user.id, profile.userId);

      setLikedIds((prev) => {
        const next = new Set(prev);
        next.add(profile.id);
        next.add(profile.userId);
        return next;
      });

      if (data.matched) {
        setJustMatched(profile);
        toast.success(`It's a match with ${profile.fullName}!`);
      } else {
        setJustLiked(profile);
        toast.success(`You liked ${profile.fullName}.`);
      }
    } catch (error) {
      console.error('Like action failed:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not update your like. Please try again.',
      );
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