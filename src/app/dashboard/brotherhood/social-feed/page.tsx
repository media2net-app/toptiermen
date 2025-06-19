import React from 'react';
import Image from 'next/image';

const user = {
  name: 'Rick Cuijpers',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  rank: 'Alpha',
};

const SocialFeedPage = () => {
  return (
    <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 md:px-0 py-4 sm:py-8">
      {/* Component 1: Create Post Composer */}
      <section className="mb-4 sm:mb-6">
        <div className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl shadow-xl border border-[#3A4D23]/40 p-3 sm:p-4 flex items-start">
          {/* Left: User profile photo */}
          <div className="mr-2 sm:mr-3 flex-shrink-0">
            <Image 
              src={user.avatar} 
              alt={user.name} 
              width={40} 
              height={40} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#8BAE5A] object-cover" 
            />
          </div>
          {/* Right: Textarea and actions */}
          <div className="flex-1 min-w-0">
            <textarea
              className="w-full border-none focus:ring-0 resize-none bg-[#181F17] text-white rounded-xl p-2 sm:p-3 placeholder:text-[#8BAE5A] text-sm sm:text-base"
              rows={2}
              placeholder={`Deel een overwinning, stel een vraag of zet je intentie voor vandaag, ${user.name.split(' ')[0]}...`}
              disabled
            />
            {/* Action buttons (hidden by default, shown on focus in future) */}
            <div className="flex flex-wrap items-center gap-2 mt-2 opacity-50 pointer-events-none">
              <button className="flex items-center px-3 py-1.5 text-sm rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] touch-manipulation">
                <span className="text-lg mr-1">📷</span> Foto/Video
              </button>
              <button className="flex items-center px-3 py-1.5 text-sm rounded-xl bg-[#232D1A] text-[#FFD700] border border-[#3A4D23] touch-manipulation">
                <span className="text-lg mr-1">📍</span> Check-in
              </button>
              <button className="ml-auto px-5 py-1.5 rounded-xl bg-[#3A4D23] text-[#8BAE5A] font-semibold touch-manipulation" disabled>Post</button>
            </div>
          </div>
        </div>
      </section>

      {/* Component 2: Feed Filters */}
      <section className="mb-4 -mx-3 sm:mx-0">
        <div className="flex overflow-x-auto hide-scrollbar">
          <div className="flex space-x-1 sm:space-x-2 px-3 sm:px-0 min-w-full">
            <button className="px-4 py-2 rounded-t-xl font-semibold bg-[#232D1A] text-[#FFD700] border-b-2 border-[#FFD700] shadow transition-colors whitespace-nowrap touch-manipulation">
              Voor Jou
            </button>
            <button className="px-4 py-2 rounded-t-xl font-semibold bg-[#232D1A]/60 text-[#8BAE5A] hover:text-white border-b-2 border-transparent transition-colors whitespace-nowrap touch-manipulation">
              Connecties
            </button>
            <button className="px-4 py-2 rounded-t-xl font-semibold bg-[#232D1A]/60 text-[#8BAE5A] hover:text-white border-b-2 border-transparent transition-colors whitespace-nowrap touch-manipulation">
              Mijn Groepen
            </button>
          </div>
        </div>
      </section>

      {/* Component 3: Feed List (placeholder) */}
      <section className="space-y-3 sm:space-y-4">
        <div className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl shadow-xl border border-[#3A4D23]/40 p-3 sm:p-5 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Image 
              src={user.avatar} 
              alt={user.name} 
              width={40} 
              height={40} 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#8BAE5A] object-cover flex-shrink-0" 
            />
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                <span className="font-semibold text-white text-sm sm:text-base truncate">{user.name}</span>
                <span className="text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-0.5 rounded inline-flex items-center">
                  <span className="mr-1">👑</span>{user.rank}
                </span>
              </div>
              <span className="block text-xs text-[#8BAE5A]">2 uur geleden</span>
            </div>
          </div>
          <div className="mb-3 text-[#E1CBB3] text-sm sm:text-base">
            ✅ Check-in: Meditatie en koude douche zijn binnen. Voelt goed om de dag zo te starten. Nu focussen op deep work. Wat is jullie #1 doel voor vandaag?
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-[#8BAE5A]">
            <button className="flex items-center gap-1.5 hover:text-[#FFD700] active:text-[#FFD700] transition-colors py-1 px-2 -ml-2 rounded-lg touch-manipulation">
              <span role="img" aria-label="boks" className="text-lg sm:text-xl">👊</span>
              <span className="text-sm">12 Boks</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-[#FFD700] active:text-[#FFD700] transition-colors py-1 px-2 rounded-lg touch-manipulation">
              <span role="img" aria-label="reageer" className="text-lg sm:text-xl">💬</span>
              <span className="text-sm">4 Reacties</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Add custom CSS to hide scrollbar but keep functionality
const customStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
`;

export default SocialFeedPage; 