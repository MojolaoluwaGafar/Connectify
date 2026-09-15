import { ProfileCard } from '../components/ProfileCard';
import FilterProfiles from '../components/FilterProfiles';
import EmptyProfile from '../components/EmptyProfile';
import { useState } from 'react';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import Icon from '../assets/search.svg';
import { useAuth } from '../context/authContext/useAuth';
import { useProfile } from '../hooks/Profile/useProfile';

const PAGESIZE = 8;

const DiscoveryPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<'all' | 'new' | 'near-me'>('all');
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  const { data, loading: isLoading, error: queryError } = useProfile({
    search: searchValue,
    tab,
    page,
    pageSize: PAGESIZE,
    excludeUserId: user?.id,
  });
  const profiles = data?.items ?? [];
  const total = data?.total ?? 0;
  const discoveryError = queryError
    ? tab === 'near-me'
      ? 'Set your location in your profile to see nearby matches.'
      : 'Could not load profiles. Please try again.'
    : '';

  const totalPages = Math.ceil(total / PAGESIZE);
  const showCompleteProfileCard =
    !profile ||
    !profile.isComplete ||
    !profile.profilePicture ||
    !profile.occupation?.trim();

  return (
    <div className='container flex items-center mx-auto'>
      <div className="p-4 sm:p-6 md:px-12 md:py-8 lg:px-20 lg:py-10 xl:px-24 2xl:px-32 flex flex-col gap-8 lg:gap-2 text-[#655E75]">
      <h1 className="font-fraunces font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
        Discover People
      </h1>
      <p>Find people who share your interests</p>
      {tab === 'near-me' && discoveryError && (
        <p className="mt-2 text-sm text-red-600">{discoveryError}</p>
      )}

      <main className="flex lg:flex-row flex-col gap-10 mt-5 w-full">
        <div className="lg:w-3/4 space-y-4">
          <FilterProfiles
            className="lg:hidden"
            setTab={setTab}
            tab={tab}
            setPage={setPage}
          />
          <div className="relative flex items-center gap-2 w-full">
            <img
              className="absolute top-3 left-3"
              src={Icon}
              alt="search icon"
            />
            <input
              type="text"
              name="search"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              placeholder="Search by name or interests..."
              className="  mb-4 outline-0 border border-stroke-primary placeholder:text-text-primary rounded-[100px] font-giest py-1.5 px-9 w-full lg:w-3/5 leading-[100%] tracking-normal font-normal "
            />
          </div>

          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center text-center border border-[#655e756e] border-dashed my-2 rounded-2xl min-h-96 space-y-4 p-5 sm:p-10 md:p-16 lg:p-20 w-full max-w-7xl mx-auto">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
            </div>
          ) : profiles.length > 0 ? (
            <ProfileCard profiles={profiles} />
          ) : (
            <EmptyProfile />
          )}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
        <div className="space-y-9 lg:w-1/4 ">
          <FilterProfiles
            className="hidden lg:flex"
            setTab={setTab}
            tab={tab}
            setPage={setPage}
          />
          <div className="border rounded-2xl p-4 text-sm space-y-3 border-stroke-primary">
            <div className="flex justify-between ">
              <h2 className="font-fraunces font-semibold font-600 text-[16px] text-black">
                Who liked you
              </h2>
              <p className="font-geist text-[#7C3AED] font-semibold text-[12px] font-600">
                See All
              </p>
            </div>

            {/* <div className="flex gap-3 items-center font-geist">
              <img className="size-10" src="/Avatar.png"></img>
              <div className="grow">
                <h2 className="text-black text-md font-semibold font-600 text-[14px]">
                  Sarah, 26
                </h2>
                <p className="font-400 font-regular text-[12px]">London, UK</p>
              </div>
              <div>
                <button className="border border-stroke-primary px-3 py-1 text-sm rounded-lg font-semibold text-black text-[12px] font-600">
                  View
                </button>
              </div>
            </div>
            <div className="flex gap-3 items-center font-geist">
              <img className="size-10" src="/Avatar.svg"></img>
              <div className="grow">
                <h2 className="text-black text-md font-semibold font-600 text-[14px]">
                  Sarah, 26
                </h2>
                <p className="font-400 font-regular text-[12px]">
                  Lagos, Nigeria
                </p>
              </div>
              <div>
                <button className="border border-stroke-primary px-3 py-1 text-sm rounded-lg font-semibold text-[12px] font-600 text-black">
                  View
                </button>
              </div>
            </div>
            <div className="flex gap-3 items-center font-geist">
              <img className="size-10" src="/Avatar (1).svg"></img>
              <div className="grow">
                <h2 className="text-black text-md font-semibold font-600 text-[14px]">
                  Theresa, 53
                </h2>
                <p className="font-400 font-regular text-[12px]">
                  Berlin, Germany
                </p>
              </div>
              <div>
                <button className="border border-stroke-primary px-3 py-1 text-sm rounded-lg font-semibold text-[12px] font-600 text-black">
                  View
                </button>
              </div>
            </div> */}

            
          </div>

          {showCompleteProfileCard && (
            <div className="p-4 bg-theme text-white text-sm flex flex-col gap-2 rounded-2xl">
              <div className="p-3 bg-theme-shade rounded-full size-fit flex items-center justify-center">
                <img src="/sparkles (1).svg" />
              </div>
              <h2 className="font-fraunces text-lg font-semibold leading-[100%]">
                Complete your profile
              </h2>
              <p className="font-geist text-[12px] font-light leading-[18px]">
                Find out who matches you by going to settings. Profiles with
                photos get 3x more matches!
              </p>
              <button
                className="bg-white text-theme rounded-md py-1.5 font-semibold"
                onClick={() => navigate('/profile/edit')}
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
    </div>
  );
};

export default DiscoveryPage;
