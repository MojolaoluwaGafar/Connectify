import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg']);

interface PhotoUploaderProps {
  profilePicture: string | File | null;
  name: string;
  onChange: (file: File) => void;
  error?: string;
}

export default function PhotoUploader({
  profilePicture,
  name,
  onChange,
  error,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(profilePicture instanceof File)) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profilePicture);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture]);

  function handleFile(file?: File) {
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
      return;
    }

    onChange(file);
  }

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border bg-white p-6 text-center ${
        error ? 'border-red-400' : 'border-stroke-primary'
      }`}
    >
      <div className="relative">
        <Avatar
          src={previewUrl ?? (typeof profilePicture === 'string' ? profilePicture : null)}
          name={name || 'Your name'}
          size={104}
        />

        <button
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full  bg-theme text-white shadow-sm transition hover:bg-theme-shade"
          aria-label="Change photo"
          type="button"
        >
          <Camera size={14} />
        </button>
      </div>

      <p className="mt-3 text-sm font-medium text-ink-900">Profile photo</p>

      <p className="text-xs text-ink-500">JPG or PNG, max 5MB</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-theme-shade/20 px-4 py-2 text-xs font-semibold text-theme transition hover:bg-theme-shade/20"
      >
        {profilePicture ? 'Change photo' : 'Choose photo'}
      </button>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
