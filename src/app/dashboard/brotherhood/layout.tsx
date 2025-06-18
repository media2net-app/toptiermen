import React from 'react';
import BrotherhoodSubNav from './SubNav';

export default function BrotherhoodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-8 px-4 md:px-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Brotherhood</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Word onderdeel van een community van mannen die streven naar excellentie.</p>
      <BrotherhoodSubNav />
      {children}
    </div>
  );
} 