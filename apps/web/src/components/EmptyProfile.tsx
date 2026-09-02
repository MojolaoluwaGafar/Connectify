// import React from 'react';

const EmptyProfile = () => {
  return (
    <>
      <div className="border border-stroke-primary h-56 rounded-xl flex justify-center items-center field-sizing-fixed flex-col gap-2">
        <div className="p-3 bg-theme-shade/10 rounded-full">
          <img src="/icon-users.png" className="size-6" />
        </div>
        <h2 className="font-fraunces font-semibold text-black">
          No one matches your search
        </h2>
        <p className="text-sm">
          Try a different name, interest, or clear your filters to see everyone.
        </p>
      </div>
    </>
  );
};

export default EmptyProfile;
