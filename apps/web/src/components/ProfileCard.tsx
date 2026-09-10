import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Check } from 'lucide-react';

import type { DiscoverProfile } from '../types';
import { useLikes } from '../context/likeContext/useLikes';

interface Props {
  profiles: DiscoverProfile[];
}

export const ProfileCard = ({ profiles }: Props) => {
  const navigate = useNavigate();
  const { likedIds, toggleLike } = useLikes();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => {
        const isLiked = likedIds.has(profile.id);

        return (
          <div
            key={profile.id}
            className="group overflow-hidden rounded-2xl border border-stroke-primary bg-white transition-shadow duration-300 hover:shadow-lg"
          >
            {/* Profile Image */}
            <button
              onClick={() => navigate(`/profile/${profile.userId}`)}
              className="block w-full text-left"
              aria-label={`View ${profile.fullName}'s profile`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                <img
                  src={profile.photoUrl || ''}
                  alt={profile.fullName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Liked Badge */}
                {isLiked && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-theme shadow-sm">
                    <Check size={13} strokeWidth={3} />
                    Liked
                  </span>
                )}
              </div>
            </button>

            {/* Profile Information */}
            <div className="p-4">
              {/* Name */}
              <button
                onClick={() => navigate(`/profile/${profile.userId}`)}
                className="text-left"
              >
                <h2 className="font-fraunces text-lg font-semibold text-[#1C1524]">
                  {profile.fullName}
                  {profile.age ? `, ${profile.age}` : ''}
                </h2>

                {/* Location */}
                <p className="mt-1 flex items-center gap-1 font-[inter] text-sm text-[#655E75]">
                  <MapPin size={13} />
                  {profile.location}
                </p>
              </button>

              {/* Bio */}
              <p className="mt-2 line-clamp-2 font-[geist] text-[15px] leading-5 text-[#655E75]">
                {profile.bio}
              </p>

              {/* Buttons */}
              <div className="mt-4 flex gap-2">
                {/* View Profile */}
                <button
                  className="flex-1 rounded-lg border border-stroke-primary bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
                  onClick={() =>
                    navigate(`/profile/${profile.userId}`)
                  }
                >
                  View Profile
                </button>

                {/* Like */}
                <button
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors ${
                    isLiked
                      ? 'bg-gray-900 hover:bg-gray-800'
                      : 'bg-theme hover:bg-purple-700'
                  }`}
                  onClick={() => toggleLike(profile)}
                >
                  <Heart
                    size={15}
                    fill={isLiked ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />

                  {isLiked ? 'Liked' : 'Like'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};