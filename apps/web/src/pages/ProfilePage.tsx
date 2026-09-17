import { useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, MessageCircle } from 'lucide-react';

import type { DiscoverProfile } from '../types/index';
import {
  getDiscoverProfiles,
  getProfileById,
} from '../API/Services/Profile/Profile';

import { useAuthGate } from '../context/authContext/useAuthGate';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';
import ProfileCard from '../components/ui/ProfileCard';
import { useAuth } from '../context/authContext/useAuth';
import { useLikes } from '../context/likeContext/useLikes';
import { useApiQuery } from '../hooks/useApiQuery';

function sharedCount(a: DiscoverProfile, b: DiscoverProfile) {
  const aInterests = a.interests ?? a.interest ?? [];
  const bInterests = b.interests ?? b.interest ?? [];

  return aInterests.filter((interest) => bInterests.includes(interest))
    .length;
}

export default function ViewProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { likedIds, isMatch, toggleLike } = useLikes();

  const { requireAuth } = useAuthGate();

  // --- Target profile ---
  const fetchProfile = useCallback(() => getProfileById(id!), [id]);

  const { data: target, loading: isProfileLoading } = useApiQuery(
    fetchProfile,
    'Could not load this profile.',
    {
      enabled: Boolean(id),
      cacheKey: id ? `profile:${id}` : null,
      staleTime: 30_000,
    },
  );

  // --- Suggestions ---
  const userId = user?.id;

  const fetchSuggestions = useCallback(async () => {
    if (!target) return [];

    const res = await getDiscoverProfiles({
      excludeUserId: userId,
      pageSize: 3,
    });

    return res.items
      .filter((person) => person.id !== target.id)
      .sort((a, b) => sharedCount(b, target) - sharedCount(a, target))
      .slice(0, 3);
  }, [target, userId]);

  const { data: suggestionsData } = useApiQuery(
    fetchSuggestions,
    'Could not load suggestions.',
    {
      enabled: Boolean(target),
      cacheKey: target
        ? `suggestions:${target.id}:${userId ?? 'anon'}`
        : null,
      staleTime: 60_000,
    },
  );

  const suggestions = suggestionsData ?? [];

  if (isProfileLoading && !target) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-theme" />
      </div>
    );
  }

  if (!target) {
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

  const isLiked = likedIds.has(target?.userId);
  const isMatchedWithTarget = isMatch(target?.userId);

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
        <div className="overflow-hidden rounded-3xl border border-stroke-primary shadow-sm bg-gray-100">
          <img
            src={target.profilePicture ?? '/profile-picture.png'}
            alt={target.fullName}
            className="aspect-4/5 w-full object-cover"
          />
        </div>

        {/* Profile information */}
        <div className="flex flex-col justify-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-theme">
            Profile
          </p>

          <h1 className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            {target.fullName}
            {target.age ? `, ${target.age}` : ''}
          </h1>

          <p className="mt-2 flex items-center gap-1.5 text-ink-500">
            <MapPin size={15} />
            {target.location}
          </p>

          {/* Occupation */}
          {target.occupation && (
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
          {target.interests?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-theme">
                Interests
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {target.interests.map((interest) => (
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
              {target.about}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant={isLiked ? 'secondary' : 'primary'}
              icon={
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              }
              className={
                isLiked
                  ? 'bg-theme-shade/20! text-theme!'
                  : 'bg-theme! hover:bg-theme-shade!'
              }
              onClick={() => requireAuth(() => toggleLike(target))}
            >
              {isLiked ? 'Liked' : 'Like profile'}
            </Button>

            {isMatchedWithTarget ? (
              <Button
                variant="outline"
                icon={<MessageCircle size={16} />}
                className="border-stroke-primary! text-theme! hover:bg-theme-shade/20!"
                onClick={() =>
                  navigate('/messages', {
                    state: { selectedUser: target },
                  })
                }
              >
                Send message
              </Button>
            ) : (
              <p className="text-sm text-ink-500">
                {isLiked
                  ? "You'll be able to message once they like you back."
                  : 'Like their profile to start a conversation.'}
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
                isLiked={likedIds.has(profile.userId)}
                onLike={(person) => requireAuth(() => toggleLike(person))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
