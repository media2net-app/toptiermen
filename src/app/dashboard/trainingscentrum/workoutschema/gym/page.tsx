"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamicImport from "next/dynamic";
const WorkoutPlayerModal = dynamicImport(() => import("../../WorkoutPlayerModal"), { ssr: false });

const days = [
  {
    label: "Dag 1: Push",
    title: "Push Day - Focus op Borst, Schouders & Triceps",
    exercises: [
      {
        name: "Bench Press",
        img: "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 6-8 reps",
        rest: "90-120s",
        last: "8 reps @ 60kg",
        notes: "Focus op langzaam zakken",
      },
      {
        name: "Incline Dumbbell Press",
        img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 8-10 reps",
        rest: "90s",
        last: "10 reps @ 22kg",
        notes: "Volledig uitstoten",
      },
      {
        name: "Overhead Press",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 8 reps",
        rest: "90s",
        last: "8 reps @ 35kg",
        notes: "Core aanspannen",
      },
      {
        name: "Tricep Pushdown",
        img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 12 reps",
        rest: "60s",
        last: "12 reps @ 30kg",
        notes: "Elleboog stil houden",
      },
    ],
  },
  {
    label: "Dag 2: Pull",
    title: "Pull Day - Focus op Rug & Biceps",
    exercises: [
      {
        name: "Deadlift",
        img: "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 5 reps",
        rest: "120s",
        last: "5 reps @ 100kg",
        notes: "Rug recht houden",
      },
      {
        name: "Pull-up",
        img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 8 reps",
        rest: "90s",
        last: "8 reps @ BW",
        notes: "Volledig uithangen",
      },
      {
        name: "Barbell Row",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 10 reps",
        rest: "90s",
        last: "10 reps @ 50kg",
        notes: "Explosief optrekken",
      },
      {
        name: "Bicep Curl",
        img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 12 reps",
        rest: "60s",
        last: "12 reps @ 14kg",
        notes: "Polsen recht houden",
      },
    ],
  },
  {
    label: "Dag 3: Legs",
    title: "Leg Day - Focus op Benen & Core",
    exercises: [
      {
        name: "Squat",
        img: "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80",
        sets: "4 sets x 6-8 reps",
        rest: "120s",
        last: "8 reps @ 80kg",
        notes: "Diep zakken",
      },
      {
        name: "Leg Press",
        img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 10 reps",
        rest: "90s",
        last: "10 reps @ 140kg",
        notes: "Voeten hoog op platform",
      },
      {
        name: "Lunge",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 12 reps",
        rest: "60s",
        last: "12 reps @ 20kg",
        notes: "Knie niet voorbij teen",
      },
      {
        name: "Calf Raise",
        img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 15 reps",
        rest: "45s",
        last: "15 reps @ 40kg",
        notes: "Top vasthouden",
      },
    ],
  },
];

export default function GymSchema() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [activeSchema, setActiveSchema] = useState(true);
  const [notes, setNotes] = useState<string[]>(days.map(() => ""));
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  // Bouw trainingData voor de modal op basis van de actieve dag
  const trainingData = {
    name: days[activeTab].title,
    exercises: days[activeTab].exercises.map(ex => ({
      name: ex.name,
      video: ex.img,
      instructions: [ex.notes],
      alternatives: [
        { name: `${ex.name} (Machine)`, reason: 'Vrije gewichten niet beschikbaar' },
        { name: `${ex.name} (Lichter)`, reason: 'Nog niet sterk genoeg' }
      ],
      sets: [
        { prevWeight: Number(ex.last.split('@')[1]?.replace('kg', '').trim()) || 0, prevReps: Number(ex.last.split('reps')[0]?.trim()) || 0, weight: '', reps: '', done: false, feedback: '' },
        { prevWeight: Number(ex.last.split('@')[1]?.replace('kg', '').trim()) || 0, prevReps: Number(ex.last.split('reps')[0]?.trim()) || 0, weight: '', reps: '', done: false, feedback: '' },
        { prevWeight: Number(ex.last.split('@')[1]?.replace('kg', '').trim()) || 0, prevReps: Number(ex.last.split('reps')[0]?.trim()) || 0, weight: '', reps: '', done: false, feedback: '' }
      ]
    }))
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="bg-[#232D1A]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gym Schema: Full Body Krachttraining</h1>
          <p className="text-[#A3AED6] text-lg mb-2">Ontworpen voor maximale spiergroei en krachttoename.</p>
          <div className="flex gap-3 mt-2">
            <button
              className={`px-4 py-2 rounded-xl font-semibold shadow transition-all ${activeSchema ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17]' : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'}`}
              onClick={() => setActiveSchema(true)}
            >
              Kies dit als mijn actieve schema
            </button>
            <button className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] font-semibold shadow border border-[#3A4D23]/40 hover:bg-[#FFD700] hover:text-[#181F17] transition-all">
              Mijn Trainingslogboek
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-xl font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all"
            onClick={() => setShowWorkoutModal(true)}>
            START DEZE TRAINING
          </button>
        </div>
      </div>

      <WorkoutPlayerModal 
        isOpen={showWorkoutModal} 
        onClose={() => setShowWorkoutModal(false)} 
        onComplete={async (data) => {
          console.log('Workout completed:', data);
          
          try {
            // Call the workout completion API
            const response = await fetch('/api/workout-sessions/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: `gym_session_${Date.now()}`,
                userId: user?.id,
                schemaId: '22c1e74b-62b0-433e-9e80-e14f72706a95', // Rick's active schema
                dayNumber: activeTab + 1, // Convert tab index to day number
                rating: 5,
                notes: `Gym workout completed: ${data.duration} minutes, ${data.totalVolume}kg total volume`
              })
            });

            if (response.ok) {
              console.log('✅ Workout completion saved successfully');
              toast.success('Workout voltooid! 🎉');
              
              // Close modal and redirect
              setShowWorkoutModal(false);
              router.push('/dashboard/mijn-trainingen');
              
              // Force refresh to show updated progress
              setTimeout(() => {
                window.location.reload();
              }, 100);
            } else {
              console.error('❌ Error saving workout completion:', response.status);
              toast.error('Fout bij opslaan workout completion');
            }
          } catch (error) {
            console.error('❌ Error completing workout:', error);
            toast.error('Fout bij voltooien workout');
          }
        }}
        trainingData={trainingData} 
      />

      {/* Tabbladen per dag */}
      <div className="flex gap-2 mb-4">
        {days.map((d, i) => (
          <button
            key={d.label}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${activeTab === i ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17]' : 'bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23]/40'}`}
            onClick={() => setActiveTab(i)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Oefeningenlijst voor actieve dag */}
      <div className="bg-[#232D1A]/90 rounded-2xl p-6 shadow-xl border border-[#8BAE5A]/40">
        <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">{days[activeTab].title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {days[activeTab].exercises.map((ex, i) => (
            <div key={ex.name} className="bg-[#181F17] rounded-xl p-4 flex flex-col gap-2 shadow border border-[#3A4D23]/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <span className="font-bold text-white text-lg">{ex.name}</span>
                  <div className="text-[#8BAE5A] text-sm">{ex.sets} | Rust: {ex.rest}</div>
                  <div className="text-[#FFD700] text-xs">Vorige keer: {ex.last}</div>
                </div>
              </div>
              <textarea
                className="w-full p-2 bg-[#232D1A] text-white rounded-lg text-sm border border-[#3A4D23]/40"
                placeholder="Notities..."
                value={notes[i]}
                onChange={e => setNotes(n => n.map((val, idx) => idx === i ? e.target.value : val))}
              />
              <div className="text-[#8BAE5A]/70 text-xs">Tip: {ex.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 