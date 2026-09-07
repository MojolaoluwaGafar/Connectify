import { useNavigate } from 'react-router-dom';
import type { DiscoverProfile } from '../types';
import { useLikes } from '../context/likeContext/useLikes';

interface Props {
  profiles: DiscoverProfile[];
}

export const ProfileCard = ({ profiles }: Props) => {
  const navigate = useNavigate();
  const { likedIds, toggleLike } = useLikes();
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 flex-col gap-4">
      {profiles.map((profile, i) => {
        return (
          <div
            key={i}
            className=" border border-stroke-primary text-sm rounded-2xl overflow-hidden
                "
          >
            <div className="w-full">
              <img
                src={profile.photoUrl || ''}
                alt={profile.fullName}
                className="object-cover"
              />
            </div>

             {/* Checkmark badge displayed when this profile is liked */}
      {likedIds.has(profile.id) && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-md font-[inter] tracking- leading-[100%]">
          <img src="/check.svg" alt="Liked" className="h-4 w-4" />

          <span className="text-sm font-semibold text-theme">Liked</span>
        </div>
      )}
            <div className="p-3 space-y-2 text-sm">
              <h2 className="font-fraunces text-black text-lg font-semibold">
                {profile.fullName}, {profile.age}
              </h2>

              
              <p className="flex items-center gap-2  font-[inter] ">
                <img src="/Vector.png" className="size-3" /> {profile.location}
              </p>
              <p className="mt-3 text-[15px] leading-5 text-[#655E75] font-[geist]">{profile.bio}</p>

              <div className="flex gap-2">
                <button
                  className="border border-stroke-primary px-3 py-1 text-xs rounded-lg font-medium text-black w-full"
                  onClick={() => navigate(`/profile/${profile.userId}`)}
                >
                  View Profile
                </button>
                <button
                  className={`flex items-center justify-center gap-2 border border-stroke-primary px-3 py-1 text-sm text-white rounded-lg font-medium w-full  ${
                    likedIds.has(profile.id)
                      ? 'bg-gray-900'
                      : 'bg-theme hover:bg-purple-700'
                  }`}
                  
                  onClick={() => toggleLike(profile)}
                  
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
                  {likedIds.has(profile.id) ? 'Liked' : 'Like'}
                </button>
                
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
