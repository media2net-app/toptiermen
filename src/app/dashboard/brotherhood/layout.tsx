import React from 'react';
import BrotherhoodSubNav from './SubNav';
import { EventsProvider } from './evenementen/EventsContext';

export default function BrotherhoodLayout({ children }: { children: React.ReactNode }) {
  return (
    <EventsProvider>
      <div className="pt-4 md:pt-8 pb-4 px-2 sm:px-4 md:px-6 lg:px-12 max-w-full">
        {/* Enhanced Header Section */}
        <div className="relative mb-8">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#181F17] via-[#232D1A] to-[#181F17] rounded-2xl border border-[#3A4D23]/30 shadow-2xl"></div>
          
          {/* Header Content */}
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Main Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD700] to-[#8BAE5A] mb-3 drop-shadow-lg">
                  Brotherhood
                </h1>
                
                {/* Subtitle */}
                <p className="text-[#8BAE5A] text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                  Word onderdeel van een community van mannen die streven naar excellentie.
                </p>
                
                {/* Decorative elements - removed for cleaner look */}
              </div>
              
              {/* Decorative icon */}
              <div className="hidden lg:flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8BAE5A]/20 to-[#B6C948]/20 rounded-full border border-[#8BAE5A]/30">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className="absolute -bottom-1 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-[#8BAE5A]/40 to-transparent rounded-full"></div>
        </div>
        
        {/* Sticky Navigation */}
        <div className="sticky top-0 z-30 bg-[#181F17]/95 backdrop-blur-md -mx-2 px-2 sm:mx-0 sm:px-0 rounded-xl">
          <BrotherhoodSubNav />
        </div>
        
        {/* Content Area */}
        <div className="mt-2 md:mt-4 w-full">
          {children}
        </div>
      </div>
    </EventsProvider>
  );
} 