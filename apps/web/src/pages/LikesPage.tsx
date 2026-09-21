import { useCallback, useMemo, useState } from 'react';

import ProfileCard from '../components/discover/ProfileCard';
import { useNavigate } from 'react-router-dom';
import { useLikes } from '../context/likeContext/useLikes';

import { getLikedByMe, getWhoLikedMe } from '../API/Services/Likes/likes';

import { useAuth } from '../context/authContext/useAuth';
import { useApiQuery } from '../hooks/useApiQuery';
import { ProfileCardSkeletonGrid } from '../components/ui/ProfileCardSkeleton';

type Tab = 'liked-you' | 'you-liked';

const LikesPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('liked-you');

  const { likedIds } = useLikes();
  const { user } = useAuth();

  const fetchWhoLikedMe = useCallback(() => getWhoLikedMe(user!.id), [user]);

  const fetchLikedByMe = useCallback(() => getLikedByMe(user!.id), [user]);

  const {
    data: likedYouData,
    loading: isLikedYouLoading,
  } = useApiQuery(fetchWhoLikedMe, 'Could not load your likes.', {
    enabled: Boolean(user),
    cacheKey: user ? `liked-you:${user.id}` : null,
    staleTime: 30_000,
  });

  const {
    data: youLikedData,
    loading: isYouLikedLoading,
  } = useApiQuery(fetchLikedByMe, 'Could not load your likes.', {
    enabled: Boolean(user),
    cacheKey: user ? `you-liked:${user.id}` : null,
    staleTime: 30_000,
  });

  const likedYou = likedYouData ?? [];

  const youLiked = useMemo(
    () => (youLikedData ?? []).filter((profile) => likedIds.has(profile.id)),
    [youLikedData, likedIds],
  );

  // Only block with the full spinner when the active tab has genuinely
  // nothing to show yet. Once data exists (even from a previous mount's
  // cache), tab switches and background refreshes never tear the grid
  // down — they just show a small "refreshing" indicator instead.
  const isLoading =
    tab === 'liked-you'
      ? isLikedYouLoading && likedYouData === null
      : isYouLikedLoading && youLikedData === null;

  const list = tab === 'liked-you' ? likedYou : youLiked;

  return (
    <div className="min-h-screen ">
      {/* MAIN */}
      <main className="p-4 sm:p-6 md:px-12 md:py-8 lg:px-20 lg:py-10 xl:px-24 2xl:px-32 flex flex-col gap-8 text-[#655E75]">
        {/* TITLE + TABS */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold font-fraunces tracking-normal leading-[100%] text-[#1C1524] md:text-3xl flex items-center gap-2">
              {tab === 'liked-you'
                ? 'People who liked you'
                : 'People you liked'}
              {/* {isRefetching && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-theme" />
              )} */}
            </h1>

            <p className="mt-2  font-[inter]  tracking-normal leading-[100%] font-normal text-[16px] text-[#655E75]  ">
              {tab === 'liked-you'
                ? 'These people are interested in connecting with you.'
                : "Profiles you've shown interest in."}
            </p>
          </div>

          {/* TABS */}
          <div className="flex w-full gap-2 rounded-full bg-[#EEF2F6] p-1 lg:w-fit">
            <button
              onClick={() => setTab('liked-you')}
              className={`rounded-full px-4 w-1/2 py-2 font-[inter] text-sm font-semibold transition lg:w-fit ${
                tab === 'liked-you'
                  ? 'bg-white text-theme shadow-sm'
                  : 'text-[#655E75]'
              }`}
            >
              Liked You ({likedYou.length})
            </button>

            <button
              onClick={() => setTab('you-liked')}
              className={`rounded-full px-4 w-1/2 py-2 font-[inter] text-sm font-semibold transition lg:w-fit ${
                tab === 'you-liked'
                  ? 'bg-white text-theme shadow-sm'
                  : 'text-[#655E75]'
              }`}
            >
              You Liked ({youLiked.length})
            </button>
          </div>
        </div>

        {/* PROFILE AREA */}
        <div className="mt-8  ">
          {isLoading ? (
            /* LOADING STATE — only when the active tab truly has nothing yet */
            <div className="col-span-full flex flex-col items-center justify-center text-center my-2 rounded-2xl min-h-96 space-y-4 p-5 w-full max-w-7xl mx-auto">
              <ProfileCardSkeletonGrid count={6} />
            </div>
          ) : list.length === 0 ? (
            /* EMPTY STATE */
            <div className="min-h-96 rounded-2xl border border-dashed border-gray-300  flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-theme ">
                <img src="/icon-heart.svg" alt="" />
              </div>

              <h2 className="text-xl font-semibold text-[#1C1524] font-fraunces tracking-normal leading-[100%]">
                You haven't liked anyone yet
              </h2>

              <p className="mt-4 max-w-md text-sm text-[#655E75] font-geist tracking-normal leading-[100%]">
                Head to Discover and like a few profiles that catch your eye.
              </p>
              <button
                className="border border-[#655e7579] px-5 py-2 font-geist rounded-xl text-sm text-black font-semibold hover:bg-gray-100 mt-7"
                onClick={() => navigate('/home')}
              >
                Discover People
              </button>
            </div>
          ) : (
            /* PROFILE CARDS */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((profile) => (
                <ProfileCard key={profile.userId} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LikesPage;
