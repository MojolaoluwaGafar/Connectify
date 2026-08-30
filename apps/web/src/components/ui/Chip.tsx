interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  as?: 'button' | 'span';
}

// Used both as a selectable interest tag (Profile form) and as a read-only
// interest pill (profile cards). Pass `onClick` to make it interactive.
export default function Chip({
  label,
  selected,
  onClick,
  as = 'button',
}: ChipProps) {
  const classes = `inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors
    ${selected ? 'bg-theme text-white' : 'bg-theme/10 text-text-primary hover:bg-gray-200'}
    ${onClick ? 'cursor-pointer' : ''}`;

  if (as === 'span' || !onClick) {
    return <span className={classes}>{label}</span>;
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
