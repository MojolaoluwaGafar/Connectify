interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
}

// Shows the user's photo if they have one, otherwise falls back to a
// colored circle with their initial — matches the "D" avatar in the design.
export default function Avatar({ src, name, size = 40 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="flex items-center justify-center rounded-full bg-brand-600 font-semibold text-white"
    >
      {initial}
    </div>
  );
}
