import { useState, useEffect } from 'react';
import type { DiscoverProfile } from '../types';
import { getWhoLikedMe } from '../API/Services/Likes/likes';
import { useAuth } from '../context/authContext/useAuth';
import { useLikes } from '../context/likeContext/useLikes';
import { useNavigate } from 'react-router-dom';

export const WhoLikedYou = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Re-included in the fetch below's dependencies — it changes in
  // realtime whenever someone matches with the user (see LikesProvider's
  // "new_match" socket listener), so this widget doesn't go stale while
  // sitting on the Discover page.
  const { likedMeIds } = useLikes();
  const [likedYou, setLikedYou] = useState<DiscoverProfile[]>([]);
  useEffect(() => {
    if (!user) return;

        const fetchWhoLikedMe = async()=>{
            try {
                const result = await getWhoLikedMe(user.id);
                setLikedYou(result.slice(0,3));

                // console.log("WHO LIKED ME RESULT", result);

            } catch (error) {
                console.error("FAILED TO GET WHO LIKED ME", error);

            }
        };
        fetchWhoLikedMe()
    }, [user, likedMeIds])

    if (likedYou.length === 0) {
        return null;
    }

  return (
    <div>
      {/* starts here  */}
      <div className="border rounded-2xl p-4 text-sm space-y-3 border-stroke-primary w-full">
        <div className="flex justify-between items-center">
          <h2 className="font-fraunces font-semibold font-600 text-[16px] text-black">
            Who liked you
          </h2>
          <button
            className="font-geist text-[#7C3AED] font-semibold text-[12px] font-600 cursor-pointer hover:border hover:border-gray-300 p-2 rounded-lg"
            onClick={() => navigate('/likes')}
          >
            See All
          </button>
        </div>
        {/* Who liked you heading */}
        {likedYou.map((profile) => (
          <div key={profile.id} className="flex gap-3 items-center font-geist">
            <img
              className="size-10 rounded-full object-cover"
              src={profile.profilePicture || '/profile-picture.png'}
              alt={profile.fullName}
            />

            <div className="grow">
              <h2 className="text-black text-md font-semibold font-600 text-[14px]">
                {profile.fullName.split(' ')[0]}, {profile.age}
              </h2>

              <p className="font-400 font-regular text-[12px]">
                {profile.location}
              </p>
            </div>

              <div>
                <button className="border border-stroke-primary px-3 py-1 text-sm rounded-lg font-semibold text-black text-[12px] font-600 hover:bg-gray-100" 
                onClick={()=> navigate(`/profile/${profile.userId}`)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}