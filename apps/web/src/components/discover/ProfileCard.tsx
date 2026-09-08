import { useNavigate } from 'react-router-dom';

import type { DiscoverProfile } from '../../types';
import { useLikes } from '../../context/likeContext/useLikes';

interface ProfileCardProps {
  profile: DiscoverProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Get the liked profiles and like/unlike function
  const { likedIds, toggleLike } = useLikes();
  console.log('CURRENT LIKED IDS:', likedIds);

  const navigate = useNavigate();

  return (
    // Main profile card
    <div className=" relative group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg">
      {/* Profile image area */}
      <div className="h-99 w-full overflow-hidden">
        {/* Profile image */}
        <img
          src={profile.profilePicture ?? ''}
          alt={profile.fullName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      {/* Checkmark badge displayed when this profile is liked */}
      {likedIds.has(profile.id) && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-md font-[inter] tracking- leading-[100%]">
          <img src="/check.svg" alt="Liked" className="h-4 w-4" />

          <span className="text-sm font-semibold text-theme">Liked</span>
        </div>
      )}

      {/* Profile information */}
      <div className="p-4">
        {/* Name and age */}
        <h2 className="text-lg font-semibold text-[#1C1524] font-[fraunces]">
          {profile.fullName}, {profile.age}
        </h2>

        {/* Location */}
        <p className=" flex items-center gap-2 mb-3 text-sm text-[#655E75] font-[inter]" >  <img src="/Vector.png" className="size-3" />{profile.location}</p>
        
        {/* about */}
        <p className="mt-3 text-[15px] leading-5 text-[#655E75] font-[geist]">{profile.about}</p>

        {/* Profile actions */}
        <div className="mt-4 flex gap-2">
          {/* View profile button */}
          <button
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-[#1C1524]  hover:bg-gray-100"
            onClick={() => navigate(`/profile/${profile.id}`)}
          >
            View Profile
          </button>

          {/* Like / Unlike button */}
          <button
            onClick={() => {
              console.log('LIKE CLICKED:', profile.fullName, profile.id);
              toggleLike(profile);
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white flex gap-1 items-center justify-center ${
              likedIds.has(profile.id)
                ? 'bg-gray-900'
                : 'bg-theme hover:bg-purple-700'
            }`}
          >
            <div className="w-fit">
              <img
                className="size-4"
                src={
                  likedIds.has(profile.id) ? '/vector.svg' : '/icon-heart.svg'
                }
                alt=""
              />
            </div>

            <span>{likedIds.has(profile.id) ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
