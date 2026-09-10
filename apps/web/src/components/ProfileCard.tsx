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
  className="group relative overflow-hidden rounded-2xl border border-stroke-primary text-sm shadow-sm transition-all duration-300 hover:shadow-lg"
>
  {/* IMAGE */}
  <div className="flex h-64 w-full items-center justify-center overflow-hidden bg-gray-100">
    <img
      src={profile.profilePicture || '/profile-picture.png'}
      alt={profile.fullName}
      className={`h-full w-full object-cover transition-transform duration-500cd conne group-hover:scale-105 ${
        profile.profilePicture
          ? ''
          : 'size-32 w-auto h-auto object-contain'
      }`}
    />
  </div>

  {/* TEXT */}
  <div className="relative h-45 space-y-2 p-3 text-sm transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
    <h2 className="truncate font-fraunces text-lg font-semibold text-black">
      {profile.fullName}, {profile.age}
    </h2>

    <p className="flex items-center gap-2 truncate font-[inter]">
      <img src="/Vector.png" className="size-3 shrink-0" />
      {profile.location}
    </p>

    <p className="mt-3 line-clamp-2 font-[geist] text-[15px] leading-5 text-[#655E75]">
      {profile.about}
    </p>

    <div className="absolute bottom-2 left-0 flex w-full justify-between gap-2 px-3">
      <button
        className="w-full rounded-lg border border-stroke-primary px-3 py-1 text-xs font-inter font-medium text-black"
        onClick={() => navigate(`/profile/${profile.userId}`)}
      >
        View Profile
      </button>

      <button
        className={`flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-primary px-3 py-1 text-sm font-medium text-white ${
          likedIds.has(profile.id)
            ? 'bg-gray-900'
            : 'bg-theme hover:bg-purple-700'
        }`}
        onClick={() => toggleLike(profile)}
      >
        <img
          className="size-4"
          src={
            likedIds.has(profile.id)
              ? '/vector.svg'
              : '/icon-heart.svg'
          }
          alt=""
        />

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