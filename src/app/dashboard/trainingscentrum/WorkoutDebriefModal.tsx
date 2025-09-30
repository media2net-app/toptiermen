"use client";
import { useState } from "react";
import ModalBase from "@/components/ui/ModalBase";
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
    <ModalBase isOpen={isOpen} onClose={onClose} zIndexClassName="z-[9999]">
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 w-full max-w-xl text-white">
        <div className="flex items-center gap-2 mb-4">
          <TrophyIcon className="w-6 h-6 text-[#FFD700]" />
          <h3 className="text-lg font-bold">Workout overzicht</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Duur</div>
            <div className="text-xl font-semibold">{data.duration} min</div>
          </div>
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Volume</div>
            <div className="text-xl font-semibold">{data.totalVolume} kg</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-[#8BAE5A] mb-1">Energie</div>
          {renderStars(energy, setEnergy)}
        </div>

        <div className="mb-6">
          <div className="text-sm text-[#8BAE5A] mb-1">Spierpomp</div>
          {renderStars(pump, setPump)}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
          >Sluiten</button>
          <button
            disabled={sharing}
            className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg font-semibold hover:bg-[#A6C97B] transition-colors disabled:opacity-50"
          >{sharing ? 'Delen...' : 'Deel resultaat'}</button>
        </div>
      </div>
    </ModalBase>
  );
}