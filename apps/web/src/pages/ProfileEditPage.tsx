import { useEffect, useState, type MouseEvent, type ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { saveProfile } from "../services/authApi";
import ProfilePreviewModal from "../components/profilePreviewModal";


import { useAuth } from "../context/authContext/useAuth";
import type { Gender } from "../types";
import PhotoUploader from "../components/ui/PhotoUploader";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { INTEREST_OPTIONS } from "../data/mockProfile";
import TextArea from "../components/ui/TextArea";
import Chip from "../components/ui/Chip";
import Button from "../components/ui/Button";
import { NIGERIA_STATES } from "../data/nigeriaStates";

interface FieldErrors {
  fullName?: string;
  age?: string;
  gender?: string;
  location?: string;
  about?: string;
  interest?: string;
}

export default function ProfileEditPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { user, profile, refreshProfile } = useAuth();

  const navigate = useNavigate();

  const isCreating = !profile;

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [about, setBio] = useState("");
  const [profilePicture, setPhotoUrl] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{
    type: "Point";
    coordinates: [number, number];
  }>();

  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setAge(profile.age ? String(profile.age) : "");
      setGender(profile.gender ?? "");
      setLocation(profile.location);
      setOccupation(profile.occupation);
      setInterests(profile.interest ?? profile.interests ?? []);
      setBio(profile.about);
      setPhotoUrl(profile.profilePicture);
    } else if (user) {
      setFullName(user.fullName);
    }
  }, [profile, user]);

  // If a profile was saved before locations were restricted to Nigerian
  // states, its stored value won't match any option below and the select
  // would silently show as unselected. Keep it as an extra option so the
  // user's existing choice stays visible until they pick a real state.
  const locationOptions = useMemo(() => {
    if (
      location &&
      !NIGERIA_STATES.includes(location as (typeof NIGERIA_STATES)[number])
    ) {
      return [location, ...NIGERIA_STATES];
    }
    return NIGERIA_STATES;
  }, [location]);

  function toggleInterest(label: string) {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  }

  function validate(): boolean {
    const next: FieldErrors = {};

    if (fullName.trim().length < 2) {
      next.fullName = "Enter your full name.";
    }

    const ageNum = Number(age);

    if (!age) {
      next.age = "Age is required.";
    } else if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) {
      next.age = "Enter an age between 18 and 100.";
    }

    if (!gender) {
      next.gender = "Select a gender.";
    }

    if (!location.trim()) {
      next.location = "Location is required.";
    }

    if (about.trim().length < 10) {
      next.about = "Write at least 10 characters so people know who you are.";
    }

    if (interests.length === 0) {
      next.interest = "Pick at least one interest.";
    }

    setFieldErrors(next);

    return Object.keys(next).length === 0;
  }

  async function handleSave(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!user) return;

    setApiError("");

    if (!validate()) return;

    if (!gender) return;

    setIsSaving(true);

    try {
      let nextLocationCoords = locationCoords;

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition | null>(
          (resolve) => {
            navigator.geolocation.getCurrentPosition(resolve, () =>
              resolve(null),
            );
          },
        );

        if (position) {
          nextLocationCoords = {
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          };
          setLocationCoords(nextLocationCoords);
        }
      }

      await saveProfile({
        fullName: fullName.trim() || "",
        age: Number(age),
        gender: gender,
        location: location.trim(),
        occupation: occupation.trim(),
        interests,
        about: about.trim(),
        profilePicture: profilePicture,
      });

      await refreshProfile();
      navigate("/profile");
    } catch {
      setApiError("Could not save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink-900">
        {isCreating ? "Complete your profile" : "Edit your profile"}
      </h1>
      <p className="mt-1 text-ink-500">
        {isCreating
          ? "Tell people a little about yourself so they can find you"
          : "Keep your profile up to date to get better matches"}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <PhotoUploader
          profilePicture={profilePicture}
          name={fullName}
          onChange={setPhotoUrl}
        />

        <div className="space-y-6">
          <Section title="Basic information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                placeholder="e.g John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
              />

              <Input
                label="Age"
                type="number"
                placeholder="Your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={18}
                max={100}
                error={fieldErrors.age}
              />

              <Select
                label="Gender"
                value={gender ?? ''}
                onChange={(e) => setGender(e.target.value as Gender)}
                error={fieldErrors.gender}
              >
                <option value="">select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </Select>

              <Select
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={fieldErrors.location}
              >
                <option value="">Select your state</option>
                {locationOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </div>
          </Section>

          <Section title="Personal information">
            <Input
              label="Occupation"
              placeholder="what do you do? (optional)"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </Section>

          <Section title="Interests" subtitle="Select all that apply">
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  selected={interests.includes(label)}
                  onClick={() => toggleInterest(label)}
                />
              ))}
            </div>

            {fieldErrors.interest && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.interest}
              </p>
            )}
          </Section>

          <Section title="About you">
            <TextArea
              placeholder="Write a short about about yourself (at least 10 characters)"
              value={about}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
              error={fieldErrors.about}
            />
          </Section>

          {Object.keys(fieldErrors).length > 0 && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-semibold">
                Please fix the following before saving:
              </p>

              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {Object.values(fieldErrors).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {apiError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {apiError}
            </p>
          )}

          <div className="flex gap-3">
            <Button size="lg" onClick={handleSave} isLoading={isSaving}>
              {isCreating ? "Save Profile and continue" : "Save Changes"}
            </Button>
            <Button type="button" onClick={() => setIsPreviewOpen(true)}>
              Preview Profile
            </Button>

            {!isCreating && (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <ProfilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        fullName={fullName}
        age={age}
        gender={gender ?? ""}
        location={location}
        occupation={occupation}
        interests={interests}
        about={about}
        profilePicture={profilePicture}
      />
    </div>
  );
}


function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#1c1524]/8 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-theme">
        {title}
      </p>

      {subtitle && <p className="mt-0.5 text-xs text-[#6b6178]">{subtitle}</p>}

      <div className="mt-4">{children}</div>
    </div>
  );
}
