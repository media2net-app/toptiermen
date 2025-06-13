'use client';

import { useState } from 'react';
import Link from 'next/link';

// Dummy data voor schema's
const schemas = [
  { id: 'droogtrainen', name: 'Droogtrainen (5x per week)', active: true, description: 'Op basis van jouw doelstelling: Vetpercentage verlagen & spierdefinitie behouden.' },
  { id: 'spiermassa', name: 'Spiermassa opbouwen (3x per week)', active: false, description: 'Op basis van jouw doelstelling: Spiermassa opbouwen.' },
  { id: 'fullbody', name: 'Full body basis (3x per week)', active: false, description: 'Op basis van jouw doelstelling: Algemene fitheid.' },
  { id: 'geavanceerd', name: 'Geavanceerde routine (elke dag)', active: false, description: 'Op basis van jouw doelstelling: Geavanceerde fitheid.' },
  { id: 'home', name: 'Home workouts', active: false, description: 'Op basis van jouw doelstelling: Thuis trainen.' },
];

// Dummy data voor weekoverzicht
const weekDays = [
  { day: 'Ma', focus: 'Borst & Triceps', exercises: [
    { name: 'Bench Press', sets: '4x8-10', completed: false },
    { name: 'Incline Dumbbell Press', sets: '3x10-12', completed: false },
    { name: 'Cable Flyes', sets: '3x12-15', completed: false },
    { name: 'Tricep Pushdowns', sets: '3x12-15', completed: false },
    { name: 'Skull Crushers', sets: '3x10-12', completed: false },
  ]},
  { day: 'Di', focus: 'Rug & Biceps', exercises: [
    { name: 'Deadlift', sets: '4x6-8', completed: false },
    { name: 'Pull-ups', sets: '3x8-10', completed: false },
    { name: 'Bent Over Rows', sets: '3x10-12', completed: false },
    { name: 'Bicep Curls', sets: '3x12-15', completed: false },
    { name: 'Hammer Curls', sets: '3x10-12', completed: false },
  ]},
  { day: 'Wo', focus: 'Benen & Schouders', exercises: [
    { name: 'Squats', sets: '4x8-10', completed: false },
    { name: 'Leg Press', sets: '3x10-12', completed: false },
    { name: 'Lunges', sets: '3x12-15', completed: false },
    { name: 'Shoulder Press', sets: '3x10-12', completed: false },
    { name: 'Lateral Raises', sets: '3x12-15', completed: false },
  ]},
  { day: 'Do', focus: 'Rust', exercises: [] },
  { day: 'Vr', focus: 'Borst & Triceps', exercises: [
    { name: 'Bench Press', sets: '4x8-10', completed: false },
    { name: 'Incline Dumbbell Press', sets: '3x10-12', completed: false },
    { name: 'Cable Flyes', sets: '3x12-15', completed: false },
    { name: 'Tricep Pushdowns', sets: '3x12-15', completed: false },
    { name: 'Skull Crushers', sets: '3x10-12', completed: false },
  ]},
  { day: 'Za', focus: 'Rug & Biceps', exercises: [
    { name: 'Deadlift', sets: '4x6-8', completed: false },
    { name: 'Pull-ups', sets: '3x8-10', completed: false },
    { name: 'Bent Over Rows', sets: '3x10-12', completed: false },
    { name: 'Bicep Curls', sets: '3x12-15', completed: false },
    { name: 'Hammer Curls', sets: '3x10-12', completed: false },
  ]},
  { day: 'Zo', focus: 'Rust', exercises: [] },
];

export default function GymSchema() {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [activeSchema, setActiveSchema] = useState('droogtrainen');

  const toggleExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedDays = [...weekDays];
    updatedDays[dayIndex].exercises[exerciseIndex].completed = !updatedDays[dayIndex].exercises[exerciseIndex].completed;
    // Hier zou je normaal de state updaten, maar voor nu gebruiken we dummy data
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40">
        <h1 className="text-3xl font-bold text-white mb-2">Gym Workout Schema</h1>
        <p className="text-[#A3AED6] mb-4">Op basis van jouw doelstelling: Vetpercentage verlagen & spierdefinitie behouden.</p>
        <Link href="/dashboard/profiel" className="text-[#C49C48] hover:underline">Wijzig doelstelling</Link>
      </div>

      {/* Schema Tabs */}
      <div className="flex flex-wrap gap-2">
        {schemas.map((schema) => (
          <div key={schema.id} className={`px-4 py-2 rounded-lg ${schema.id === activeSchema ? 'bg-[#C49C48] text-white' : 'bg-[#232042]/80 text-[#A3AED6]'} cursor-pointer`} onClick={() => setActiveSchema(schema.id)}>
            {schema.name} {schema.id === activeSchema && '✅'}
          </div>
        ))}
      </div>

      {/* Weekoverzicht */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div key={index} className="bg-[#232042]/80 rounded-lg p-2 text-center cursor-pointer" onClick={() => setActiveDay(index)}>
            <div className="font-bold text-white">{day.day}</div>
            <div className="text-xs text-[#A3AED6]">{day.focus}</div>
          </div>
        ))}
      </div>

      {/* Details per dag */}
      {activeDay !== null && (
        <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40">
          <h2 className="text-2xl font-bold text-white mb-4">{weekDays[activeDay].day} – {weekDays[activeDay].focus}</h2>
          <ul className="list-disc pl-5 text-white space-y-2">
            {weekDays[activeDay].exercises.map((exercise, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <input type="checkbox" checked={exercise.completed} onChange={() => toggleExercise(activeDay, idx)} className="w-4 h-4" />
                <span>{exercise.name} – {exercise.sets}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 bg-[#C49C48] text-white px-4 py-2 rounded-lg">Instructievideo</button>
          <textarea className="mt-4 w-full p-2 bg-[#393053] text-white rounded-lg" placeholder="Notities..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
        </div>
      )}

      {/* Extra functies */}
      <div className="flex flex-wrap gap-4 mt-4">
        <button className="bg-[#C49C48] text-white px-4 py-2 rounded-lg">Herstart schema</button>
        <button className="bg-[#C49C48] text-white px-4 py-2 rounded-lg">Wijzig doelstelling</button>
        <button className="bg-[#C49C48] text-white px-4 py-2 rounded-lg">Download als PDF</button>
        <button className="bg-[#C49C48] text-white px-4 py-2 rounded-lg">Toon voortgang</button>
      </div>
    </div>
  );
} 