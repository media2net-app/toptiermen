import React from 'react';
import Image from 'next/image';

const user = {
  name: 'Rick Cuijpers',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  rank: 'Alpha',
};

const SocialFeedPage = () => {
  return (
    <div className="py-8 px-4 md:px-12">
      {/* Component 1: Create Post Composer */}
      <section className="mb-6">
        <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-4 flex items-start">
          {/* Left: User profile photo */}
          <div className="mr-3">
            <Image src={user.avatar} alt={user.name} width={48} height={48} className="w-12 h-12 rounded-full border-2 border-[#8BAE5A] object-cover" />
          </div>
          {/* Right: Textarea and actions */}
          <div className="flex-1">
            <textarea
              className="w-full border-none focus:ring-0 resize-none bg-[#181F17] text-white rounded-xl p-3 placeholder:text-[#8BAE5A]"
              rows={2}
              placeholder={`Deel een overwinning, stel een vraag of zet je intentie voor vandaag, ${user.name.split(' ')[0]}...`}
              disabled
            />
            {/* Action buttons (hidden by default, shown on focus in future) */}
            <div className="flex items-center mt-2 space-x-2 opacity-50 pointer-events-none">
              <button className="flex items-center px-3 py-1 text-sm rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]">+ Foto/Video</button>
              <button className="flex items-center px-3 py-1 text-sm rounded-xl bg-[#232D1A] text-[#FFD700] border border-[#3A4D23]"># Check-in</button>
              <button className="ml-auto px-5 py-1 rounded-xl bg-[#3A4D23] text-[#8BAE5A] font-semibold" disabled>Post</button>
            </div>
          </div>
        </div>
      </section>

      {/* Component 2: Feed Filters */}
      <section className="mb-4">
        <div className="flex space-x-2">
          <button className="px-4 py-2 rounded-t-xl font-semibold bg-[#232D1A] text-[#FFD700] border-b-2 border-[#FFD700] shadow transition-colors">Voor Jou</button>
          <button className="px-4 py-2 rounded-t-xl font-semibold bg-[#232D1A]/60 text-[#8BAE5A] hover:text-white border-b-2 border-transparent transition-colors">Connecties</button>
          <button className="px-4 py-2 rounded-t-xl font-semibold bg-[#232D1A]/60 text-[#8BAE5A] hover:text-white border-b-2 border-transparent transition-colors">Mijn Groepen</button>
        </div>
      </section>

      {/* Component 3: Feed List (placeholder) */}
      <section className="space-y-4">
        <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-[#8BAE5A] object-cover" />
            <div>
              <span className="font-semibold text-white">{user.name}</span>
              <span className="ml-2 text-xs text-[#FFD700] bg-[#3A4D23] px-2 py-0.5 rounded">{user.rank}</span>
              <span className="block text-xs text-[#8BAE5A]">2 uur geleden</span>
            </div>
          </div>
          <div className="mb-2 text-[#E1CBB3]">✅ Check-in: Meditatie en koude douche zijn binnen. Voelt goed om de dag zo te starten. Nu focussen op deep work. Wat is jullie #1 doel voor vandaag?</div>
          <div className="flex items-center gap-6 mt-2 text-[#8BAE5A]">
            <button className="flex items-center gap-1 hover:text-[#FFD700] transition-colors"><span role="img" aria-label="boks">👊</span> <span className="text-sm">12 Boks</span></button>
            <button className="flex items-center gap-1 hover:text-[#FFD700] transition-colors"><span role="img" aria-label="reageer">💬</span> <span className="text-sm">4 Reacties</span></button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocialFeedPage; 