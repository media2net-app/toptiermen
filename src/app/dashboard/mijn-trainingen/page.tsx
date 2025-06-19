'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, ChartBarIcon, ShareIcon, PlayIcon, TrophyIcon, FireIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

// Mock training data
const mockTrainingData = {
  '2024-01-15': {
    id: 1,
    name: 'Push Day - Full Body Schema',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { set: 1, weight: 60, reps: 8 },
          { set: 2, weight: 60, reps: 8 },
          { set: 3, weight: 60, reps: 7 }
        ]
      },
      {
        name: 'Overhead Press',
        sets: [
          { set: 1, weight: 40, reps: 10 },
          { set: 2, weight: 40, reps: 9 },
          { set: 3, weight: 40, reps: 8 }
        ]
      }
    ],
    totalVolume: 3240,
    duration: '45 min'
  },
  '2024-01-17': {
    id: 2,
    name: 'Pull Day - Back Focus',
    exercises: [
      {
        name: 'Deadlift',
        sets: [
          { set: 1, weight: 100, reps: 5 },
          { set: 2, weight: 100, reps: 5 },
          { set: 3, weight: 100, reps: 5 }
        ]
      },
      {
        name: 'Barbell Rows',
        sets: [
          { set: 1, weight: 50, reps: 12 },
          { set: 2, weight: 50, reps: 12 },
          { set: 3, weight: 50, reps: 10 }
        ]
      }
    ],
    totalVolume: 4200,
    duration: '50 min'
  },
  '2024-01-19': {
    id: 3,
    name: 'Leg Day - Squat Focus',
    exercises: [
      {
        name: 'Squat',
        sets: [
          { set: 1, weight: 80, reps: 8 },
          { set: 2, weight: 80, reps: 8 },
          { set: 3, weight: 80, reps: 7 }
        ]
      }
    ],
    totalVolume: 1840,
    duration: '35 min'
  }
};

// Mock progressie data voor analyse
const progressData = {
  'Bench Press': [
    { date: '2024-01-01', weight: 55, reps: 8, volume: 440 },
    { date: '2024-01-08', weight: 57.5, reps: 8, volume: 460 },
    { date: '2024-01-15', weight: 60, reps: 8, volume: 480 },
  ],
  'Deadlift': [
    { date: '2024-01-01', weight: 90, reps: 5, volume: 450 },
    { date: '2024-01-08', weight: 95, reps: 5, volume: 475 },
    { date: '2024-01-17', weight: 100, reps: 5, volume: 500 },
  ],
  'Squat': [
    { date: '2024-01-01', weight: 70, reps: 8, volume: 560 },
    { date: '2024-01-08', weight: 75, reps: 8, volume: 600 },
    { date: '2024-01-19', weight: 80, reps: 8, volume: 640 },
  ]
};

export default function MijnTrainingen() {
  const [activeView, setActiveView] = useState<'calendar' | 'analysis'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedExercise, setSelectedExercise] = useState('Bench Press');
  const [analysisMetric, setAnalysisMetric] = useState<'weight' | 'volume' | 'reps'>('weight');

  // Maandstatistieken berekenen
  const getMonthStats = () => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    let totalTrainings = 0;
    let totalVolume = 0;
    let mostImprovedExercise = 'Geen data';
    
    Object.entries(mockTrainingData).forEach(([date, training]) => {
      const trainingDate = new Date(date);
      if (trainingDate >= monthStart && trainingDate <= monthEnd) {
        totalTrainings++;
        totalVolume += training.totalVolume;
      }
    });
    
    return { totalTrainings, totalVolume, mostImprovedExercise };
  };

  // Kalender genereren
  const generateCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || calendar.length < 42) {
      const dateString = currentDate.toISOString().split('T')[0];
      const hasTraining = mockTrainingData[dateString as keyof typeof mockTrainingData];
      
      calendar.push({
        date: new Date(currentDate),
        dateString,
        hasTraining,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  };

  const calendar = generateCalendar();
  const monthStats = getMonthStats();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDateClick = (dateString: string) => {
    if (mockTrainingData[dateString as keyof typeof mockTrainingData]) {
      setSelectedDate(dateString);
    }
  };

  const repeatTraining = () => {
    toast.success('🏋️‍♂️ Training wordt geladen in de Workout Speler...');
    // Hier zou de link naar de Workout Speler komen
  };

  const shareTraining = () => {
    toast.success('🔥 Training gedeeld op de Social Feed!');
    // Hier zou de social feed integratie komen
  };

  const startEmptyTraining = () => {
    toast.info('💪 Start een nieuwe training in de Workout Speler');
    // Hier zou de link naar de Workout Speler komen
  };

  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mijn Trainingen</h1>
            <p className="text-[#8BAE5A] text-lg">Trainingsgeschiedenis en analyse</p>
          </div>
          <button 
            onClick={startEmptyTraining}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-bold text-lg shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all border border-[#8BAE5A] flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Start Lege Training
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeView === 'calendar' ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
          >
            <CalendarIcon className="w-5 h-5" />
            Kalenderweergave
          </button>
          <button 
            onClick={() => setActiveView('analysis')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeView === 'analysis' ? 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] shadow' : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#2A341F]'}`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Analyse
          </button>
        </div>

        {activeView === 'calendar' && (
          <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
            {/* Maandstatistieken Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#181F17] rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8BAE5A]">{monthStats.totalTrainings}</div>
                <div className="text-sm text-[#8BAE5A]/80">Trainingen deze maand</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FFD700]">{monthStats.totalVolume.toLocaleString()}</div>
                <div className="text-sm text-[#8BAE5A]/80">kg getild totaal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#f0a14f]">{monthStats.mostImprovedExercise}</div>
                <div className="text-sm text-[#8BAE5A]/80">Meest gevorderd</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#B6C948]">12</div>
                <div className="text-sm text-[#8BAE5A]/80">Dagen streak</div>
              </div>
            </div>

            {/* Kalender Navigatie */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="text-[#8BAE5A] hover:text-white"
              >
                ← Vorige
              </button>
              <h2 className="text-xl font-bold text-white">
                {selectedMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="text-[#8BAE5A] hover:text-white"
              >
                Volgende →
              </button>
            </div>

            {/* Kalender Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map(day => (
                <div key={day} className="p-2 text-center text-[#8BAE5A] font-semibold text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(day.dateString)}
                  className={`p-3 h-16 rounded-lg transition-all relative ${
                    day.isToday 
                      ? 'bg-[#FFD700]/20 border-2 border-[#FFD700]' 
                      : day.hasTraining 
                        ? 'bg-[#8BAE5A]/20 border border-[#8BAE5A] hover:bg-[#8BAE5A]/30' 
                        : 'bg-[#181F17] border border-[#3A4D23] hover:bg-[#2A341F]'
                  } ${!day.isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <div className={`text-sm ${day.isCurrentMonth ? 'text-white' : 'text-[#8BAE5A]/50'}`}>
                    {day.date.getDate()}
                  </div>
                  {day.hasTraining && (
                    <div className="absolute bottom-1 right-1 text-[#8BAE5A] text-xs">
                      🏋️‍♂️
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeView === 'analysis' && (
          <div className="space-y-6">
            {/* Oefening Progressie */}
            <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Oefening Progressie
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="rounded-xl bg-[#181F17] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {Object.keys(progressData).map(exercise => (
                    <option key={exercise} value={exercise}>{exercise}</option>
                  ))}
                </select>
                
                <select
                  value={analysisMetric}
                  onChange={(e) => setAnalysisMetric(e.target.value as 'weight' | 'volume' | 'reps')}
                  className="rounded-xl bg-[#181F17] border border-[#3A4D23] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="weight">Gewicht (1RM)</option>
                  <option value="volume">Totaal Volume</option>
                  <option value="reps">Maximale Herhalingen</option>
                </select>
              </div>

              {/* Grafiek Placeholder */}
              <div className="h-64 bg-[#181F17] rounded-xl flex items-center justify-center border border-[#3A4D23]">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-[#8BAE5A]/60 mx-auto mb-2" />
                  <p className="text-[#8BAE5A]/60">Progressie grafiek voor {selectedExercise}</p>
                  <p className="text-[#8BAE5A]/40 text-sm">Toont {analysisMetric} over tijd</p>
                </div>
              </div>
            </div>

            {/* Consistentie Heatmap */}
            <div className="bg-[#232D1A] rounded-2xl shadow-xl p-6 border border-[#3A4D23]">
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5" />
                Consistentie Heatmap
              </h3>
              
              <div className="h-48 bg-[#181F17] rounded-xl flex items-center justify-center border border-[#3A4D23]">
                <div className="text-center">
                  <FireIcon className="w-12 h-12 text-[#8BAE5A]/60 mx-auto mb-2" />
                  <p className="text-[#8BAE5A]/60">Jaarkalender met trainingsfrequentie</p>
                  <p className="text-[#8BAE5A]/40 text-sm">Visualiseert je discipline over tijd</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Detail Modal */}
        {selectedDate && mockTrainingData[selectedDate as keyof typeof mockTrainingData] && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#232D1A] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Training van: {formatDate(new Date(selectedDate))}
                </h2>
                <button 
                  onClick={() => setSelectedDate(null)}
                  className="text-[#8BAE5A] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#8BAE5A] mb-4">
                  {mockTrainingData[selectedDate as keyof typeof mockTrainingData].name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#181F17] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#8BAE5A]">
                      {mockTrainingData[selectedDate as keyof typeof mockTrainingData].totalVolume.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#8BAE5A]/80">kg totaal</div>
                  </div>
                  <div className="bg-[#181F17] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#FFD700]">
                      {mockTrainingData[selectedDate as keyof typeof mockTrainingData].duration}
                    </div>
                    <div className="text-sm text-[#8BAE5A]/80">duur</div>
                  </div>
                  <div className="bg-[#181F17] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#f0a14f]">
                      {mockTrainingData[selectedDate as keyof typeof mockTrainingData].exercises.length}
                    </div>
                    <div className="text-sm text-[#8BAE5A]/80">oefeningen</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockTrainingData[selectedDate as keyof typeof mockTrainingData].exercises.map((exercise, index) => (
                    <div key={index} className="bg-[#181F17] rounded-xl p-4">
                      <h4 className="text-lg font-bold text-white mb-3">{exercise.name}</h4>
                      <div className="space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex justify-between text-sm">
                            <span className="text-[#8BAE5A]">Set {set.set}:</span>
                            <span className="text-white">{set.weight} kg x {set.reps} herhalingen</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={repeatTraining}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold flex items-center justify-center gap-2"
                >
                  <PlayIcon className="w-5 h-5" />
                  Herhaal deze training
                </button>
                <button
                  onClick={shareTraining}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] flex items-center justify-center gap-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  Deel op Social Feed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 