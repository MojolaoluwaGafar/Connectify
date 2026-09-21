interface ProfileCardSkeletonProps {
  count?: number;
}

function SingleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stroke-primary shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="h-80 w-full bg-gray-200" />

      {/* Text placeholders */}
      <div className="space-y-3 p-3">
        <div className="h-5 w-3/5 rounded bg-gray-200" />
        <div className="h-3.5 w-2/5 rounded bg-gray-200" />
        <div className="space-y-2 pt-1">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-4/5 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-full rounded-lg bg-gray-200" />
          <div className="h-8 w-full rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function ProfileCardSkeletonGrid({
  count = 6,
}: ProfileCardSkeletonProps) {
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 flex-col gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <SingleCardSkeleton key={i} />
      ))}
    </div>
  );
}
