import React from 'react';
import BrotherhoodSubNav from './SubNav';

export default function BrotherhoodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-8 pb-4 px-2 sm:px-4 md:px-12 max-w-full">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Brotherhood</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Word onderdeel van een community van mannen die streven naar excellentie.</p>
      <div className="sticky top-0 z-30 bg-[#181F17] -mx-2 px-2 sm:mx-0 sm:px-0">
        <BrotherhoodSubNav />
      </div>
      <div className="mt-2 md:mt-4 w-full max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
} 