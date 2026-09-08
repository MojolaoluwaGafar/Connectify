import { useEffect, useState } from "react";
import * as api from "../services/authApi";
import { useAuth } from "../context/authContext/useAuth";
import type { DiscoverProfile } from "../types";

import { useNavigate } from "react-router-dom";
import { useLikes } from "../context/likeContext/useLikes";

const Matches = () => {
  const navigate = useNavigate();

  // Get the currently logged-in user
  const { user } = useAuth();

  // Get the IDs of profiles the user has liked
  const { likedIds } = useLikes();

  // Store the profiles that are actual matches
  const [matches, setMatches] = useState<DiscoverProfile[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Get the user's matches when the user or liked profiles change
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    api
      .getMatches(user.id)
      .then((res) => {
        setMatches(res.map((m) => m.profile));
      })
      .catch((error) => {
        console.error("Failed to get matches:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, likedIds]);

  return (
    <div className="p-4 md:px-20 md:py-10 flex flex-col gap-8 text-[#655E75]">
      {/* Main matches container */}
      <div className="flex flex-col gap-6">
        {/* Page heading */}
        <div className="w-full container mx-auto translate-x-4 md:-translate-x-3">
          <h1 className="font-fraunces font-bold text-[28px] text-black">
            Your matches
          </h1>

          <p className="text-sm md:text-[15px] font-geist text-[#655E75]">
            People who liked you back - start a conversation!
          </p>
        </div>

        {/* Matches grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-11/12 container mx-auto">
          {/* Loading state */}
          {loading ? (
            <div className="col-span-full flex h-screen w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
            </div>
          ) : matches.length === 0 ? (
            /* Empty state */
            <div className="col-span-full flex flex-col items-center justify-center text-center border border-[#655e756e] border-dashed max-h-[55vh] my-4 md:my-2 rounded-2xl space-y-4 p-5 md:p-20">
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

                <p className="font-geist text-[#655E75] mt-2">
                  When you and someone else like each other, they'll show{" "}
                  <br className="hidden md:block" />
                  up here so you can start chatting.
                </p>
              </div>

              {/* Discover people button */}
              <button
                className="border border-[#655e7579] px-5 py-2 font-geist rounded-xl text-sm text-black font-semibold hover:bg-gray-100"
                onClick={() => navigate("/home")}
              >
                Discover People
              </button>
            </div>
          ) : (
            /* Matches */
            matches.map((profile: DiscoverProfile) => (
              <div
                key={profile.id}
                className="bg-white rounded-[24px] overflow-hidden border border-[#EBEAED] shadow-sm flex flex-col md:-translate-x-[60px]"
              >
                {/* Profile image */}
                <div className="w-full overflow-hidden">
                  <img
                    src={profile.photoUrl ?? ""}
                    alt={profile.fullName}
                    className="w-full h-full object-cover block"
                  />
                </div>

                {/* Profile content */}
                <div className="p-6 flex flex-col gap-3">
                  {/* Profile avatar and name */}
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.photoUrl ?? ""}
                      alt={profile.fullName}
                      className="rounded-full w-8 h-8"
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

                  {/* Profile bio */}
                  <div className="mt-1">
                    <p className="text-sm font-geist text-[#655E75] line-clamp-2">
                      {profile.bio}
                    </p>
                  </div>

                  {/* Profile action buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Start chat button */}
                    <button
                      onClick={() => navigate("/messages")}
                      className="bg-theme text-white font-medium font-geist py-2.5 px-4 rounded-lg text-sm hover:bg-[#6941C6] transition-colors"
                    >
                      Start Chat
                    </button>

                    {/* View profile button */}
                    <button
                      className="border border-[#D0D5DD] text-[#344054] font-medium font-geist py-3 px-4 rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
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
