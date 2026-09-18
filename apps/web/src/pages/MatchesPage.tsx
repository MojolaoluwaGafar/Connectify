import { useEffect, useState } from 'react';
import { getMatches } from '../API/Services/Matches/matches';
import { useAuth } from '../context/authContext/useAuth';
import type { DiscoverProfile } from '../types';

import { useNavigate } from 'react-router-dom';
import { useLikes } from '../context/likeContext/useLikes';
import { ProfileCardSkeletonGrid } from '../components/ui/ProfileCardSkeleton';

const Matches = () => {
  const navigate = useNavigate();

  // Get the currently logged-in user
  const { user } = useAuth();

  // Get the IDs of profiles the user has liked, and the IDs of people who
  // liked the user back — the latter changes in realtime (see
  // LikesProvider's "new_match" socket listener) whenever someone the user
  // already liked matches with them, so this page doesn't need a reload.
  const { likedIds, likedMeIds } = useLikes();

  // Store the profiles that are actual matches
  const [matches, setMatches] = useState<DiscoverProfile[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Get the user's matches when the user or liked profiles change
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    setLoading(true);

    getMatches(user.id)
      .then((res) => {
        setMatches(res);
      })
      .catch((error) => {
        console.error('Failed to get matches:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, likedIds, likedMeIds]);

  return (
    <div className="p-4 sm:p-6 md:px-12 md:py-8 lg:px-20 lg:py-10 xl:px-24 2xl:px-32 flex flex-col gap-8 text-[#655E75]">
      {/* Main matches container */}
      <div className="flex flex-col gap-6">
        {/* Page heading */}
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="font-fraunces font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
            Your matches
          </h1>

          <p className="text-sm sm:text-[15px] font-geist text-[#655E75]">
            People who liked you back - start a conversation!
          </p>
        </div>

        {/* Matches grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 flex-col gap-4 w-full max-w-7xl mx-auto ">
          {/* Loading state */}
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center my-2 rounded-2xl min-h-96 space-y-4 p-5 w-full max-w-7xl mx-auto">
              <ProfileCardSkeletonGrid count={3} />
            </div>
          ) : matches.length === 0 ? (
            /* Empty state */
            <div className="col-span-full flex flex-col items-center justify-center text-center border border-[#655e756e] border-dashed my-2 rounded-2xl space-y-4 p-5 sm:p-10 md:p-16 lg:p-20 w-full max-w-7xl mx-auto">
              {/* Empty state icon */}
              <img
                src="/ai-spark-icon.svg"
                alt=""
                className="w-15 h-15 rounded-full"
              />

              {/* Empty state text */}
              <div>
                <h2 className="text-xl font-semibold text-black font-fraunces">
                  No matches yet
                </h2>

                <p className="font-geist text-[#655E75] mt-2 text-sm sm:text-base">
                  When you and someone else like each other, they'll show{' '}
                  <br className="hidden md:block" />
                  up here so you can start chatting.
                </p>
              </div>

              {/* Discover people button */}
              <button
                className="border border-[#655e7579] px-5 py-2 font-geist rounded-xl text-sm text-black font-semibold hover:bg-gray-100"
                onClick={() => navigate('/home')}
              >
                Discover People
              </button>
            </div>
          ) : (
            /* Matches */
            matches.map((profile: DiscoverProfile) => (
              <div
                key={profile.id}
                className="group relative overflow-hidden rounded-2xl border border-stroke-primary text-sm shadow-sm transition-all duration-300 hover:shadow-lg relative"
              >
                {/* Profile image */}
                <div className="w-full h-[260px] sm:h-[280px] md:h-[300px] lg:h-[320px] xl:h-[340px] overflow-hidden bg-gray-100">
                  <img
                    src={profile.profilePicture ?? '/profile-picture.png'}
                    alt={profile.fullName}
                    className="w-full h-full object-cover block"
                  />
                </div>

                {/* Profile content */}
                <div className="p-4 sm:p-5 lg:p-6 flex flex-col gap-3 h-55">
                  {/* Profile avatar and name */}
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.profilePicture ?? '/profile-picture.png'}
                      alt={profile.fullName}
                      className="rounded-full w-8 h-8 object-cover"
                    />

                    <h2 className="font-fraunces font-semibold text-base text-black">
                      {profile.fullName}, {profile.age}
                    </h2>
                  </div>

                  {/* Profile location */}
                  <div className="flex items-center gap-1.5 text-[#655E75]">
                    <img
                      src="/Vector.png"
                      alt="location icon"
                      className="w-fit h-4"
                    />

                    <p className="text-sm font-geist font-medium">
                      {profile.location}
                    </p>
                  </div>

                  {/* Profile about */}
                  <div className="mt-1">
                    <p className="text-sm font-geist text-[#655E75] line-clamp-2">
                      {profile.about}
                    </p>
                  </div>

                  {/* Profile action buttons */}
                  <div className="flex items-center justify-between px-4 sm:gap-3 absolute bottom-2 left-0 w-full">
                    {/* Start chat button */}
                    <button
                      onClick={() => navigate('/messages')}
                      className="bg-theme text-white font-medium font-geist py-2.5 px-2 sm:px-4 rounded-lg text-sm hover:bg-[#6941C6] transition-colors w-[50%]"
                    >
                      Start Chat
                    </button>

                    {/* View profile button */}
                    <button
                      className="border border-[#D0D5DD] text-[#344054] font-medium font-geist py-3 px-2 sm:px-4 rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors w-[50%]"
                      onClick={() => navigate(`/profile/${profile.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
