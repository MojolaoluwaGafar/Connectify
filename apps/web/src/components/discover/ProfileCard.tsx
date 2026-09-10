import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Check } from 'lucide-react';

import type { DiscoverProfile } from '../../types';
import { useLikes } from '../../context/likeContext/useLikes';

interface ProfileCardProps {
  profile: DiscoverProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { likedIds, toggleLike } = useLikes();
  const navigate = useNavigate();

  const isLiked = likedIds.has(profile.id);

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
      <button
        onClick={() => navigate(`/profile/${profile.id}`)}
        className="block w-full text-left"
        aria-label={`View ${profile.fullName}'s profile`}
      >
        <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-100">
          <img
            src={profile.photoUrl ?? ''}
            alt={profile.fullName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {isLiked && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-theme shadow-sm">
              <Check size={13} strokeWidth={3} />
              Liked
            </span>
          )}
        </div>
      </button>

      <div className="p-4">
        <button
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="text-left"
        >
          <h2 className="font-[fraunces] text-lg font-semibold text-[#1C1524]">
            {profile.fullName}
            {profile.age ? `, ${profile.age}` : ''}
          </h2>

          <p className="mt-1 flex items-center gap-1 text-sm text-[#655E75] font-[inter]">
            <MapPin size={13} />
            {profile.location}
          </p>
        </button>

        <p className="mt-2 line-clamp-2 text-[15px] leading-5 text-[#655E75] font-[geist]">
          {profile.bio}
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/profile/${profile.id}`)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-[#1C1524] transition-colors hover:bg-gray-100"
          >
            View Profile
          </button>

          <button
            onClick={() => toggleLike(profile)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isLiked
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-theme text-white hover:bg-purple-700'
            }`}
          >
            <Heart
              size={15}
              fill={isLiked ? 'currentColor' : 'none'}
              strokeWidth={2}
            />

            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;