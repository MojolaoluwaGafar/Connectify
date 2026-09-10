interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
}

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
      className="flex items-center justify-center rounded-full bg-theme font-semibold text-white"
    >
      {initial}
    </div>
  );
}
