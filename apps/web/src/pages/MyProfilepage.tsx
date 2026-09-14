import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Pencil,
  Heart,
  HeartHandshake,
  Sparkles,
  Compass,
  X,
} from "lucide-react";

import * as api from "../services/authApi";
import { useAuth } from "../context/authContext/useAuth";

import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";
import { useLikes } from "../context/likeContext/useLikes";

export default function MyProfilePage() {
  const { user, profile } = useAuth();
  const { likedIds } = useLikes();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    likedYou: 0,
    matches: 0,
  });

  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    if (!profile) {
      navigate("/profile/edit", { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (!user) return;

    Promise.all([api.getWhoLikedMe(user.id), api.getMatches(user.id)]).then(
      ([likedYou, matches]) => {
        setStats({
          likedYou: likedYou.length,
          matches: matches.length,
        });
      },
    );
  }, [user, likedIds]);

  if (!profile || !user) return null;

  const statCards = [
    {
      label: "People who liked you",
      value: stats.likedYou,
      icon: <HeartHandshake size={18} />,
      to: "/likes",
    },
    {
      label: "Profiles you liked",
      value: likedIds.size,
      icon: <Heart size={18} />,
      to: "/likes",
    },
    {
      label: "Matches",
      value: stats.matches,
      icon: <Sparkles size={18} />,
      to: "/matches",
    },
  ];

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#1c1524]/8">
          <div className="h-28 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9]" />

          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex items-end justify-between">
              <button
                type="button"
                onClick={() => setImageOpen(true)}
                className="cursor-pointer rounded-full border-4 border-white"
              >
                <Avatar
                  src={profile.profilePicture}
                  name={profile.fullName}
                  size={96}
                />
              </button>

              <Button
                icon={<Pencil size={14} />}
                onClick={() => navigate("/profile/edit")}
              >
                Edit profile
              </Button>
            </div>

            <h1 className="mt-4 font-display text-2xl font-semibold text-[#1c1524]">
              {profile.fullName}
              {profile.age ? `, ${profile.age}` : ""}
            </h1>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-primary">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}

              {profile.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {profile.occupation}
                </span>
              )}
            </div>

            {(profile.interest ?? profile.interests ?? []).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {(profile.interest ?? profile.interests ?? []).map((i) => (
                  <Chip key={i} label={i} as="span" />
                ))}
              </div>
            )}

            {profile.about && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-theme">
                  About me
                </p>

                <p className="mt-1.5 text-sm leading-relaxed text-[#3f3550]">
                  {profile.about}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.to)}
              className="rounded-2xl border border-[#1c1524]/8 p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f3ff] text-theme">
                {s.icon}
              </div>

              <p className="mt-3 font-display text-2xl font-semibold text-[#1c1524]">
                {s.value}
              </p>

              <p className="text-sm text-text-primary">{s.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#fdf7fb] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[#1c1524]">
              Ready to meet more people?
            </p>

            <p className="mt-0.5 text-sm text-text-primary">
              Head back to Discover and find your next connection.
            </p>
          </div>

          <Button
            icon={<Compass size={16} />}
            onClick={() => navigate("/home")}
          >
            Discover people
          </Button>
        </div>
      </div>

      {/* Full screen profile picture */}
      {imageOpen && profile.profilePicture && (
        <div
          onClick={() => setImageOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setImageOpen(false)}
            className="absolute right-5 top-5 rounded-full bg-white p-2 text-gray-800 shadow-lg hover:bg-gray-100"
            aria-label="Close profile picture"
          >
            <X size={24} />
          </button>

          <img
            src={profile.profilePicture}
            alt={profile.fullName}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
}
