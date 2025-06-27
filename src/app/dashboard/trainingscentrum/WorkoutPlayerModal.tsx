"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowPathIcon, LightBulbIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const mockTraining = {
  name: "Push Day",
  exercises: [
    {
      name: "Bench Press",
      video: "/videos/bench-press.gif",
      instructions: [
        "Voeten plat op de grond",
        "Schouderbladen samenknijpen",
        "Stang laten zakken tot borsthoogte",
        "Volledige extensie bij het uitstoten"
      ],
      alternatives: [
        { name: "Dumbbell Press", reason: "Geen barbell beschikbaar" },
        { name: "Machine Chest Press", reason: "Barbell rack bezet" },
        { name: "Incline Push-ups", reason: "Lichte blessure" }
      ],
      sets: [
        { prevWeight: 60, prevReps: 8, weight: "", reps: "", done: false, feedback: "" },
        { prevWeight: 60, prevReps: 8, weight: "", reps: "", done: false, feedback: "" },
        { prevWeight: 60, prevReps: 8, weight: "", reps: "", done: false, feedback: "" }
      ]
    },
    {
      name: "Incline Dumbbell Press",
      video: "/videos/incline-dumbbell.gif",
      instructions: [
        "Bankje op 30 graden",
        "Dumbbells boven borst uitstoten",
        "Langzaam laten zakken tot schouderhoogte"
      ],
      alternatives: [
        { name: "Incline Barbell Press", reason: "Dumbbells niet beschikbaar" },
        { name: "Decline Push-ups", reason: "Bankje bezet" }
      ],
      sets: [
        { prevWeight: 22, prevReps: 10, weight: "", reps: "", done: false, feedback: "" },
        { prevWeight: 22, prevReps: 10, weight: "", reps: "", done: false, feedback: "" },
        { prevWeight: 22, prevReps: 10, weight: "", reps: "", done: false, feedback: "" }
      ]
    }
  ]
};

type WorkoutPlayerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  trainingData?: typeof mockTraining;
};

export default function WorkoutPlayerModal({ isOpen, onClose, onComplete, trainingData = mockTraining }: WorkoutPlayerModalProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [exercises, setExercises] = useState(trainingData.exercises);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [workoutStartTime] = useState(Date.now());

  // Mock rest-timer
  function handleSetDone(exIdx: number, setIdx: number) {
    const updated = exercises.map((ex, i) =>
      i === exIdx
        ? {
            ...ex,
            sets: ex.sets.map((s, j) =>
              j === setIdx ? { ...s, done: true } : s
            )
          }
        : ex
    );
    setExercises(updated);

    // Generate feedback based on performance
    const currentSet = exercises[exIdx].sets[setIdx];
    const weight = parseFloat(currentSet.weight);
    const reps = parseInt(currentSet.reps);
    const prevWeight = currentSet.prevWeight;
    const prevReps = currentSet.prevReps;

    let feedback = "";
    if (weight > prevWeight && reps >= prevReps) {
      feedback = "Uitstekend! Probeer de volgende set met " + (weight + 2.5) + "kg.";
    } else if (weight === prevWeight && reps > prevReps) {
      feedback = "Goed! Je hebt meer reps gedaan. Probeer nu " + (weight + 2.5) + "kg.";
    } else if (weight === prevWeight && reps === prevReps) {
      feedback = "Steady! Blijf op " + weight + "kg voor de volgende set.";
    } else if (reps < prevReps) {
      feedback = "De laatste rep was een gevecht. Blijf op " + weight + "kg.";
    }

    setCurrentFeedback(feedback);
    setShowFeedback(true);

    setResting(true);
    setRestTime(90);
    const interval = setInterval(() => {
      setRestTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setResting(false);
          return 90;
        }
        return t - 1;
      });
    }, 1000);
  }

  const handleCompleteWorkout = () => {
    const workoutDuration = Math.round((Date.now() - workoutStartTime) / 1000 / 60);
    const totalVolume = exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((setTotal, set) => {
        if (set.done && set.weight && set.reps) {
          return setTotal + (parseFloat(set.weight) * parseInt(set.reps));
        }
        return setTotal;
      }, 0);
    }, 0);

    const workoutData = {
      duration: workoutDuration,
      totalVolume: totalVolume,
      exercises: exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.filter(set => set.done).length,
        reps: exercise.sets.filter(set => set.done).map(set => parseInt(set.reps)),
        weight: exercise.sets.filter(set => set.done).map(set => parseFloat(set.weight)),
        isPR: false // This would be calculated based on user history
      })),
      newPRs: [], // This would be calculated based on user history
      energy: 0,
      pump: 0
    };

    onComplete(workoutData);
  };

  const activeExercise = exercises[activeIdx];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-[#232D1A] p-0 text-left shadow-xl transition-all border border-[#8BAE5A]/40 flex flex-col md:flex-row">
                {/* Oefeningenlijst */}
                <div className="w-full md:w-1/4 bg-[#1B2214] p-4 flex flex-col gap-2 border-r border-[#3A4D23]/40">
                  {exercises.map((ex, i) => (
                    <button
                      key={ex.name}
                      onClick={() => setActiveIdx(i)}
                      className={`text-left px-3 py-2 rounded-xl font-semibold transition-all ${
                        i === activeIdx
                          ? 'bg-gradient-to-r from-[#8BAE5A]/30 to-[#FFD700]/10 text-[#FFD700]' 
                          : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#8BAE5A]/10'
                      }`}
                    >
                      {i + 1}. {ex.name}
                    </button>
                  ))}
                </div>
                {/* Actieve oefening */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#FFD700] mb-2">{activeExercise.name}</h2>
                    <button
                      onClick={() => setShowAlternatives(true)}
                      className="p-2 rounded-lg bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#8BAE5A] hover:text-[#181F17] transition-all"
                      title="Alternatieve oefeningen"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Video/GIF */}
                    <div className="w-full md:w-64 h-40 bg-[#181F17] rounded-xl flex items-center justify-center overflow-hidden">
                      <span className="text-[#8BAE5A]">[Video/GIF]</span>
                    </div>
                    {/* Instructies */}
                    <ul className="flex-1 list-disc pl-5 text-[#8BAE5A] text-sm">
                      {activeExercise.instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                  {/* Sets loggen */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">Sets loggen</h3>
                    <div className="flex flex-col gap-2">
                      {activeExercise.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-3">
                          <span className="text-[#FFD700] text-sm">Set {setIdx + 1}:</span>
                          <span className="text-[#8BAE5A]/70 text-xs">Vorige: {set.prevReps}x @ {set.prevWeight}kg</span>
                          <input
                            type="number"
                            placeholder="Gewicht (kg)"
                            className="w-20 px-2 py-1 rounded bg-[#181F17] border border-[#3A4D23]/40 text-white text-sm focus:outline-none"
                            value={set.weight}
                            onChange={e => {
                              const val = e.target.value;
                              setExercises(exs => exs.map((ex, i) =>
                                i === activeIdx
                                  ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, weight: val } : s) }
                                  : ex
                              ));
                            }}
                            disabled={set.done}
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            className="w-16 px-2 py-1 rounded bg-[#181F17] border border-[#3A4D23]/40 text-white text-sm focus:outline-none"
                            value={set.reps}
                            onChange={e => {
                              const val = e.target.value;
                              setExercises(exs => exs.map((ex, i) =>
                                i === activeIdx
                                  ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, reps: val } : s) }
                                  : ex
                              ));
                            }}
                            disabled={set.done}
                          />
                          <button
                            className={`ml-2 px-3 py-1 rounded-xl text-xs font-bold ${set.done ? 'bg-[#8BAE5A]/30 text-[#8BAE5A]' : 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] hover:from-[#FFD700] hover:to-[#8BAE5A]'}`}
                            onClick={() => handleSetDone(activeIdx, setIdx)}
                            disabled={set.done || resting}
                          >
                            {set.done ? '✓' : 'Afvinken'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Rust-timer */}
                  {resting && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[#FFD700] font-bold">Rust:</span>
                      <span className="text-[#8BAE5A] text-lg font-mono">{restTime}s</span>
                    </div>
                  )}
                  {/* Voltooi training knop */}
                  <div className="mt-8 flex justify-end">
                    <button
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] text-lg font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all"
                      onClick={handleCompleteWorkout}
                    >
                      VOLTOOI TRAINING
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#8BAE5A]/40 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <LightBulbIcon className="h-6 w-6 text-[#FFD700]" />
                <h3 className="text-lg font-bold text-[#FFD700]">Prestatie Feedback</h3>
              </div>
              <p className="text-[#8BAE5A] mb-6">{currentFeedback}</p>
              <button
                onClick={() => setShowFeedback(false)}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}

        {/* Alternatives Modal */}
        {showAlternatives && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#8BAE5A]/40 max-w-md w-full">
              <h3 className="text-lg font-bold text-[#FFD700] mb-4">
                {activeExercise.name} vervangen?
              </h3>
              <p className="text-[#8BAE5A] mb-4">
                Probeer een van deze alternatieven die dezelfde spiergroep traint:
              </p>
              <div className="space-y-3 mb-6">
                {activeExercise.alternatives.map((alt, index) => (
                  <div key={index} className="bg-[#181F17] rounded-lg p-3">
                    <div className="font-semibold text-[#8BAE5A]">{alt.name}</div>
                    <div className="text-sm text-[#8BAE5A]/70">{alt.reason}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#3A4D23] text-[#8BAE5A] font-semibold"
                >
                  Blijf bij origineel
                </button>
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold"
                >
                  Kies alternatief
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Transition.Root>
  );
} 