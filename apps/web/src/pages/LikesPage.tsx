import { useEffect, useState } from 'react';
import type { DiscoverProfile } from '../types';

import { mockProfiles } from '../data/mockProfile';

import ProfileCard from '../components/discover/ProfileCard';
import { useLikes } from '../context/likeContext/useLikes';

type Tab = 'liked-you' | 'you-liked';

const LikesPage = () => {
  const [tab, setTab] = useState<Tab>('liked-you');

  // These 5 profiles are only being used to keep
  // the "Liked You (5)" layout populated for now.
  const [likedYou] = useState<DiscoverProfile[]>(mockProfiles.slice(0, 5));

  // These are the people YOU have actually liked.
  const [youLiked, setYouLiked] = useState<DiscoverProfile[]>([]);

  // Get the shared like state from LikesContent.
  const { likedIds } = useLikes();

  // ==========================================================
  // LOAD PEOPLE WE HAVE LIKED
  // ==========================================================
  useEffect(() => {
    const profiles = mockProfiles.filter((profile) => likedIds.has(profile.id));

    setYouLiked(profiles);
  }, [likedIds]);

  // Decide which profiles to display.
  const list = tab === 'liked-you' ? likedYou : youLiked;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MAIN */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* TITLE + TABS */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold text-[#1C1524] md:text-3xl">
              {tab === 'liked-you'
                ? 'People who liked you'
                : 'People you liked'}
            </h1>

            <p className="mt-2 text-sm text-[#655E75]">
              {tab === 'liked-you'
                ? 'These people are interested in connecting with you.'
                : "Profiles you've shown interest in."}
            </p>
          </div>

          {/* TABS */}
          <div className="flex w-fit gap-2 rounded-full bg-[#EEF2F6] p-1">
            {/* STATIC LIKED YOU */}
            <button
              onClick={() => setTab('liked-you')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === 'liked-you'
                  ? 'bg-white text-theme shadow-sm'
                  : 'text-[#655E75]'
              }`}
            >
              Liked You (5)
            </button>

            {/* DYNAMIC YOU LIKED */}
            <button
              onClick={() => setTab('you-liked')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
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
        <div className="mt-8">
          {list.length === 0 ? (
            /* EMPTY STATE */
            <div className="min-h-96 rounded-2xl border border-dashed border-gray-300 bg-white flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-theme ">
                <img src="/icon-heart.svg" alt="" />
              </div>

              <h2 className="text-lg font-semibold text-[#1C1524]">
                You haven't liked anyone yet
              </h2>

              <p className="mt-2 max-w-md text-sm text-[#655E75]">
                Head to Discover and like a few profiles that catch your eye.
              </p>
              <button className="font-[fraunces] bg-theme px-3 py-2 text-sm font-semibold mt-6 rounded text-[#FFFFFF]  ">
                Discover People
              </button>
            </div>
          ) : (
            /* PROFILE CARDS */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LikesPage;
