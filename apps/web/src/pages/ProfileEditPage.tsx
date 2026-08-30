// import { useEffect, useState, type ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';

// import * as api from '../lib/mockApi';

// import type { Gender } from '../types';
// import { useAuth } from '../context/authContext/useAuth';
// import { INTEREST_OPTIONS } from '../data/mockProfile';
// import PhotoUploader from '../components/ui/PhotoUploader';
// import Input from '../components/ui/Input';
// import Select from '../components/ui/Select';
// import Chip from '../components/ui/Chip';
// import TextArea from '../components/ui/TextArea';
// import Button from '../components/ui/Button';

// interface FieldErrors {
//   fullName?: string;
//   age?: string;
//   gender?: string;
//   location?: string;
//   bio?: string;
//   interests?: string;
// }

// export default function ProfileEditPage() {
//   const { user, profile, refreshProfile } = useAuth();
//   const navigate = useNavigate();

//   const isCreating = !profile;

//   const [fullName, setFullName] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState<Gender | ''>('');
//   const [location, setLocation] = useState('');
//   const [occupation, setOccupation] = useState('');
//   const [interests, setInterests] = useState<string[]>([]);
//   const [bio, setBio] = useState('');
//   const [photoUrl, setPhotoUrl] = useState<string | null>(null);

//   const [isSaving, setIsSaving] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
//   const [apiError, setApiError] = useState('');

//   useEffect(() => {
//     if (profile) {
//       setFullName(profile.fullName);
//       setAge(profile.age ? String(profile.age) : '');
//       setGender(profile.gender ?? '');
//       setLocation(profile.location);
//       setOccupation(profile.occupation);
//       setInterests(profile.interests);
//       setBio(profile.bio);
//       setPhotoUrl(profile.photoUrl);
//     } else if (user) {
//       setFullName(user.fullName);
//     }
//   }, [profile, user]);

//   function toggleInterest(label: string) {
//     setInterests((prev) =>
//       prev.includes(label)
//         ? prev.filter((item) => item !== label)
//         : [...prev, label],
//     );
//   }

//   function validate(): boolean {
//     const next: FieldErrors = {};

//     if (fullName.trim().length < 2) {
//       next.fullName = 'Enter your full name.';
//     }

//     const ageNum = Number(age);

//     if (!age) {
//       next.age = 'Age is required.';
//     } else if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) {
//       next.age = 'Enter an age between 18 and 100.';
//     }

//     if (!gender) {
//       next.gender = 'Select a gender.';
//     }

//     if (!location.trim()) {
//       next.location = 'Location is required.';
//     }

//     if (bio.trim().length < 10) {
//       next.bio = 'Write at least 10 characters so people know who you are.';
//     }

//     if (interests.length === 0) {
//       next.interests = 'Pick at least one interest.';
//     }

//     setFieldErrors(next);

//     return Object.keys(next).length === 0;
//   }

//   async function handleSave() {
//     if (!user) return;

//     setApiError('');

//     if (!validate()) return;

//     setIsSaving(true);

//     try {
//       await api.saveProfile(user.id, {
//         fullName: fullName.trim(),
//         age: age ? Number(age) : null,
//         gender: gender || null,
//         location: location.trim(),
//         occupation: occupation.trim(),
//         interests,
//         bio: bio.trim(),
//         photoUrl,
//       });

//       await refreshProfile();
//       navigate('/profile');
//     } catch {
//       setApiError('Could not save your profile. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
//       {/* Page heading */}
//       <h1 className="font-display text-3xl font-semibold text-ink-900">
//         {isCreating ? 'Complete your profile' : 'Edit your profile'}
//       </h1>

//       <p className="mt-1 text-ink-500">
//         {isCreating
//           ? 'Tell people a little about yourself so they can find you'
//           : 'Keep your profile up to date to get better matches'}
//       </p>

//       <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
//         {/* PHOTO SECTION */}
//         <PhotoUploader
//           photoUrl={photoUrl}
//           name={fullName}
//           onChange={setPhotoUrl}
//         />

//         {/* FORM */}
//         <div className="space-y-6">
//           {/* BASIC INFORMATION */}
//           <Section title="Basic information">
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <Input
//                 label="Full name"
//                 placeholder="e.g John Doe"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 error={fieldErrors.fullName}
//               />

//               <Input
//                 label="Age"
//                 type="number"
//                 placeholder="Your age"
//                 value={age}
//                 onChange={(e) => setAge(e.target.value)}
//                 min={18}
//                 max={100}
//                 error={fieldErrors.age}
//               />

//               <Select
//                 label="Gender"
//                 value={gender}
//                 onChange={(e) => setGender(e.target.value as Gender)}
//                 error={fieldErrors.gender}
//               >
//                 <option value="">select gender</option>
//                 <option value="female">Female</option>
//                 <option value="male">Male</option>
//                 <option value="non-binary">Non-binary</option>
//                 <option value="prefer-not-to-say">Prefer not to say</option>
//               </Select>

//               <Input
//                 label="Location"
//                 placeholder="your country or city"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 error={fieldErrors.location}
//               />
//             </div>
//           </Section>

//           {/* PERSONAL INFORMATION */}
//           <Section title="Personal information">
//             <Input
//               label="Occupation"
//               placeholder="what do you do? (optional)"
//               value={occupation}
//               onChange={(e) => setOccupation(e.target.value)}
//             />
//           </Section>

//           {/* INTERESTS */}
//           <Section title="Interests" subtitle="Select all that apply">
//             <div className="flex flex-wrap gap-2">
//               {INTEREST_OPTIONS.map((label) => (
//                 <Chip
//                   key={label}
//                   label={label}
//                   selected={interests.includes(label)}
//                   onClick={() => toggleInterest(label)}
//                 />
//               ))}
//             </div>

//             {fieldErrors.interests && (
//               <p className="mt-2 text-xs font-medium text-red-600">
//                 {fieldErrors.interests}
//               </p>
//             )}
//           </Section>

//           {/* ABOUT YOU */}
//           <Section title="About you">
//             <TextArea
//               placeholder="Write a short bio about yourself (at least 10 characters)"
//               value={bio}
//               onChange={(e) => setBio(e.target.value.slice(0, 200))}
//               maxLength={200}
//               rows={4}
//               error={fieldErrors.bio}
//             />
//           </Section>

//           {/* VALIDATION ERRORS */}
//           {Object.keys(fieldErrors).length > 0 && (
//             <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
//               <p className="font-semibold">
//                 Please fix the following before saving:
//               </p>

//               <ul className="mt-1 list-inside list-disc space-y-0.5">
//                 {Object.values(fieldErrors).map((message, index) => (
//                   <li key={index}>{message}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* API ERROR */}
//           {apiError && (
//             <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
//               {apiError}
//             </p>
//           )}

//           {/* ACTION BUTTONS */}
//           <div className="flex gap-3">
//             <Button
//               size="lg"
//               onClick={handleSave}
//               isLoading={isSaving}
//               className="bg-pink-400 text-white shadow-sm transition hover:bg-theme-shade/200 hover:shadow-md"
//             >
//               {isCreating ? 'Save Profile and continue' : 'Save Changes'}
//             </Button>

//             {!isCreating && (
//               <Button
//                 size="lg"
//                 variant="ghost"
//                 onClick={() => navigate('/profile')}
//               >
//                 Cancel
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* Reusable section component */
// function Section({
//   title,
//   subtitle,
//   children,
// }: {
//   title: string;
//   subtitle?: string;
//   children: ReactNode;
// }) {
//   return (
//     <div
//       className="rounded-2xl border bg-white p-5"
//       style={{ borderColor: '#F5CDD5' }}
//     >
//       <p
//         className="text-xs font-semibold uppercase tracking-wide"
//         style={{ color: '#C77989' }}
//       >
//         {title}
//       </p>

//       {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}

//       <div className="mt-4">{children}</div>
//     </div>
//   );
// }

import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import * as api from '../lib/mockApi';
import { useAuth } from '../context/authContext/useAuth';
import type { Gender } from '../types';
import PhotoUploader from '../components/ui/PhotoUploader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { INTEREST_OPTIONS } from '../data/mockProfile';
import TextArea from '../components/ui/TextArea';
import Chip from '../components/ui/Chip';
import Button from '../components/ui/Button';

interface FieldErrors {
  fullName?: string;
  age?: string;
  gender?: string;
  location?: string;
  bio?: string;
  interests?: string;
}

export default function ProfileEditPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const isCreating = !profile;

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setAge(profile.age ? String(profile.age) : '');
      setGender(profile.gender ?? '');
      setLocation(profile.location);
      setOccupation(profile.occupation);
      setInterests(profile.interests);
      setBio(profile.bio);
      setPhotoUrl(profile.photoUrl);
    } else if (user) {
      setFullName(user.fullName);
    }
  }, [profile, user]);

  function toggleInterest(label: string) {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  }

  function validate(): boolean {
    const next: FieldErrors = {};

    if (fullName.trim().length < 2) {
      next.fullName = 'Enter your full name.';
    }

    const ageNum = Number(age);

    if (!age) {
      next.age = 'Age is required.';
    } else if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 100) {
      next.age = 'Enter an age between 18 and 100.';
    }

    if (!gender) {
      next.gender = 'Select a gender.';
    }

    if (!location.trim()) {
      next.location = 'Location is required.';
    }

    if (bio.trim().length < 10) {
      next.bio = 'Write at least 10 characters so people know who you are.';
    }

    if (interests.length === 0) {
      next.interests = 'Pick at least one interest.';
    }

    setFieldErrors(next);

    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!user) return;

    setApiError('');

    if (!validate()) return;

    setIsSaving(true);

    try {
      await api.saveProfile(user.id, {
        fullName: fullName.trim(),
        age: age ? Number(age) : null,
        gender: gender || null,
        location: location.trim(),
        occupation: occupation.trim(),
        interests,
        bio: bio.trim(),
        photoUrl,
      });

      await refreshProfile();
      navigate('/profile');
    } catch {
      setApiError('Could not save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-[#1c1524]">
        {isCreating ? 'Complete your profile' : 'Edit your profile'}
      </h1>

      <p className="mt-1 text-[#6b6178]">
        {isCreating
          ? 'Tell people a little about yourself so they can find you'
          : 'Keep your profile up to date to get better matches'}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <PhotoUploader
          photoUrl={photoUrl}
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
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                error={fieldErrors.gender}
              >
                <option value="">select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </Select>

              <Input
                label="Location"
                placeholder="your country or city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={fieldErrors.location}
              />
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

            {fieldErrors.interests && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.interests}
              </p>
            )}
          </Section>

          <Section title="About you">
            <TextArea
              placeholder="Write a short bio about yourself (at least 10 characters)"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              maxLength={200}
              rows={4}
              error={fieldErrors.bio}
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
              {isCreating ? 'Save Profile and continue' : 'Save Changes'}
            </Button>

            {!isCreating && (
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
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
