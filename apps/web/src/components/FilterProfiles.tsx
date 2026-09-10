interface Props {
  tab: 'all' | 'new' | 'near-me';
  setTab: React.Dispatch<React.SetStateAction<'all' | 'new' | 'near-me'>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const FilterProfiles = ({ tab, setTab, setPage }: Props) => {
  function handleFilter(value: 'all' | 'new' | 'near-me') {
    setTab(value);
    setPage(1);
  }

  const baseButtonStyles =
    'rounded-full px-4 py-2 text-sm font-semibold transition-colors';

  return (
    <div className="flex gap-2">
      {/* All */}
      <button
        type="button"
        onClick={() => handleFilter('all')}
        className={`${baseButtonStyles} ${
          tab === 'all'
            ? 'bg-[#7c3aed] text-white'
            : 'bg-[#1c1524]/5 text-[#3f3550] hover:bg-[#1c1524]/10'
        }`}
      >
        All
      </button>

      {/* Near Me */}
      <button
        type="button"
        onClick={() => handleFilter('near-me')}
        className={`${baseButtonStyles} ${
          tab === 'near-me'
            ? 'bg-[#7c3aed] text-white'
            : 'bg-[#1c1524]/5 text-[#3f3550] hover:bg-[#1c1524]/10'
        }`}
      >
        Near Me
      </button>

      {/* New */}
      <button
        type="button"
        onClick={() => handleFilter('new')}
        className={`${baseButtonStyles} ${
          tab === 'new'
            ? 'bg-[#7c3aed] text-white'
            : 'bg-[#1c1524]/5 text-[#3f3550] hover:bg-[#1c1524]/10'
        }`}
      >
        New
      </button>
    </div>
  );
};

export default FilterProfiles;