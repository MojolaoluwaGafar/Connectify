interface Props {
  tab: 'all' | 'new' | 'near-me';
  className?: string;
  setTab: React.Dispatch<React.SetStateAction<'all' | 'new' | 'near-me'>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const FilterProfiles = ({ tab, setTab, setPage, className }: Props) => {
  function handleFilter(value: 'all' | 'new' | 'near-me') {
    setTab(value);
    setPage(1);
  }

  const baseButtonStyles =
    'rounded-full px-4 py-2 text-sm font-semibold transition-colors';

  return (
    <>
      <div className={`flex gap-2 items-center font-geist ${className}`}>
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black font-600 text-[13px] text-semibold ${tab === 'all' ? 'bg-theme text-white' : ''}`}
          onClick={() => handleFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black font-500 text-[13px] text-medium ${tab === 'near-me' ? 'bg-theme text-white' : ''}`}
          value={'near-me'}
          onClick={() => handleFilter('near-me')}
        >
          Near Me
        </button>
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black font-500 text-[13px] text-medium ${tab === 'new' ? 'bg-theme text-white' : ''}`}
          value={'new'}
          onClick={() => handleFilter('new')}
        >
          New
        </button>
      </div>
    </>
  );
};

export default FilterProfiles;