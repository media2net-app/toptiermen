"use client";
import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
const WorkoutPlayerModal = dynamic(() => import("../../WorkoutPlayerModal"), { ssr: false });

const days = [
  {
    label: "Dag 1: Full Body Outdoor",
    title: "Full Body - Outdoor Kracht & Conditie",
    exercises: [
      {
        name: "Push-up",
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 15 reps",
        rest: "60s",
        last: "15 reps @ BW",
        notes: "Volledig uitstrekken, core aanspannen",
      },
      {
        name: "Pull-up aan rekstok",
        img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 8 reps",
        rest: "90s",
        last: "8 reps @ BW",
        notes: "Volledig uithangen, kin boven de stang",
      },
      {
        name: "Squat Jump",
        img: "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 12 reps",
        rest: "60s",
        last: "12 reps @ BW",
        notes: "Explosief omhoog springen",
      },
      {
        name: "Dips op bankje",
        img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 12 reps",
        rest: "60s",
        last: "12 reps @ BW",
        notes: "Elleboog naar achter, schouders laag",
      },
    ],
  },
  {
    label: "Dag 2: Cardio & Core",
    title: "Cardio & Core - Buiten",
    exercises: [
      {
        name: "Hardlopen (interval)",
        img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
        sets: "5 x 400m sprint / 2 min rust",
        rest: "2 min",
        last: "5 x 400m @ 1:30",
        notes: "Volle inspanning, herstel goed",
      },
      {
        name: "Plank",
        img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 1 min",
        rest: "60s",
        last: "1 min",
        notes: "Heupen laag, rug recht",
      },
      {
        name: "Mountain Climbers",
        img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 30 sec",
        rest: "45s",
        last: "30 sec",
        notes: "Tempo hoog houden",
      },
      {
        name: "Burpees",
        img: "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 12 reps",
        rest: "60s",
        last: "12 reps",
        notes: "Explosief, volledige beweging",
      },
    ],
  },
  {
    label: "Dag 3: Mobility & Stretch",
    title: "Mobility & Stretch - Buiten Herstel",
    exercises: [
      {
        name: "Walking Lunges",
        img: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 20 stappen",
        rest: "60s",
        last: "20 stappen",
        notes: "Grote passen, knie niet voorbij teen",
      },
      {
        name: "Standing Toe Touch",
        img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 30 sec",
        rest: "30s",
        last: "30 sec",
        notes: "Rustig doorademen, niet veren",
      },
      {
        name: "Arm Circles",
        img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 30 sec",
        rest: "30s",
        last: "30 sec",
        notes: "Grote cirkels, schouders ontspannen",
      },
      {
        name: "Cat-Cow Stretch",
        img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
        sets: "3 sets x 10 reps",
        rest: "30s",
        last: "10 reps",
        notes: "Rustig tempo, focus op mobiliteit",
      },
    ],
  },
];

export default function OutdoorSchema() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSchema, setActiveSchema] = useState(false);
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
        { name: `${ex.name} (Makkelijker)`, reason: 'Niveau aanpassen' },
        { name: `${ex.name} (Zwaarder)`, reason: 'Meer uitdaging nodig' }
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Outdoor Schema: Full Body & Conditie</h1>
          <p className="text-[#A3AED6] text-lg mb-2">Perfect voor trainen in de buitenlucht, zonder apparatuur.</p>
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
        onComplete={(data) => {
          console.log('Workout completed:', data);
          setShowWorkoutModal(false);
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
                <div className="w-16 h-16 rounded-lg bg-[#232D1A] flex items-center justify-center overflow-hidden cursor-pointer">
                  {/* Thumbnail, klikbaar voor video (voor nu alleen thumbnail) */}
                  <Image src={ex.img} alt={ex.name} width={64} height={64} className="object-contain" />
                </div>
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