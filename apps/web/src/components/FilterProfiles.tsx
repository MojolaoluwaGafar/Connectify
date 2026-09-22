export type DiscoverTab = 'all' | 'new' | 'near-me';
export type GenderFilter = 'all' | 'male' | 'female' | 'non-binary';

interface Props {
  tab: DiscoverTab;
  gender: GenderFilter;
  className?: string;
  setTab: React.Dispatch<React.SetStateAction<DiscoverTab>>;
  setGender: React.Dispatch<React.SetStateAction<GenderFilter>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  // { value: 'non-binary', label: 'Non-binary' },
];

const FilterProfiles = ({
  tab,
  gender,
  setTab,
  setGender,
  setPage,
  className,
}: Props) => {
  function handleFilter(value: DiscoverTab) {
    setTab(value);
    setPage(1);
  }

  function handleGender(value: GenderFilter) {
    setGender(value);
    setPage(1);
  }

  return (
    <div className={`flex flex-col gap-3 font-geist ${className ?? ''}`}>
      <div className="flex gap-2 items-center">
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black font-600 text-[13px] text-semibold ${tab === 'all' ? 'bg-theme text-white' : ''}`}
          onClick={() => handleFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 border lg:w-20 rounded-2xl border-stroke-primary text-black font-500 text-[13px] text-medium ${tab === 'near-me' ? 'bg-theme text-white' : ''}`}
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

      <div
        role="group"
        aria-label="Filter by gender"
        className="flex flex-wrap gap-2 items-center"
      >
        {GENDER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={gender === option.value}
            className={`px-3 py-1 border rounded-2xl border-stroke-primary text-[13px] ${
              gender === option.value
                ? 'bg-theme text-white'
                : 'text-black hover:bg-gray-50'
            }`}
            onClick={() => handleGender(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterProfiles;
