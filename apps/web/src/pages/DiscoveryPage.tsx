import { useCallback, useState } from 'react';
import * as api from '../services/authApi';
import { ProfileCard } from '../components/ProfileCard';
import FilterProfiles from '../components/FilterProfiles';
import EmptyProfile from '../components/EmptyProfile';
import type { DiscoverProfile } from '../types';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext/useAuth';
import { useApiQuery } from '../hooks/useApiQuery';
import { WhoLikedYou } from '../components/LikedYou';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const PAGESIZE = 8;

const DiscoveryPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<"all" | "new" | "near-me">("all");
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [discoveryError, setDiscoveryError] = useState('');

  // Recreated whenever the actual query params change, so useApiQuery's
  // internal fetchData always calls the API with fresh args, and so
  // cacheKey (below) and this closure stay in sync.
  const request = useCallback(
    () =>
      api.getDiscoverProfiles({
        search: searchValue,
        tab,
        page,
        pageSize: PAGESIZE,
        excludeUserId: user?.id,
      }),
    [searchValue, tab, page, user?.id],
  );

  // One cache entry per distinct combination of filters — switching back
  // to a tab/page/search you've already loaded shows cached results
  // instantly instead of refetching and flashing a spinner.
  const cacheKey = `discover:${tab}:${page}:${searchValue}:${user?.id ?? 'anon'}`;

  const {
    data,
    loading: isLoading,
    isRefetching,
  } = useApiQuery(request, 'Could not load profiles. Please try again.', {
    cacheKey,
    staleTime: 30_000,
    onSuccess: () => setDiscoveryError(''),
    onError: () => {
      setDiscoveryError(
        tab === 'near-me'
          ? 'Set your location in your profile to see nearby matches.'
          : 'Could not load profiles. Please try again.',
      );
    },
  });

  const profiles: DiscoverProfile[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGESIZE);

  const showCompleteProfileCard =
    !profile ||
    !profile.isComplete ||
    !profile.profilePicture ||
    !profile.occupation?.trim();

  return (
    <div className='container flex items-center mx-auto w-full'>
      <div className="p-4 sm:p-6 md:px-12 md:py-8 lg:px-20 lg:py-10 xl:px-24 2xl:px-32 flex flex-col gap-8 lg:gap-2 text-[#655E75]">
      <div>
        <h1 className="font-fraunces font-bold text-[24px] sm:text-[26px] md:text-[28px] text-black">
        Discover People
      </h1>
      <p>Find people who share your interests</p>
      </div>
      {tab === "near-me" && discoveryError && (
        <p className="mt-2 text-sm text-red-600">{discoveryError}</p>
      )}
      <main className="flex lg:flex-row flex-col gap-10 lg:mt-5 w-full">
        <div className=" space-y-4">
          <FilterProfiles
            className="lg:hidden"
            setTab={setTab}
            tab={tab}
            setPage={setPage}
          />

          <div className="border-solid  w-full lg:w-3/5 border-[#1c1524]/[0.0784] border rounded-3xl gap-2 flex items-center px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent mx-4 md:mx-0">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-gray-500"
            />

            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              type="text"
              placeholder="Search by name or interests..."
              className="w-full text-sm outline-none focus:outline focus:ring-0"
            />
          </div>

          {isLoading || isRefetching ? (
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
        <div className="space-y-9">
          <FilterProfiles
            className="hidden lg:flex"
            setTab={setTab}
            tab={tab}
            setPage={setPage}
          />
         <div className="lg:w-3/4">
           <WhoLikedYou />
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
                onClick={() => navigate("/profile/edit")}
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
