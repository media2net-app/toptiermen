'use client';
import ClientLayout from '../../components/ClientLayout';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';
const WorkoutPlayerModal = dynamic(() => import('./WorkoutPlayerModal'), { ssr: false });

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

const todaysTraining = {
  day: 2,
  name: 'Push Day',
  schema: 'Full Body',
  exercises: [
    {
      name: 'Bench Press',
      last: { sets: 3, reps: 8, weight: 60 },
      suggestion: 62.5,
    },
    {
      name: 'Incline Dumbbell Press',
      last: { sets: 3, reps: 10, weight: 22 },
      suggestion: 24,
    },
  ],
};

export default function Trainingscentrum() {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Trainingscentrum</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Alles voor jouw fysieke groei en discipline</p>

      {/* Jouw Training Vandaag blok */}
      <div className="bg-[#232D1A]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1">
          <span className="text-[#8BAE5A] text-sm font-semibold uppercase">Jouw Training Vandaag</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-1 mb-2">Vandaag op het programma: Dag {todaysTraining.day} - {todaysTraining.name} van je '{todaysTraining.schema}' schema.</h2>
          <div className="mb-3">
            {todaysTraining.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 text-white text-sm mb-1">
                <span className="font-semibold text-[#FFD700]">{ex.name}:</span>
                <span className="text-[#8BAE5A]">Vorige keer: {ex.last.sets} sets x {ex.last.reps} reps @ {ex.last.weight}kg.</span>
                <span className="ml-2 text-[#FFD700]">Probeer vandaag {ex.suggestion}kg</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <button
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all"
            onClick={() => setShowWorkoutModal(true)}
          >
            START TRAINING
          </button>
        </div>
      </div>

      <WorkoutPlayerModal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} />

      {/* bestaande grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {trainings.map((t, i) =>
          i === 0 ? (
            <Link
              key={t.title}
              href={t.href!}
              className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 flex flex-col gap-4 items-start cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <span className="text-xl font-semibold text-white mb-2">{t.title}</span>
              <p className="text-white mb-4 text-sm">{t.description}</p>
              <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white font-semibold shadow hover:from-[#f0a14f] hover:to-[#8BAE5A] transition-all">{t.cta}</button>
            </Link>
          ) : (
            <div key={t.title} className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40 flex flex-col gap-4 items-start">
              <span className="text-xl font-semibold text-white mb-2">{t.title}</span>
              <p className="text-white mb-4 text-sm">{t.description}</p>
              <button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white font-semibold shadow hover:from-[#f0a14f] hover:to-[#8BAE5A] transition-all">{t.cta}</button>
            </div>
          )
        )}
      </div>

      <div className="flex flex-col items-center gap-4 mt-8">
        <a href="/dashboard/voedingsplannen" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all">
          Bekijk Voedingsplannen
        </a>
      </div>
    </ClientLayout>
  );
} 