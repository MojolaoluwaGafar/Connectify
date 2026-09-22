import { useEffect, useRef, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import Modal from './Modal';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg']);

interface MorePhotosSectionProps {
  // Extra photos only — the main profile photo has its own uploader.
  photos: (string | File)[];
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  canAddMore: boolean;
}

function PhotoTile({
  photo,
  onRemove,
}: {
  photo: string | File;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof photo === 'string') {
      setPreviewUrl(photo);
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return (
    <div className="group relative h-40 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
      {previewUrl && (
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-transparent opacity-0 transition-all group-hover:bg-black/50 group-hover:text-white group-hover:opacity-100 group-focus-visible:bg-black/50 group-focus-visible:text-white group-focus-visible:opacity-100"
      >
        <Trash2 size={16} />
        <span className="text-xs font-medium">Edit Photo</span>
      </button>
    </div>
  );
}

function UploadPhotoModal({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setFile(null);
  }, [isOpen]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(selected?: File) {
    if (!selected) return;
    if (!ACCEPTED_TYPES.has(selected.type) || selected.size > MAX_FILE_SIZE) {
      return;
    }

    setFile(selected);
  }

  function handleSubmit() {
    if (!file) return;
    onUpload(file);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
      <h2 className="font-fraunces text-2xl font-semibold text-ink-900">
        Upload New Photo
      </h2>

      <p className="mt-1 text-sm text-ink-500">
        Post a photo and let your match know more about you
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400 transition hover:bg-gray-200"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserPlus size={24} />
        )}
      </button>

      <p className="mt-2 text-sm font-medium text-ink-900">Upload Photo</p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file}
        className="mt-6 w-full rounded-xl bg-theme py-3 font-semibold text-white transition hover:bg-theme-shade disabled:cursor-not-allowed disabled:opacity-50"
      >
        Upload
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </Modal>
  );
}

export default function MorePhotosSection({
  photos,
  onAdd,
  onRemove,
  canAddMore,
}: MorePhotosSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#1c1524]/8 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-theme">
          More photos
        </p>

        {canAddMore && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors hover:text-theme"
          >
            <UserPlus size={15} />
            Upload Photo
          </button>
        )}
      </div>

      <div className="mt-4">
        {photos.length === 0 ? (
          <p className="text-sm text-ink-500">
            Add a few more photos so people get a better sense of you.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {photos.map((photo, index) => (
              <PhotoTile
                key={
                  typeof photo === 'string'
                    ? photo
                    : `${photo.name}-${photo.lastModified}`
                }
                photo={photo}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
        )}
      </div>

      <UploadPhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={onAdd}
      />
    </div>
  );
}
