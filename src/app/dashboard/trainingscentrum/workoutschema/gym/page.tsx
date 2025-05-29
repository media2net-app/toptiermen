'use client';

const weekSchedule = [
  {
    day: 'Maandag',
    focus: 'Push (Borst, Schouders, Triceps)',
    exercises: [
      { name: 'Bench Press', sets: '4x8-10' },
      { name: 'Shoulder Press', sets: '3x10' },
      { name: 'Incline Dumbbell Press', sets: '3x10' },
      { name: 'Tricep Dips', sets: '3x12' },
      { name: 'Cable Fly', sets: '3x15' },
      { name: 'Cardio: HIIT', sets: '15 min' },
    ],
  },
  {
    day: 'Dinsdag',
    focus: 'Pull (Rug, Biceps)',
    exercises: [
      { name: 'Pull-ups', sets: '4x8' },
      { name: 'Barbell Row', sets: '3x10' },
      { name: 'Face Pull', sets: '3x15' },
      { name: 'Bicep Curl', sets: '3x12' },
      { name: 'Lat Pulldown', sets: '3x10' },
      { name: 'Cardio: LISS', sets: '20 min' },
    ],
  },
  {
    day: 'Woensdag',
    focus: 'Legs (Benen, Core)',
    exercises: [
      { name: 'Squat', sets: '4x8-10' },
      { name: 'Leg Press', sets: '3x12' },
      { name: 'Lunges', sets: '3x12' },
      { name: 'Leg Curl', sets: '3x15' },
      { name: 'Plank', sets: '3x1 min' },
      { name: 'Cardio: HIIT', sets: '10 min' },
    ],
  },
  {
    day: 'Donderdag',
    focus: 'Push (Borst, Schouders, Triceps)',
    exercises: [
      { name: 'Dumbbell Press', sets: '4x10' },
      { name: 'Lateral Raise', sets: '3x15' },
      { name: 'Chest Press Machine', sets: '3x10' },
      { name: 'Tricep Pushdown', sets: '3x12' },
      { name: 'Push-ups', sets: '3x max' },
      { name: 'Cardio: LISS', sets: '20 min' },
    ],
  },
  {
    day: 'Vrijdag',
    focus: 'Pull (Rug, Biceps)',
    exercises: [
      { name: 'Deadlift', sets: '4x6-8' },
      { name: 'Seated Row', sets: '3x10' },
      { name: 'Hammer Curl', sets: '3x12' },
      { name: 'Reverse Fly', sets: '3x15' },
      { name: 'Chin-ups', sets: '3x8' },
      { name: 'Cardio: HIIT', sets: '15 min' },
    ],
  },
  {
    day: 'Zaterdag',
    focus: 'Legs (Benen, Core)',
    exercises: [
      { name: 'Leg Extension', sets: '4x12' },
      { name: 'Romanian Deadlift', sets: '3x10' },
      { name: 'Calf Raise', sets: '3x15' },
      { name: 'Ab Wheel', sets: '3x10' },
      { name: 'Side Plank', sets: '3x30s' },
      { name: 'Cardio: LISS', sets: '20 min' },
    ],
  },
  {
    day: 'Zondag',
    focus: 'Rust / Actief Herstel',
    exercises: [
      { name: 'Wandelen of mobiliteit', sets: '30-60 min' },
      { name: 'Optioneel: Lichte Cardio', sets: '15 min' },
    ],
  },
];

export default function GymSchema() {
  return (
    <div className="p-6 md:p-12">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Gym Schema – Droogtrainen</h1>
      <p className="text-[#A3AED6] text-lg mb-8">Maximaliseer vetverlies en behoud spiermassa met dit weekschema</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {weekSchedule.map((day) => (
          <div key={day.day} className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-white">{day.day}</span>
              <span className="text-[#A3AED6] text-sm">{day.focus}</span>
            </div>
            <ul className="list-disc list-inside text-[#A3AED6] text-sm ml-2">
              {day.exercises.map((ex) => (
                <li key={ex.name} className="flex justify-between">
                  <span>{ex.name}</span>
                  <span className="font-mono text-white ml-4">{ex.sets}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 