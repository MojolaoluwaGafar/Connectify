interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  age: string;
  gender: string;
  location: string;
  occupation: string;
  interests: string[];
  about: string;
  profilePicture: string | null;
}

const ProfilePreviewModal = ({
  isOpen,
  onClose,
  fullName,
  age,
  gender,
  location,
  occupation,
  interests,
  about,
  profilePicture,
}: ProfilePreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl scrollbar-none [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-fraunces text-xl font-semibold text-black">
              Profile Preview
            </h2>
            <p className="text-sm text-gray-500">
              This is how your profile will look to others.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-gray-500 hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Profile image */}
        <div className="overflow-hidden rounded-2xl">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={fullName || "Profile"}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center bg-gray-100 text-gray-400">
              No profile photo
            </div>
          )}
        </div>

        {/* Basic information */}
        <div className="mt-4">
          <h3 className="font-fraunces text-2xl font-semibold text-black">
            {fullName || "Your Name"}
            {age && `, ${age}`}
          </h3>

          <div className="mt-1 space-y-1 text-sm text-gray-500">
            {occupation && <p>{occupation}</p>}
            {location && <p>{location}</p>}
            {gender && <p className="capitalize">{gender}</p>}
          </div>
        </div>

        {/* About */}
        {about && (
          <div className="mt-5">
            <h4 className="mb-1 font-semibold text-black">About</h4>
            <p className="text-sm leading-6 text-gray-600">{about}</p>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-2 font-semibold text-black">Interests</h4>

            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-theme py-2.5 font-semibold text-white"
        >
          Back to Edit
        </button>
      </div>
    </div>
  );
};

export default ProfilePreviewModal;
