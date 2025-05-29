'use client';

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

export default function MentorshipCoaching() {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mentorship & Coaching</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Persoonlijke groei en begeleiding van Rick</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mentorship.map((item) => (
          <div key={item.title} className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start">
            <span className="text-xl font-semibold text-white mb-2">{item.title}</span>
            <p className="text-[#A3AED6] mb-4 text-sm">{item.description}</p>
            <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">{item.cta}</button>
          </div>
        ))}
      </div>
    </>
  );
} 