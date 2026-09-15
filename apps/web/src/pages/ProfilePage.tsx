import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Heart, MessageCircle } from "lucide-react";

import type { DiscoverProfile } from "../types/index";
import * as api from "../services/authApi";

import { useAuthGate } from "../context/authContext/useAuthGate";
import Chip from "../components/ui/Chip";
import Button from "../components/ui/Button";
import ProfileCard from "../components/ui/ProfileCard";
import { useAuth } from "../context/authContext/useAuth";
import { useLikes } from "../context/likeContext/useLikes";

export default function ViewProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { likedIds, toggleLike } = useLikes();
  const { requireAuth } = useAuthGate();

  const [target, setTarget] = useState<DiscoverProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const [suggestions, setSuggestions] = useState<DiscoverProfile[]>([]);

  const [canMessage, setCanMessage] = useState(false);

  function sharedCount(a: DiscoverProfile, b: DiscoverProfile) {
    return a.interests.filter((interest) => b.interests.includes(interest))
      .length;
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getProfileById(id).then(async (profile) => {
      setTarget(profile);
      setLoading(false);

      setLoading(false);
      if (profile) {
        const res = await api.getDiscoverProfiles({
          excludeUserId: user?.id,
          pageSize: 3,
        });

        setSuggestions(
          res.items
            .filter((person) => person.id !== profile.id)
            .sort((a, b) => sharedCount(b, profile) - sharedCount(a, profile))
            .slice(0, 3),
        );

        if (user) {
          setCanMessage(await api.canMessage(user.id, profile.id));
        }
      }
    });
  }, [id, user]);

  useEffect(() => {
    if (user && target) {
      api.canMessage(user.id, target.id).then(setCanMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedIds]);

  if (loading)
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
      </div>
    );

  if (!target && !loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-display text-xl font-semibold text-ink-900">
          Profile not found
        </p>

        <Link
          to="/home"
          className="mt-3 inline-block text-sm font-semibold text-theme hover:underline"
        >
          Back to Discover
        </Link>
      </div>
    );
  }
  if (!target) return null;

  const isLiked = likedIds.has(target.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-theme"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Main profile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile image */}
        <div className="overflow-hidden rounded-3xl border border-stroke-primary shadow-sm">
          <img
            src={target?.profilePicture ?? ""}
            alt={target?.fullName}
            className="aspect-4/5 w-full object-cover"
          />
        </div>

        {/* Profile information */}
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-theme">
            Profile
          </p>

          <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            {target?.fullName}
            {target?.age ? `, ${target.age}` : ""}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-ink-500">
            <MapPin size={15} />
            {target?.location}
          </p>

          {/* Occupation */}
          {target?.occupation && (
            <div className="mt-6 rounded-2xl bg-theme-shade/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-theme">
                Works as
              </p>

              <p className="mt-1 font-medium text-ink-900">
                {target.occupation}
              </p>
            </div>
          )}

          {/* Interests */}
          {target?.interests?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-theme">
                Interests
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {target?.interests.map((interest) => (
                  <Chip key={interest} label={interest} as="span" />
                ))}
              </div>
            </div>
          )}

          {/* About */}
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-theme">
              About me
            </p>

            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              {target?.about}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant={isLiked ? "secondary" : "primary"}
              icon={
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              }
              className={
                isLiked
                  ? "bg-theme-shade/20! text-theme!"
                  : "bg-theme! hover:bg-theme-shade!"
              }
              onClick={() => requireAuth(() => toggleLike(target))}
            >
              {isLiked ? "Liked" : "Like profile"}
            </Button>

            {canMessage ? (
              <Button
                variant="outline"
                icon={<MessageCircle size={16} />}
                className="border-stroke-primary! text-theme! hover:bg-theme-shade/20!"
                onClick={() =>
                  navigate("/messages", {
                    state: {
                      openProfileId: target?.id,
                    },
                  })
                }
              >
                Send message
              </Button>
            ) : (
              <p className="text-sm text-ink-500">
                Like their profile to start a conversation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-theme">
              Keep exploring
            </p>

            <h2 className="mt-1 font-display text-2xl font-semibold text-ink-900">
              People you may also like
            </h2>

            <p className="mt-1 text-sm text-ink-500">
              These people share some of your interests.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {suggestions.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isLiked={likedIds.has(profile.id)}
                onLike={(person) => requireAuth(() => toggleLike(person))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// import { useEffect, useState } from 'react';
// import { useNavigate, useParams, Link } from 'react-router-dom';
// import { ArrowLeft, MapPin, Heart, MessageCircle } from 'lucide-react';

// import type { DiscoverProfile } from '../types';

// import { useAuth } from '../context/authContext/useAuth';
// import { useLikes } from '../context/likeContext/LikeContext';
// import Chip from '../components/ui/Chip';
// import Button from '../components/ui/Button';
// import ProfileCard from '../components/ui/ProfileCard';
// import { useAuthGate } from '../context/authContext/useAuthGate';

// export default function ViewProfilePage() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const { user } = useAuth();
//   const { likedIds, toggleLike } = useLikes();
//   const { requireAuth } = useAuthGate();

//   const [target, setTarget] = useState<DiscoverProfile | null>(null);

//   const [suggestions, setSuggestions] = useState<DiscoverProfile[]>([]);

//   const [canMessage, setCanMessage] = useState(false);

//   useEffect(() => {
//     if (!id) return;

//     api.getProfileById(id).then(async (profile) => {
//       setTarget(profile);

//       if (profile) {
//         const res = await api.getDiscoverProfiles({
//           excludeUserId: user?.id,
//           pageSize: 3,
//         });

//         setSuggestions(
//           res.items
//             .filter((person) => person.id !== profile.id)
//             .sort((a, b) => sharedCount(b, profile) - sharedCount(a, profile))
//             .slice(0, 3),
//         );

//         if (user) {
//           setCanMessage(await api.canMessage(user.id, profile.id));
//         }
//       }
//     });
//   }, [id, user]);

//   useEffect(() => {
//     if (user && target) {
//       api.canMessage(user.id, target.id).then(setCanMessage);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [likedIds]);

//   function sharedCount(a: DiscoverProfile, b: DiscoverProfile) {
//     return a.interests.filter((interest) => b.interests.includes(interest))
//       .length;
//   }

//   if (!target) {
//     return (
//       <div className="mx-auto max-w-lg px-4 py-20 text-center">
//         <p className="font-display text-xl font-semibold text-[#1c1524]">
//           Profile not found
//         </p>

//         <Link
//           to="/discover"
//           className="mt-3 inline-block text-sm font-semibold text-theme hover:underline"
//         >
//           Back to Discover
//         </Link>
//       </div>
//     );
//   }

//   const isLiked = likedIds.has(target.id);

//   return (
//     <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
//       {/* Back button */}
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center gap-1.5 text-sm font-medium text-text-primary transition-colors hover:text-theme"
//       >
//         <ArrowLeft size={16} />
//         Back
//       </button>

//       {/* Main profile */}
//       <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
//         {/* Profile image */}
//         <div
//           className="overflow-hidden rounded-3xl border bg-[#f5f3ff] shadow-sm"
//           style={{ borderColor: '#ddd6fe' }}
//         >
//           <img
//             src={target.profilePicture ?? ''}
//             alt={target.fullName}
//             className="aspect-4/5 w-full object-cover"
//           />
//         </div>

//         {/* Profile information */}
//         <div className="flex flex-col justify-center">
//           <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-theme">
//             Profile
//           </p>

//           <h1 className="font-display text-3xl font-semibold text-[#1c1524] sm:text-4xl">
//             {target.fullName}
//             {target.age ? `, ${target.age}` : ''}
//           </h1>

//           <p className="mt-2 flex items-center gap-1.5 text-text-primary">
//             <MapPin size={15} />
//             {target.location}
//           </p>

//           {/* Occupation */}
//           {target.occupation && (
//             <div className="mt-6 rounded-2xl bg-[#f5f3ff] p-4">
//               <p className="text-xs font-semibold uppercase tracking-wide text-theme">
//                 Works as
//               </p>

//               <p className="mt-1 font-medium text-[#1c1524]">
//                 {target.occupation}
//               </p>
//             </div>
//           )}

//           {/* Interests */}
//           {target.interests.length > 0 && (
//             <div className="mt-6">
//               <p className="text-xs font-semibold uppercase tracking-wide text-theme">
//                 Interests
//               </p>

//               <div className="mt-3 flex flex-wrap gap-2">
//                 {target.interests.map((interest) => (
//                   <Chip key={interest} label={interest} as="span" />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* About */}
//           <div className="mt-6">
//             <p className="text-xs font-semibold uppercase tracking-wide text-theme">
//               About me
//             </p>

//             <p className="mt-2 text-sm leading-relaxed text-[#3f3550]">
//               {target.about}
//             </p>
//           </div>

//           {/* Actions */}
//           <div className="mt-8 flex flex-wrap items-center gap-3">
//             <Button
//               variant={isLiked ? 'secondary' : 'primary'}
//               icon={
//                 <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
//               }
//               className={
//                 isLiked
//                   ? 'bg-[#ede9fe]! text-[#6d28d9]!'
//                   : 'bg-theme! hover:bg-[#6d28d9]!'
//               }
//               onClick={() => requireAuth(() => toggleLike(target))}
//             >
//               {isLiked ? 'Liked' : 'Like profile'}
//             </Button>

//             {canMessage ? (
//               <Button
//                 variant="outline"
//                 icon={<MessageCircle size={16} />}
//                 className="border-[#ddd6fe]! text-theme! hover:bg-[#f5f3ff]!"
//                 onClick={() =>
//                   navigate('/messages', {
//                     state: {
//                       openProfileId: target.id,
//                     },
//                   })
//                 }
//               >
//                 Send message
//               </Button>
//             ) : (
//               <p className="text-sm text-text-primary">
//                 Like their profile to start a conversation.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Suggestions */}
//       {suggestions.length > 0 && (
//         <div className="mt-16">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-wider text-theme">
//               Keep exploring
//             </p>

//             <h2 className="mt-1 font-display text-2xl font-semibold text-[#1c1524]">
//               People you may also like
//             </h2>

//             <p className="mt-1 text-sm text-[#6b6178]">
//               These people share some of your interests.
//             </p>
//           </div>

//           <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
//             {suggestions.map((profile) => (
//               <ProfileCard
//                 key={profile.id}
//                 profile={profile}
//                 isLiked={likedIds.has(profile.id)}
//                 onLike={(person) => requireAuth(() => toggleLike(person))}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
