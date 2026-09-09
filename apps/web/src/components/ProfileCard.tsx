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
    <div className="grid lg:grid-cols-3 md:grid-cols-2 flex-col gap-4 ">
      {profiles.map((profile, i) => {
        return (
          <div
            key={i}
            className=" border border-stroke-primary text-sm rounded-2xl overflow-hidden relative"
          >
            <div className="w-full bg-gray-100 h-64 flex justify-center items-center">
              <img
                src={profile.profilePicture || '/profile-picture.png'}
                alt={profile.fullName}
                className={`object-cover ${profile.profilePicture ? '' : 'size-32'}`}
              />
            </div>
            <div className="p-3 space-y-2 text-sm h-45">
              <h2 className="font-fraunces text-black text-lg font-semibold">
                {profile.fullName}, {profile.age}
              </h2>
              <p className="flex items-center gap-2  font-[inter] ">
                <img src="/Vector.png" className="size-3" /> {profile.location}
              </p>
              <p className="mt-3 text-[15px] leading-5 text-[#655E75] font-[geist]">
                {profile.about}
              </p>

              <div className="flex gap-2 justify-between w-full px-3  absolute left-0 bottom-2">
                <button
                  className="border border-stroke-primary px-3 py-1 text-xs rounded-lg font-medium text-black w-full font-inter"
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
