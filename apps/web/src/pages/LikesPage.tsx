import { useEffect, useState } from 'react';
import type { DiscoverProfile } from '../types';

import ProfileCard from '../components/discover/ProfileCard';
import {useNavigate} from 'react-router-dom'
import { useLikes } from '../context/likeContext/useLikes';

import { getLikedByMe, getWhoLikedMe } from '../services/authApi';

import { useAuth } from '../context/authContext/useAuth';


type Tab = 'liked-you' | 'you-liked';

const LikesPage = () => {
  const navigate = useNavigate()
  // static 
  // const [tab, setTab] = useState<Tab>('liked-you');
   const [tab, setTab] = useState<Tab>("liked-you");

  // These 5 profiles are only being used to keep
  // the "Liked You (5)" layout populated for now.


  // for the old static profile 
  // const [likedYou] = useState<DiscoverProfile[]>(mockProfiles.slice(0, 5));
  const [likedYou, setLikedYou] = useState<DiscoverProfile[]>([]);


  // These are the people YOU have actually liked.
  const [youLiked, setYouLiked] = useState<DiscoverProfile[]>([]);

  // Get the shared like state from LikesContent.
  const { likedIds } = useLikes();

  // ==========================================================
  // LOAD PEOPLE WE HAVE LIKED
  // ==========================================================
  // useEffect(() => {
  //   const profiles = mockProfiles.filter((profile) => likedIds.has(profile.id));

  //   setYouLiked(profiles);
  // }, [likedIds]);

  const {user} = useAuth()

  useEffect(() => {
    if (!user)
      return;

      const fetchLikes = async () => {
        try {
          const response = await getLikedByMe(user.id);
          const likedYouResponse = await getWhoLikedMe(user.id)

          console.log("LIKED BY ME:", response);
          console.log("LIKE ME", likedYouResponse);
          

          setYouLiked(response)
          setLikedYou(likedYouResponse)

        } catch (error) {
          console.error("FAILED TO GET LIKES:", error);
        }
      };

    fetchLikes();
  }, [user]);

  useEffect(()=>{
    setYouLiked((prev)=> prev.filter((profile)=> likedIds.has(profile.id)));
  }, [likedIds])

  // Decide which profiles to display.
  const list = tab === 'liked-you' ? likedYou : youLiked;

  return (
    <div className="min-h-screen ">
      {/* MAIN */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8cd">
        {/* TITLE + TABS */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold font-fraunces tracking-normal leading-[100%] text-[#1C1524] md:text-3xl text-[16px]">
              {tab === 'liked-you'
                ? 'People who liked you'
                : 'People you liked'}
            </h1>

            <p className="mt-2  font-[inter]  tracking-normal leading-[100%] font-normal text-[16px] text-[#655E75]  ">
              {tab === 'liked-you'
                ? 'These people are interested in connecting with you.'
                : "Profiles you've shown interest in."}
            </p>
          </div>

          {/* TABS */}
          <div className="flex w-full gap-2 rounded-full bg-[#EEF2F6] p-1 lg:w-fit">
            {/* STATIC LIKED YOU */}
            <button
              onClick={() => setTab('liked-you')}
              className={`rounded-full px-4 w-1/2 py-2 font-[inter] text-sm font-semibold transition lg:w-fit ${
                tab === 'liked-you'
                  ? 'bg-white text-theme shadow-sm'
                  : 'text-[#655E75]'
              }`}
            >
              Liked You ({likedYou.length})
            </button>

            {/* DYNAMIC YOU LIKED */}
            <button
              onClick={() => setTab('you-liked')}
              className={`rounded-full px-4 w-1/2 py-2 font-[inter] text-sm font-semibold transition lg:w-fit ${
                tab === 'you-liked'
                  ? 'bg-white text-theme shadow-sm'
                  : 'text-[#655E75]'
              }`}
            >
              You Liked ({youLiked.length})
            </button>
          </div>
        </div>

        {/* PROFILE AREA */}
        <div className="mt-8  ">
          {list.length === 0 ? (
            /* EMPTY STATE */
            <div className="min-h-96 rounded-2xl border border-dashed border-gray-300  flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-theme ">
                <img src="/icon-heart.svg" alt="" />
              </div>

              <h2 className="text-xl font-semibold text-[#1C1524] font-fraunces tracking-normal leading-[100%]">
                You haven't liked anyone yet
              </h2>

              <p className="mt-4 max-w-md text-sm text-[#655E75] font-geist tracking-normal leading-[100%]">
                Head to Discover and like a few profiles that catch your eye.
              </p>
              <button className="border border-[#655e7579] px-5 py-2 font-geist rounded-xl text-sm text-black font-semibold hover:bg-gray-100 mt-7" onClick={()=>navigate("/home")}>
                Discover People 
              </button>
            </div>
          ) : (
            /* PROFILE CARDS */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LikesPage;
