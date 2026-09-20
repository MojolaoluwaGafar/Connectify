import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// Building the full 1..totalPages list doesn't scale — beyond a handful of
// pages it overflows a fixed-width row instead of shrinking, since each
// button is a fixed h-9 w-9. Instead, always show the first/last page plus
// a small window around the current page, collapsing the rest into "…".
function getPageItems(page: number, totalPages: number) {
  const siblingCount = 1;
  const items: (number | 'ellipsis')[] = [];

  const left = Math.max(2, page - siblingCount);
  const right = Math.min(totalPages - 1, page + siblingCount);

  items.push(1);
  if (left > 2) items.push('ellipsis');
  for (let p = left; p <= right; p++) items.push(p);
  if (right < totalPages - 1) items.push('ellipsis');
  if (totalPages > 1) items.push(totalPages);

  return items;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-theme text-theme hover:bg-theme/10 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`h-9 w-9 shrink-0 rounded-lg text-sm font-medium transition-colors border border-theme/10 ${
              item === page ? 'bg-theme text-white' : 'hover:bg-theme/10'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-theme text-theme hover:bg-theme/10 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}