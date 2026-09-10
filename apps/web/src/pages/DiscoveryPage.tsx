import * as api from '../lib/mockApi';
import FilterProfiles from '../components/FilterProfiles';
import EmptyProfile from '../components/EmptyProfile';
import Pagination from '../components/Pagination';
import ProfileCard from '../components/discover/ProfileCard';
import { useEffect, useState } from 'react';
import type { DiscoverProfile } from '../types';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 8;

const DiscoveryPage = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<'all' | 'new' | 'near-me'>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);

  useEffect(() => {
    const loadProfiles = async () => {
      const result = await api.getDiscoverProfiles({
        search,
        tab,
        page,
        pageSize: PAGE_SIZE,
        excludeUserId: '',
      });

      setProfiles(result.items);
    };

    loadProfiles();
  }, [search, tab, page]);

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  const total = 20;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-fraunces text-3xl font-semibold text-black">
        Discover people
      </h1>

      <p className="mt-1 text-text-primary">
        Find people who share your interests
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-primary"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or interest..."
            className="w-full rounded-xl border border-stroke-primary bg-white py-2.5 pl-10 pr-4 text-sm focus:border-theme focus:outline-none focus:ring-2 focus:ring-theme/40"
          />
        </div>

        <FilterProfiles
          tab={tab}
          setTab={setTab}
          setPage={setPage}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="order-first space-y-5 lg:order-last lg:col-span-1">
          {/* Who liked you */}
          <div className="border rounded-2xl p-4 text-sm space-y-3">
            <div className="flex justify-between">
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

          {/* Complete your profile */}
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
        </aside>

        <div className="lg:col-span-3">
          {profiles.length === 0 ? (
            <EmptyProfile />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPage;