// import { mockProfiles } from '../data/mockProfile';
import * as api from '../lib/mockApi';
import { ProfileCard } from '../components/ProfileCard';
import FilterProfiles from '../components/FilterProfiles';
import EmptyProfile from '../components/EmptyProfile';
import { useEffect, useState } from 'react';
import type { DiscoverProfile } from '../types';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

const PAGESIZE = 8;

const DiscoveryPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'new' | 'near-me'>('all');
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);

  useEffect(() => {
    const getProfiles = async () => {
      const result = await api.getDiscoverProfiles({
        search: searchValue,
        tab,
        page,
        pageSize: PAGESIZE,
        excludeUserId: '',
      });

      console.log(result);

      setProfiles(result.items);
    };

    getProfiles();
  }, [searchValue, tab, page]);

  const total = 20;

  const totalPages = Math.ceil(total / PAGESIZE);

  // const result = await api.getDiscoverProfiles({
  //   search: searchValue,
  //   tab: tab,
  //   page: page,
  //   pageSize: 8,
  //   excludeUserId: '',
  // });

  return (
    <div className="w-10/12 mx-auto container py-10 text-text-primary">
      <h1 className="font-fraunces font-semibold text-2xl text-black">
        Discover People
      </h1>
      <p>Find people who share your interests</p>

      <main className="flex lg:flex-row flex-col-reverse gap-10 mt-5 w-full">
        <div className="lg:w-3/4 space-y-4">
          <input
            type="text"
            name="search"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
            placeholder="Search by name or interests..."
            className="outline-0 border border-stroke-primary placeholder:text-text-primary rounded-xl py-1.5 px-3 w-full lg:w-3/5"
          ></input>

          {profiles.length > 0 ? (
            <ProfileCard profiles={profiles} />
          ) : (
            <EmptyProfile />
          )}
        </div>
        <div className="space-y-6 lg:w-1/4">
          <FilterProfiles setTab={setTab} tab={tab} setPage={setPage} />
          <div className="border rounded-2xl p-4 text-sm space-y-3">
            <div className="flex justify-between ">
              <h2 className="font-fraunces font-semibold text-black">
                Who liked you
              </h2>
              <p>See All</p>
            </div>

            <div className="flex gap-3 items-center">
              <img className="size-10" src="/Avatar.png"></img>
              <div className="grow">
                <h2 className="text-black text-md">Sarah, 26</h2>
                <p>London, UK</p>
              </div>
              <div>
                <button className="border border-stroke-primary px-3 py-1 text-sm rounded-lg font-medium text-black">
                  View
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-theme text-white text-sm flex flex-col gap-2 rounded-2xl">
            <div className="p-3 bg-theme-shade rounded-full size-fit flex items-center justify-center">
              <img src="/camera.svg" />
            </div>
            <h2 className="font-fraunces text-lg font-semibold">
              Complete your profile
            </h2>
            <p>
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
        </div>
      </main>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default DiscoveryPage;
