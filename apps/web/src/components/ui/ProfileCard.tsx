import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Check } from 'lucide-react';
import type { DiscoverProfile } from '../../types';
import Button from './Button';

interface ProfileCardProps {
  profile: DiscoverProfile;
  isLiked: boolean;
  onLike: (profile: DiscoverProfile) => void;
  variant?: 'default' | 'compact';
}

export default function ProfileCard({
  profile,
  isLiked,
  onLike,
  variant = 'default',
}: ProfileCardProps) {
  const navigate = useNavigate();

 return (
    <div className="group flex h-[420px] flex-col overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Profile image */}
      <button
        onClick={() => navigate(`/profile/${profile.id}`)}
        className="block w-full shrink-0 text-left"
        aria-label={`View ${profile.fullName}'s profile`}
      >
        <div
          className={`relative w-full h-48 overflow-hidden bg-theme-shade/20 ${
            variant === 'compact' ? 'aspect-4/5' : 'aspect-4/5'
          }`}
        >
          <img
            src={profile.profilePicture || '/profile-picture.png'}
            alt={profile.fullName}
             className={`w-full h-full object-cover ${profile.profilePicture ? '' : 'size-32 w-auto h-auto object-contain'}`}
            loading="lazy"
          />
     

          {/* Liked badge */}
          {isLiked && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-theme shadow-sm">
              <Check size={12} strokeWidth={3} />
              Liked
            </span>
          )}
        </div>
      </button>

      {/* Profile information */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <button
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="text-left"
        >
          <p className="font-semibold truncate">
            {profile.fullName}
            {profile.age ? `, ${profile.age}` : ''}
          </p>

          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500 truncate">
            <MapPin size={12} />
            {profile.location}
          </p>
        </button>

        {/* about */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {profile.about}
        </p>

        {/* Buttons */}
        <div className="mt-auto flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 !border-stroke-primary !text-theme hover:!bg-theme-shade/20"
            onClick={() => navigate(`/profile/${profile.id}`)}
          >
            View Profile
          </Button>

          <Button
            variant={isLiked ? 'secondary' : 'primary'}
            size="sm"
            className={
              isLiked
                ? 'flex-1 bg-theme-shade/20! text-theme!'
                : 'flex-1 bg-theme! hover:bg-theme-shade/200!'
            }
            icon={<Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />}
            onClick={() => onLike(profile)}
          >
            {isLiked ? 'Liked' : 'Like'}
          </Button>
        </div>
      </div>
    </div>
  );
}