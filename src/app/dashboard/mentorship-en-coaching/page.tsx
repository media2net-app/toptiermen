'use client';

import React from "react";

const mentorship = [
  {
    title: '1-op-1 Sessies',
    description: 'Plan of bekijk je persoonlijke sessies met Rick (indien afgenomen).',
    cta: 'Bekijk sessies',
  },
  {
    title: 'Q&A met Rick',
    description: 'Stel je vragen aan Rick en krijg persoonlijk antwoord.',
    cta: 'Stel een vraag',
  },
  {
    title: 'Masterclass Toegang',
    description: 'Bekijk of je toegang hebt tot exclusieve masterclasses.',
    cta: 'Bekijk masterclass',
  },
];

export default function MentorshipEnCoachingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-[#232D1A]/90 border-2 border-[#8BAE5A] rounded-2xl p-10 flex flex-col items-center shadow-xl">
        <span className="text-5xl mb-4">🎓</span>
        <h1 className="text-2xl md:text-3xl font-bold text-[#8BAE5A] mb-2 text-center">Binnenkort beschikbaar</h1>
        <p className="text-[#A3AED6] text-lg text-center max-w-xl">
          Hier vind je straks alle info over <b>mentorship</b> & <b>1-op-1 coaching</b>.
        </p>
      </div>
    </div>
  );
} 