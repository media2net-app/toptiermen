"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { TrophyIcon, FireIcon, ChartBarIcon, ShareIcon, StarIcon } from "@heroicons/react/24/solid";

interface WorkoutDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutData?: any;
}

const mockWorkoutData = {
  duration: 65,
  totalVolume: 2840,
  exercises: [
    { name: "Bench Press", sets: 3, reps: [8, 8, 7], weight: [60, 62.5, 62.5], isPR: false },
    { name: "Incline Dumbbell Press", sets: 3, reps: [10, 10, 9], weight: [22, 24, 24], isPR: true },
    { name: "Tricep Dips", sets: 3, reps: [12, 12, 10], weight: [0, 0, 0], isPR: false }
  ],
  newPRs: [
    { exercise: "Incline Dumbbell Press", weight: "24kg", reps: "10" }
  ],
  energy: 0,
  pump: 0
};

export default function WorkoutDebriefModal({ isOpen, onClose, workoutData }: WorkoutDebriefModalProps) {
  // Use mock data if workoutData is null/undefined
  const data = workoutData || mockWorkoutData;
  
  const [energy, setEnergy] = useState(data.energy || 0);
  const [pump, setPump] = useState(data.pump || 0);
  const [sharing, setSharing] = useState(false);

  const handleShare = () => {
    setSharing(true);
    // Hier zou je de social feed post kunnen maken
    setTimeout(() => {
      setSharing(false);
      onClose();
    }, 2000);
  };

  const renderStars = (rating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange(star)}
            className="text-2xl transition-colors"
          >
            <StarIcon 
              className={`h-6 w-6 ${
                star <= rating 
                  ? 'text-[#FFD700] fill-current' 
                  : 'text-[#3A4D23] hover:text-[#8BAE5A]'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

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
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#232D1A] p-0 text-left shadow-xl transition-all border border-[#8BAE5A]/40">
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] mb-4">
                      <TrophyIcon className="h-8 w-8 text-[#181F17]" />
                    </div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-[#FFD700] mb-2">
                      Workout Voltooid! 🎉
                    </Dialog.Title>
                    <p className="text-[#8BAE5A]">
                      Jouw prestatie vandaag
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#181F17] rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-[#FFD700] mb-1">
                        {data.duration || 0}min
                      </div>
                      <div className="text-[#8BAE5A] text-sm">Duur</div>
                    </div>
                    <div className="bg-[#181F17] rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-[#FFD700] mb-1">
                        {data.totalVolume || 0}kg
                      </div>
                      <div className="text-[#8BAE5A] text-sm">Totaal Volume</div>
                    </div>
                    <div className="bg-[#181F17] rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-[#FFD700] mb-1">
                        {data.exercises?.length || 0}
                      </div>
                      <div className="text-[#8BAE5A] text-sm">Oefeningen</div>
                    </div>
                  </div>

                  {/* New PRs */}
                  {data.newPRs && data.newPRs.length > 0 && (
                    <div className="bg-gradient-to-r from-[#FFD700]/20 to-[#8BAE5A]/20 rounded-xl p-6 mb-6 border border-[#FFD700]/40">
                      <div className="flex items-center gap-2 mb-4">
                        <TrophyIcon className="h-6 w-6 text-[#FFD700]" />
                        <h4 className="text-lg font-bold text-[#FFD700]">
                          Nieuw(e) PR('s)! 🎉
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {data.newPRs.map((pr: any, index: number) => (
                          <div key={index} className="text-[#8BAE5A]">
                            <span className="font-semibold">{pr.exercise}:</span> {pr.weight} @ {pr.reps} reps
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exercise Summary */}
                  {data.exercises && data.exercises.length > 0 && (
                    <div className="bg-[#181F17] rounded-xl p-6 mb-8">
                      <h4 className="text-lg font-bold text-[#8BAE5A] mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5" />
                        Oefeningen Overzicht
                      </h4>
                      <div className="space-y-3">
                        {data.exercises.map((exercise: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#232D1A] rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[#FFD700]">{exercise.name}</span>
                              {exercise.isPR && (
                                <span className="text-xs bg-[#FFD700] text-[#181F17] px-2 py-1 rounded-full font-bold">
                                  PR!
                                </span>
                              )}
                            </div>
                            <div className="text-[#8BAE5A] text-sm">
                              {exercise.sets} sets
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating Section */}
                  <div className="space-y-6 mb-8">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-[#8BAE5A] mb-3">Rate je Sessie</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[#8BAE5A] mb-2">Hoe was je energie?</p>
                          {renderStars(energy, setEnergy)}
                        </div>
                        <div>
                          <p className="text-[#8BAE5A] mb-2">Hoe was de pomp?</p>
                          {renderStars(pump, setPump)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Button */}
                  <div className="text-center">
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {sharing ? (
                        <>
                          <FireIcon className="h-5 w-5 animate-pulse" />
                          Gedeeld op Social Feed!
                        </>
                      ) : (
                        <>
                          <ShareIcon className="h-5 w-5" />
                          Deel op Social Feed
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 