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
    icon: '💪',
  },
  {
    title: "Challenges",
    description: "Doe mee aan Spartan Week, 30-dagen push-up challenge en meer. Daag jezelf uit!",
    cta: "Bekijk challenges",
    icon: '🏆',
  },
  {
    title: "Voedingsplannen",
    description: "Meal-prep strategieën en voedingsplannen voor optimale resultaten.",
    cta: "Bekijk plannen",
    icon: '🥗',
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
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">Trainingscentrum</h1>
          <p className="text-[#A3AED6] text-base sm:text-lg">Alles voor jouw fysieke groei en discipline</p>
        </div>

        {/* Jouw Training Vandaag blok */}
        <div className="bg-[#232D1A]/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <span className="text-[#8BAE5A] text-xs sm:text-sm font-semibold uppercase tracking-wider">Jouw Training Vandaag</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1 mb-2">
              Dag {todaysTraining.day} - {todaysTraining.name}
              <span className="block text-base sm:text-lg text-[#8BAE5A] mt-1 font-normal">'{todaysTraining.schema}' schema</span>
            </h2>
            <div className="space-y-2">
              {todaysTraining.exercises.map((ex, i) => (
                <div key={i} className="bg-[#181F17]/40 rounded-lg p-3 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#FFD700] text-sm sm:text-base">{ex.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
                    <span className="text-[#8BAE5A]">
                      Vorige: {ex.last.sets}×{ex.last.reps} @ {ex.last.weight}kg
                    </span>
                    <span className="text-[#FFD700] sm:ml-2">
                      Vandaag: {ex.suggestion}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-stretch sm:items-center justify-center mt-2 sm:mt-0">
            <button
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-lg sm:text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all active:scale-95 touch-manipulation"
              onClick={() => setShowWorkoutModal(true)}
            >
              START TRAINING
            </button>
          </div>
        </div>

        <WorkoutPlayerModal isOpen={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} />

        {/* Training opties grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
          {trainings.map((t, i) =>
            i === 0 ? (
              <Link
                key={t.title}
                href={t.href!}
                className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23]/40 flex flex-col gap-3 sm:gap-4 items-start cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:border-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] active:scale-[0.98] touch-manipulation"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label="icon">{t.icon}</span>
                  <span className="text-lg sm:text-xl font-semibold text-white">{t.title}</span>
                </div>
                <p className="text-[#8BAE5A] text-sm sm:text-base">{t.description}</p>
                <button className="mt-auto w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white font-semibold shadow hover:from-[#f0a14f] hover:to-[#8BAE5A] transition-all text-sm sm:text-base">{t.cta}</button>
              </Link>
            ) : (
              <div key={t.title} className="bg-[#232D1A]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23]/40 flex flex-col gap-3 sm:gap-4 items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label="icon">{t.icon}</span>
                  <span className="text-lg sm:text-xl font-semibold text-white">{t.title}</span>
                </div>
                <p className="text-[#8BAE5A] text-sm sm:text-base">{t.description}</p>
                <button className="mt-auto w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-white font-semibold shadow hover:from-[#f0a14f] hover:to-[#8BAE5A] transition-all text-sm sm:text-base">{t.cta}</button>
              </div>
            )
          )}
        </div>

        <div className="flex flex-col items-stretch sm:items-center gap-4 pt-4 sm:pt-8">
          <Link 
            href="/dashboard/voedingsplannen" 
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-lg sm:text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all active:scale-95 touch-manipulation text-center"
          >
            Bekijk Voedingsplannen
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
} 