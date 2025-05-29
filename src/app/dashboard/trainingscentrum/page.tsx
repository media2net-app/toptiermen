'use client';
import ClientLayout from '../../components/ClientLayout';
import Link from 'next/link';

const trainings = [
  {
    title: "Workoutschema's",
    description: "Kies uit gym, outdoor of bodyweight schema's. Persoonlijk afgestemd op jouw doelen.",
    cta: "Bekijk schema's",
    href: '/dashboard/trainingscentrum/workoutschema',
  },
  {
    title: "Challenges",
    description: "Doe mee aan Spartan Week, 30-dagen push-up challenge en meer. Daag jezelf uit!",
    cta: "Bekijk challenges",
  },
  {
    title: "Voedingsplannen",
    description: "Meal-prep strategieën en voedingsplannen voor optimale resultaten.",
    cta: "Bekijk plannen",
  },
];

export default function Trainingscentrum() {
  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Trainingscentrum</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Alles voor jouw fysieke groei en discipline</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {trainings.map((t, i) =>
          i === 0 ? (
            <Link
              key={t.title}
              href={t.href!}
              className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#635985] focus:outline-none focus:ring-2 focus:ring-[#635985]"
            >
              <span className="text-xl font-semibold text-white mb-2">{t.title}</span>
              <p className="text-[#A3AED6] mb-4 text-sm">{t.description}</p>
              <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">{t.cta}</button>
            </Link>
          ) : (
            <div key={t.title} className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-4 items-start">
              <span className="text-xl font-semibold text-white mb-2">{t.title}</span>
              <p className="text-[#A3AED6] mb-4 text-sm">{t.description}</p>
              <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] transition-all">{t.cta}</button>
            </div>
          )
        )}
      </div>
    </ClientLayout>
  );
} 