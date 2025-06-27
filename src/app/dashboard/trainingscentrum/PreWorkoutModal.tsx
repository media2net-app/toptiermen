"use client";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlayIcon, PauseIcon, ArrowRightIcon, FireIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import { SparklesIcon } from '@heroicons/react/24/outline';

interface PreWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  trainingType: string;
}

const warmingUpExercises = {
  "Push Day": [
    {
      name: "Armcirkels",
      duration: 30,
      description: "Maak grote cirkels met je armen voorwaarts en achterwaarts",
      focus: "Schouder mobiliteit en bloedtoevoer"
    },
    {
      name: "Heupzwaaien",
      duration: 30,
      description: "Zwaai je benen zijwaarts om je heupen los te maken",
      focus: "Heup mobiliteit en core activatie"
    },
    {
      name: "Schoudermobiliteit",
      duration: 30,
      description: "Roteer je schouders en maak kleine cirkels",
      focus: "Schouder warming-up voor bench press"
    },
    {
      name: "Tricep Stretches",
      duration: 30,
      description: "Strek je armen achter je hoofd en houd vast",
      focus: "Tricep flexibiliteit voor dips"
    }
  ],
  "Pull Day": [
    {
      name: "Armcirkels",
      duration: 30,
      description: "Maak grote cirkels met je armen voorwaarts en achterwaarts",
      focus: "Schouder mobiliteit en bloedtoevoer"
    },
    {
      name: "Lat Stretches",
      duration: 30,
      description: "Strek je armen omhoog en leun naar achteren",
      focus: "Lat warming-up voor pull-ups"
    },
    {
      name: "Grip Warming",
      duration: 30,
      description: "Knijp en ontspan je handen herhaaldelijk",
      focus: "Grip kracht voor deadlifts"
    }
  ],
  "Leg Day": [
    {
      name: "Been Swings",
      duration: 30,
      description: "Zwaai je benen voorwaarts en achterwaarts",
      focus: "Hamstring en quad warming-up"
    },
    {
      name: "Ankle Mobility",
      duration: 30,
      description: "Roteer je enkels en maak kleine cirkels",
      focus: "Enkel mobiliteit voor squats"
    },
    {
      name: "Hip Circles",
      duration: 30,
      description: "Maak cirkels met je heupen",
      focus: "Heup mobiliteit voor deadlifts"
    }
  ]
};

const mindMuscleTips = {
  "Bench Press": "Pro Tip: Voordat je begint, knijp 5 seconden hard in de stang en focus op het 'samenknijpen' van je borstspieren. Dit activeert de juiste spiervezels en verhoogt de effectiviteit van elke herhaling.",
  "Squat": "Pro Tip: Plaats je handen op je heupen en voel hoe je core spant. Focus op het 'samenknijpen' van je buikspieren voordat je naar beneden gaat.",
  "Deadlift": "Pro Tip: Stel je voor dat je de vloer wegduwt met je voeten. Focus op het activeren van je hamstrings en glutes voordat je de stang optilt."
};

export default function PreWorkoutModal({ isOpen, onClose, onComplete, trainingType }: PreWorkoutModalProps) {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'warming' | 'mind-muscle' | 'complete'>('welcome');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const exercises = warmingUpExercises[trainingType as keyof typeof warmingUpExercises] || warmingUpExercises["Push Day"];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (currentExercise < exercises.length - 1) {
              setCurrentExercise(prev => prev + 1);
              return exercises[currentExercise + 1].duration;
            } else {
              setIsPlaying(false);
              setCurrentStep('mind-muscle');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeLeft, currentExercise, exercises]);

  const handleStartWarming = () => {
    setCurrentStep('warming');
    setCurrentExercise(0);
    setTimeLeft(exercises[0].duration);
    setIsPlaying(true);
  };

  const handleSkipWarming = () => {
    setCurrentStep('mind-muscle');
  };

  const handleComplete = () => {
    onComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#232D1A] p-6 text-left align-middle shadow-xl border border-[#8BAE5A]/40">
                {currentStep === 'welcome' && (
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#8BAE5A]/20 mb-4">
                      <FireIcon className="h-6 w-6 text-[#8BAE5A]" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-2">
                      Klaar om te knallen!
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-[#A3AED6] mb-6">
                        Wil je eerst een dynamische warming-up van 5 minuten doen die specifiek is afgestemd op je {trainingType} van vandaag?
                      </p>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleStartWarming}
                          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all"
                        >
                          Ja, start warming-up
                        </button>
                        <button
                          onClick={handleSkipWarming}
                          className="w-full px-4 py-3 rounded-xl bg-[#3A4D23] text-[#8BAE5A] font-semibold hover:bg-[#4A5D33] transition-all"
                        >
                          Overslaan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'warming' && (
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#8BAE5A]/20 mb-4">
                      <PlayIcon className="h-6 w-6 text-[#8BAE5A]" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-2">
                      {exercises[currentExercise].name}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-[#A3AED6] mb-4">
                        {exercises[currentExercise].description}
                      </p>
                      <p className="text-xs text-[#8BAE5A] mb-6">
                        Focus: {exercises[currentExercise].focus}
                      </p>
                      
                      <div className="mb-6">
                        <div className="text-3xl font-bold text-[#FFD700] mb-2">
                          {formatTime(timeLeft)}
                        </div>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="px-4 py-2 rounded-lg bg-[#8BAE5A] text-white hover:bg-[#9BBE6A] transition-all"
                          >
                            {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center gap-1 mb-4">
                        {exercises.map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 rounded-full ${
                              index <= currentExercise ? 'bg-[#8BAE5A]' : 'bg-[#3A4D23]'
                            } ${index === currentExercise ? 'w-8' : 'w-4'} transition-all`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleSkipWarming}
                        className="w-full px-4 py-2 rounded-xl bg-[#3A4D23] text-[#8BAE5A] font-semibold hover:bg-[#4A5D33] transition-all"
                      >
                        Overslaan
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 'mind-muscle' && (
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#8BAE5A]/20 mb-4">
                      <LightBulbIcon className="h-6 w-6 text-[#8BAE5A]" />
                    </div>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-2">
                      Mind-Muscle Connectie
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-[#A3AED6] mb-6">
                        {mindMuscleTips["Bench Press"]}
                      </p>
                      <button
                        onClick={handleComplete}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all flex items-center justify-center gap-2"
                      >
                        Start Training
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 