import * as api from '../services/authApi';
import { ProfileCard } from '../components/ProfileCard';
import FilterProfiles from '../components/FilterProfiles';
import EmptyProfile from '../components/EmptyProfile';
import { useEffect, useRef, useState } from 'react';
import type { DiscoverProfile } from '../types';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import Icon from "../assets/search.svg";
import { useAuth } from '../context/authContext/useAuth';
const PAGESIZE = 8;
const NEARBY_RADIUS_KM = 25;

const DiscoveryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'all' | 'new' | 'near-me'>('all');
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const fetchedLocation = useRef(false);


  useEffect(() => {
    if (fetchedLocation.current) return;

    fetchedLocation.current = true;

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setLocationError('Allow location access to find people near you.'),
    );
  }, []);

  useEffect(() => {
    if (tab === 'near-me' && !location) return;

    const getProfiles = async () => {
    
      try {
        const result = await api.getDiscoverProfiles({
          search: searchValue,
          tab,
          page,
          pageSize: PAGESIZE,
          excludeUserId: user?.id,
          ...(tab === 'near-me' && location
            ? { lat: location.lat, lng: location.lng, radius: NEARBY_RADIUS_KM }
            : {}),
        });

        setProfiles(result.items);
        setTotal(result.total);
      } catch {
        setProfiles([]);
        setTotal(0);
      }
    };

    getProfiles();
  }, [searchValue, tab, page, user?.id, location]);

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
      {tab === 'near-me' && locationError && (
        <p className="mt-2 text-sm text-red-600">{locationError}</p>
      )}
       

      <main className="flex lg:flex-row flex-col-reverse gap-10 mt-5 w-full">
        <div className="lg:w-3/4 space-y-4" >
         <div className="relative flex items-center gap-2 w-full">
          <img className='absolute top-3 left-3' src={Icon} alt="search icon" /> 
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

          { profiles.length > 0 ? (
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
