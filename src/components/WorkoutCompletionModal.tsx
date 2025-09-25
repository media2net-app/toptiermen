'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, TrophyIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

interface WorkoutCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  workoutTime: number;
  totalExercises: number;
  completedExercises: number;
}

export default function WorkoutCompletionModal({
  isOpen,
  onClose,
  onComplete,
  workoutTime,
  totalExercises,
  completedExercises
}: WorkoutCompletionModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = Math.round((completedExercises / totalExercises) * 100);

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 p-8 text-left align-middle shadow-xl transition-all w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] mb-4">
                    <TrophyIcon className="h-8 w-8 text-[#181F17]" />
                  </div>
                  <Dialog.Title as="h3" className="text-2xl font-bold text-white mb-2">
                    Workout Voltooid! 🎉
                  </Dialog.Title>
                  <p className="text-[#8BAE5A] text-lg">
                    Gefeliciteerd! Je hebt alle oefeningen afgerond.
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-[#0F1419]/50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                      <span className="text-white font-medium">Oefeningen</span>
                    </div>
                    <span className="text-[#8BAE5A] font-bold">
                      {completedExercises}/{totalExercises}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F1419]/50 rounded-lg">
                    <div className="flex items-center">
                      <ClockIcon className="h-6 w-6 text-[#FFD700] mr-3" />
                      <span className="text-white font-medium">Tijd</span>
                    </div>
                    <span className="text-[#FFD700] font-bold">
                      {formatTime(workoutTime)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0F1419]/50 rounded-lg">
                    <div className="flex items-center">
                      <FireIcon className="h-6 w-6 text-[#f0a14f] mr-3" />
                      <span className="text-white font-medium">Voltooiing</span>
                    </div>
                    <span className="text-[#f0a14f] font-bold">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Voortgang</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-[#0F1419] rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-3 bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#4A5D33] transition-colors font-medium rounded-lg"
                    onClick={onClose}
                  >
                    Terug naar Training
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200"
                    onClick={onComplete}
                  >
                    Workout Afronden
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
