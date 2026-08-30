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
  return (
    <>
      <div className="flex gap-2 items-center">
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black ${tab === 'all' ? 'bg-theme text-white' : ''}`}
          onClick={() => handleFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black ${tab === 'near-me' ? 'bg-theme text-white' : ''}`}
          value={'near-me'}
          onClick={() => handleFilter('near-me')}
        >
          Near Me
        </button>
        <button
          className={`px-3 py-1 border rounded-2xl border-stroke-primary text-black ${tab === 'new' ? 'bg-theme text-white' : ''}`}
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
