import { useNavigate } from 'react-router-dom';
import type { DiscoverProfile } from '../../types';
import { useLikes } from '../../context/likeContext/useLikes';
import { Heart } from 'lucide-react';

interface ProfileCardProps {
  profile: DiscoverProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { likedIds, toggleLike } = useLikes();
  const navigate = useNavigate();

  const isLiked = likedIds.has(profile.id);

  return (
    <div className="relative group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg">
      
      {/* Profile image */}
      <div className="h-70 w-99 overflow-hidden lg:h-99 lg:w-full">
        <img
          src={profile.profilePicture ?? ''}
          alt={profile.fullName}
          className="h-70 w-99 object-cover transition-transform duration-300 group-hover:scale-105 lg:h-full lg:w-99 lg:group-hover:scale-108"
        />
      </div>

      {/* Liked badge */}
      {isLiked && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-md font-[inter] tracking-light leading-[100%]">
          <img src="/check.svg" alt="Liked" className="h-4 w-4" />
          <span className="text-sm font-semibold text-theme">Liked</span>
        </div>
      )}

      <div className="p-4">
        <button
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="text-left"
        >
          <h2 className="font-[fraunces] text-lg font-semibold text-[#1C1524]">
            {profile.fullName}
            {profile.age ? `, ${profile.age}` : ''}
          </h2>
        </button>

        {/* Location */}
        <p className="flex items-center gap-2 mb-3 text-sm text-[#655E75] font-[inter]">
          <img src="/Vector.png" className="size-3" />
          {profile.location}
        </p>

        {/* Bio */}
        <p className="mt-3 text-[15px] leading-5 text-[#655E75] font-[geist] line-clamp-2">
          {profile.about}
        </p>

        {/* Actions */}
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
