import { useRef } from 'react';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';
interface PhotoUploaderProps {
  photoUrl: string | null;
  name: string;
  onChange: (dataUrl: string) => void;
}

// Handles selecting and previewing a profile photo.
export default function PhotoUploader({
  photoUrl,
  name,
  onChange,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file?: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-stroke-primary bg-white p-6 text-center">
      {/* Profile image */}
      <div className="relative">
        <Avatar src={photoUrl} name={name || 'Your name'} size={104} />

        {/* Camera button */}
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-pink-400 text-white shadow-sm transition hover:bg-theme-shade/200"
          aria-label="Change photo"
          type="button"
        >
          <Camera size={14} />
        </button>
      </div>

      {/* Text */}
      <p className="mt-3 text-sm font-medium text-ink-900">Profile photo</p>

      <p className="text-xs text-ink-500">JPG or PNG, max 5MB</p>

      {/* Choose photo button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-4 rounded-lg bg-theme-shade/20 px-4 py-2 text-xs font-semibold text-theme transition hover:bg-theme-shade/20"
      >
        {photoUrl ? 'Change photo' : 'Choose photo'}
      </button>

      {/* Hidden file input */}
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
