'use client';
import ClientLayout from '../../components/ClientLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, CalendarIcon, ChartBarIcon, ShareIcon, PlayIcon, TrophyIcon, FireIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import CalendarHeatmap from 'react-calendar-heatmap';
import type { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
      },
      {
        name: 'Dips',
        sets: [
          { set: 1, weight: 0, reps: 12 },
          { set: 2, weight: 0, reps: 10 },
          { set: 3, weight: 0, reps: 8 }
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
      },
      {
        name: 'Pull-ups',
        sets: [
          { set: 1, weight: 0, reps: 8 },
          { set: 2, weight: 0, reps: 6 },
          { set: 3, weight: 0, reps: 5 }
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
      },
      {
        name: 'Romanian Deadlift',
        sets: [
          { set: 1, weight: 70, reps: 10 },
          { set: 2, weight: 70, reps: 10 },
          { set: 3, weight: 70, reps: 8 }
        ]
      },
      {
        name: 'Leg Press',
        sets: [
          { set: 1, weight: 120, reps: 12 },
          { set: 2, weight: 120, reps: 12 },
          { set: 3, weight: 120, reps: 10 }
        ]
      }
    ],
    totalVolume: 5840,
    duration: '55 min'
  },
  '2024-01-22': {
    id: 4,
    name: 'Upper Body - Strength Focus',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { set: 1, weight: 65, reps: 6 },
          { set: 2, weight: 65, reps: 6 },
          { set: 3, weight: 65, reps: 5 }
        ]
      },
      {
        name: 'Military Press',
        sets: [
          { set: 1, weight: 45, reps: 8 },
          { set: 2, weight: 45, reps: 7 },
          { set: 3, weight: 45, reps: 6 }
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { set: 1, weight: 25, reps: 10 },
          { set: 2, weight: 25, reps: 9 },
          { set: 3, weight: 25, reps: 8 }
        ]
      }
    ],
    totalVolume: 3780,
    duration: '50 min'
  },
  '2024-01-24': {
    id: 5,
    name: 'Back & Biceps',
    exercises: [
      {
        name: 'Deadlift',
        sets: [
          { set: 1, weight: 105, reps: 5 },
          { set: 2, weight: 105, reps: 5 },
          { set: 3, weight: 105, reps: 4 }
        ]
      },
      {
        name: 'Barbell Curls',
        sets: [
          { set: 1, weight: 30, reps: 12 },
          { set: 2, weight: 30, reps: 10 },
          { set: 3, weight: 30, reps: 8 }
        ]
      },
      {
        name: 'Lat Pulldowns',
        sets: [
          { set: 1, weight: 60, reps: 12 },
          { set: 2, weight: 60, reps: 10 },
          { set: 3, weight: 60, reps: 8 }
        ]
      }
    ],
    totalVolume: 4320,
    duration: '45 min'
  },
  '2024-01-26': {
    id: 6,
    name: 'Leg Day - Power Focus',
    exercises: [
      {
        name: 'Squat',
        sets: [
          { set: 1, weight: 85, reps: 6 },
          { set: 2, weight: 85, reps: 6 },
          { set: 3, weight: 85, reps: 5 }
        ]
      },
      {
        name: 'Power Cleans',
        sets: [
          { set: 1, weight: 50, reps: 5 },
          { set: 2, weight: 50, reps: 5 },
          { set: 3, weight: 50, reps: 4 }
        ]
      },
      {
        name: 'Box Jumps',
        sets: [
          { set: 1, weight: 0, reps: 10 },
          { set: 2, weight: 0, reps: 10 },
          { set: 3, weight: 0, reps: 8 }
        ]
      }
    ],
    totalVolume: 3150,
    duration: '40 min'
  },
  '2024-01-29': {
    id: 7,
    name: 'Full Body - Circuit',
    exercises: [
      {
        name: 'Burpees',
        sets: [
          { set: 1, weight: 0, reps: 15 },
          { set: 2, weight: 0, reps: 12 },
          { set: 3, weight: 0, reps: 10 }
        ]
      },
      {
        name: 'Kettlebell Swings',
        sets: [
          { set: 1, weight: 20, reps: 20 },
          { set: 2, weight: 20, reps: 18 },
          { set: 3, weight: 20, reps: 15 }
        ]
      },
      {
        name: 'Mountain Climbers',
        sets: [
          { set: 1, weight: 0, reps: 30 },
          { set: 2, weight: 0, reps: 25 },
          { set: 3, weight: 0, reps: 20 }
        ]
      }
    ],
    totalVolume: 1200,
    duration: '35 min'
  },
  '2024-01-31': {
    id: 8,
    name: 'Strength Training - Max Effort',
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { set: 1, weight: 70, reps: 4 },
          { set: 2, weight: 70, reps: 3 },
          { set: 3, weight: 70, reps: 2 }
        ]
      },
      {
        name: 'Deadlift',
        sets: [
          { set: 1, weight: 110, reps: 3 },
          { set: 2, weight: 110, reps: 2 },
          { set: 3, weight: 110, reps: 1 }
        ]
      },
      {
        name: 'Squat',
        sets: [
          { set: 1, weight: 90, reps: 4 },
          { set: 2, weight: 90, reps: 3 },
          { set: 3, weight: 90, reps: 2 }
        ]
      }
    ],
    totalVolume: 3150,
    duration: '60 min'
  },
  // --- JUNI 2025 ---
  '2025-06-03': {
    id: 101,
    name: 'Push Day - Chest Focus',
    exercises: [
      { name: 'Bench Press', sets: [ { set: 1, weight: 75, reps: 6 }, { set: 2, weight: 75, reps: 5 }, { set: 3, weight: 75, reps: 4 } ] },
      { name: 'Incline Dumbbell Press', sets: [ { set: 1, weight: 30, reps: 10 }, { set: 2, weight: 30, reps: 8 } ] },
      { name: 'Dips', sets: [ { set: 1, weight: 0, reps: 12 }, { set: 2, weight: 0, reps: 10 } ] }
    ],
    totalVolume: 2100,
    duration: '50 min'
  },
  '2025-06-07': {
    id: 102,
    name: 'Leg Day - Strength',
    exercises: [
      { name: 'Squat', sets: [ { set: 1, weight: 95, reps: 5 }, { set: 2, weight: 95, reps: 5 }, { set: 3, weight: 95, reps: 4 } ] },
      { name: 'Leg Press', sets: [ { set: 1, weight: 130, reps: 10 }, { set: 2, weight: 130, reps: 8 } ] },
      { name: 'Calf Raises', sets: [ { set: 1, weight: 60, reps: 15 }, { set: 2, weight: 60, reps: 12 } ] }
    ],
    totalVolume: 3200,
    duration: '55 min'
  },
  '2025-06-12': {
    id: 103,
    name: 'Pull Day - Back & Biceps',
    exercises: [
      { name: 'Deadlift', sets: [ { set: 1, weight: 115, reps: 4 }, { set: 2, weight: 115, reps: 3 } ] },
      { name: 'Barbell Rows', sets: [ { set: 1, weight: 55, reps: 10 }, { set: 2, weight: 55, reps: 8 } ] },
      { name: 'Pull-ups', sets: [ { set: 1, weight: 0, reps: 8 }, { set: 2, weight: 0, reps: 7 } ] }
    ],
    totalVolume: 2100,
    duration: '45 min'
  },
  '2025-06-16': {
    id: 104,
    name: 'Full Body - Conditioning',
    exercises: [
      { name: 'Burpees', sets: [ { set: 1, weight: 0, reps: 20 }, { set: 2, weight: 0, reps: 15 } ] },
      { name: 'Kettlebell Swings', sets: [ { set: 1, weight: 24, reps: 15 }, { set: 2, weight: 24, reps: 12 } ] },
      { name: 'Mountain Climbers', sets: [ { set: 1, weight: 0, reps: 30 }, { set: 2, weight: 0, reps: 25 } ] }
    ],
    totalVolume: 900,
    duration: '35 min'
  },
  '2025-06-21': {
    id: 105,
    name: 'Push Day - Shoulders',
    exercises: [
      { name: 'Overhead Press', sets: [ { set: 1, weight: 50, reps: 8 }, { set: 2, weight: 50, reps: 7 } ] },
      { name: 'Lateral Raises', sets: [ { set: 1, weight: 8, reps: 15 }, { set: 2, weight: 8, reps: 12 } ] },
      { name: 'Push-ups', sets: [ { set: 1, weight: 0, reps: 20 }, { set: 2, weight: 0, reps: 15 } ] }
    ],
    totalVolume: 1100,
    duration: '40 min'
  },
  '2025-06-25': {
    id: 106,
    name: 'Leg Day - Power',
    exercises: [
      { name: 'Squat', sets: [ { set: 1, weight: 100, reps: 4 }, { set: 2, weight: 100, reps: 3 } ] },
      { name: 'Romanian Deadlift', sets: [ { set: 1, weight: 75, reps: 8 }, { set: 2, weight: 75, reps: 7 } ] },
      { name: 'Box Jumps', sets: [ { set: 1, weight: 0, reps: 12 }, { set: 2, weight: 0, reps: 10 } ] }
    ],
    totalVolume: 2100,
    duration: '50 min'
  },
  // --- JULI 2025 ---
  '2025-07-02': {
    id: 201,
    name: 'Push Day - Chest & Triceps',
    exercises: [
      { name: 'Bench Press', sets: [ { set: 1, weight: 80, reps: 5 }, { set: 2, weight: 80, reps: 4 } ] },
      { name: 'Dips', sets: [ { set: 1, weight: 0, reps: 14 }, { set: 2, weight: 0, reps: 12 } ] },
      { name: 'Tricep Pushdown', sets: [ { set: 1, weight: 35, reps: 12 }, { set: 2, weight: 35, reps: 10 } ] }
    ],
    totalVolume: 1800,
    duration: '45 min'
  },
  '2025-07-06': {
    id: 202,
    name: 'Pull Day - Back & Grip',
    exercises: [
      { name: 'Deadlift', sets: [ { set: 1, weight: 120, reps: 3 }, { set: 2, weight: 120, reps: 2 } ] },
      { name: 'Barbell Rows', sets: [ { set: 1, weight: 60, reps: 8 }, { set: 2, weight: 60, reps: 7 } ] },
      { name: 'Farmer Walk', sets: [ { set: 1, weight: 40, reps: 30 }, { set: 2, weight: 40, reps: 25 } ] }
    ],
    totalVolume: 2200,
    duration: '50 min'
  },
  '2025-07-10': {
    id: 203,
    name: 'Leg Day - Endurance',
    exercises: [
      { name: 'Squat', sets: [ { set: 1, weight: 90, reps: 8 }, { set: 2, weight: 90, reps: 7 } ] },
      { name: 'Leg Press', sets: [ { set: 1, weight: 140, reps: 10 }, { set: 2, weight: 140, reps: 8 } ] },
      { name: 'Walking Lunges', sets: [ { set: 1, weight: 20, reps: 20 }, { set: 2, weight: 20, reps: 18 } ] }
    ],
    totalVolume: 2600,
    duration: '55 min'
  },
  '2025-07-15': {
    id: 204,
    name: 'Push Day - Shoulders & Chest',
    exercises: [
      { name: 'Overhead Press', sets: [ { set: 1, weight: 55, reps: 6 }, { set: 2, weight: 55, reps: 5 } ] },
      { name: 'Bench Press', sets: [ { set: 1, weight: 82.5, reps: 4 }, { set: 2, weight: 82.5, reps: 3 } ] },
      { name: 'Push-ups', sets: [ { set: 1, weight: 0, reps: 22 }, { set: 2, weight: 0, reps: 18 } ] }
    ],
    totalVolume: 2000,
    duration: '50 min'
  },
  '2025-07-19': {
    id: 205,
    name: 'Pull Day - Back & Arms',
    exercises: [
      { name: 'Deadlift', sets: [ { set: 1, weight: 125, reps: 2 }, { set: 2, weight: 125, reps: 2 } ] },
      { name: 'Barbell Curls', sets: [ { set: 1, weight: 35, reps: 10 }, { set: 2, weight: 35, reps: 8 } ] },
      { name: 'Lat Pulldowns', sets: [ { set: 1, weight: 65, reps: 10 }, { set: 2, weight: 65, reps: 8 } ] }
    ],
    totalVolume: 2100,
    duration: '45 min'
  },
  '2025-07-23': {
    id: 206,
    name: 'Leg Day - Power',
    exercises: [
      { name: 'Squat', sets: [ { set: 1, weight: 105, reps: 4 }, { set: 2, weight: 105, reps: 3 } ] },
      { name: 'Romanian Deadlift', sets: [ { set: 1, weight: 80, reps: 7 }, { set: 2, weight: 80, reps: 6 } ] },
      { name: 'Box Jumps', sets: [ { set: 1, weight: 0, reps: 14 }, { set: 2, weight: 0, reps: 12 } ] }
    ],
    totalVolume: 2300,
    duration: '50 min'
  },
};

type ProgressEntry = { date: string; weight: number; reps: number; volume: number };
type ProgressData = Record<string, ProgressEntry[]>;

const progressData: ProgressData = {
  'Bench Press': [
    { date: '2024-01-01', weight: 55, reps: 8, volume: 440 },
    { date: '2024-01-08', weight: 57.5, reps: 8, volume: 460 },
    { date: '2024-01-15', weight: 60, reps: 8, volume: 480 },
    { date: '2024-01-22', weight: 65, reps: 6, volume: 390 },
    { date: '2024-01-31', weight: 70, reps: 4, volume: 280 },
  ],
  'Deadlift': [
    { date: '2024-01-01', weight: 90, reps: 5, volume: 450 },
    { date: '2024-01-08', weight: 95, reps: 5, volume: 475 },
    { date: '2024-01-17', weight: 100, reps: 5, volume: 500 },
    { date: '2024-01-24', weight: 105, reps: 5, volume: 525 },
    { date: '2024-01-31', weight: 110, reps: 3, volume: 330 },
  ],
  'Squat': [
    { date: '2024-01-01', weight: 70, reps: 8, volume: 560 },
    { date: '2024-01-08', weight: 75, reps: 8, volume: 600 },
    { date: '2024-01-19', weight: 80, reps: 8, volume: 640 },
    { date: '2024-01-26', weight: 85, reps: 6, volume: 510 },
    { date: '2024-01-31', weight: 90, reps: 4, volume: 360 },
  ],
  'Overhead Press': [
    { date: '2024-01-01', weight: 35, reps: 10, volume: 350 },
    { date: '2024-01-08', weight: 37.5, reps: 10, volume: 375 },
    { date: '2024-01-15', weight: 40, reps: 10, volume: 400 },
    { date: '2024-01-22', weight: 45, reps: 8, volume: 360 },
  ],
  'Barbell Rows': [
    { date: '2024-01-01', weight: 45, reps: 12, volume: 540 },
    { date: '2024-01-08', weight: 47.5, reps: 12, volume: 570 },
    { date: '2024-01-17', weight: 50, reps: 12, volume: 600 },
    { date: '2024-01-24', weight: 50, reps: 12, volume: 600 },
  ],
  'Romanian Deadlift': [
    { date: '2024-01-01', weight: 60, reps: 10, volume: 600 },
    { date: '2024-01-08', weight: 65, reps: 10, volume: 650 },
    { date: '2024-01-19', weight: 70, reps: 10, volume: 700 },
  ],
};

// Voeg extra progressie toe voor juni en juli 2025
progressData['Bench Press'].push(
  { date: '2025-06-03', weight: 75, reps: 6, volume: 450 },
  { date: '2025-07-02', weight: 80, reps: 5, volume: 400 },
  { date: '2025-07-15', weight: 82.5, reps: 4, volume: 330 }
);
progressData['Squat'].push(
  { date: '2025-06-07', weight: 95, reps: 5, volume: 475 },
  { date: '2025-06-25', weight: 100, reps: 4, volume: 400 },
  { date: '2025-07-10', weight: 90, reps: 8, volume: 720 },
  { date: '2025-07-23', weight: 105, reps: 4, volume: 420 }
);
progressData['Deadlift'].push(
  { date: '2025-06-12', weight: 115, reps: 4, volume: 460 },
  { date: '2025-07-06', weight: 120, reps: 3, volume: 360 },
  { date: '2025-07-19', weight: 125, reps: 2, volume: 250 }
);
progressData['Overhead Press'].push(
  { date: '2025-06-21', weight: 50, reps: 8, volume: 400 },
  { date: '2025-07-15', weight: 55, reps: 6, volume: 330 }
);
progressData['Barbell Rows'].push(
  { date: '2025-06-12', weight: 55, reps: 10, volume: 550 },
  { date: '2025-07-06', weight: 60, reps: 8, volume: 480 }
);
progressData['Romanian Deadlift'].push(
  { date: '2025-06-25', weight: 75, reps: 8, volume: 600 },
  { date: '2025-07-23', weight: 80, reps: 7, volume: 560 }
);

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
    let maxImprovement = 0;
    
    Object.entries(mockTrainingData).forEach(([date, training]) => {
      const trainingDate = new Date(date);
      if (trainingDate >= monthStart && trainingDate <= monthEnd) {
        totalTrainings++;
        totalVolume += training.totalVolume;
      }
    });
    
    // Bereken meest gevorderde oefening
    Object.entries(progressData).forEach(([exercise, data]) => {
      if (data.length >= 2) {
        const firstEntry = data[0];
        const lastEntry = data[data.length - 1];
        const improvement = lastEntry.weight - firstEntry.weight;
        
        if (improvement > maxImprovement) {
          maxImprovement = improvement;
          mostImprovedExercise = exercise;
        }
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

  // Chart data genereren voor analyse
  const chartData = () => {
    const data: ProgressEntry[] = progressData[selectedExercise] || [];
    const labels = data.map((d: ProgressEntry) => d.date);
    let datasetData: number[] = [];
    let label = '';
    if (analysisMetric === 'weight') {
      datasetData = data.map((d: ProgressEntry) => d.weight);
      label = 'Gewicht (kg)';
    } else if (analysisMetric === 'volume') {
      datasetData = data.map((d: ProgressEntry) => d.volume);
      label = 'Totaal Volume';
    } else {
      datasetData = data.map((d: ProgressEntry) => d.reps);
      label = 'Max Herhalingen';
    }
    return {
      labels,
      datasets: [
        {
          label,
          data: datasetData,
          borderColor: '#8BAE5A',
          backgroundColor: 'rgba(139, 174, 90, 0.2)',
          pointBackgroundColor: '#FFD700',
          tension: 0.3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: '#8BAE5A' },
        grid: { color: '#3A4D23' },
      },
      y: {
        ticks: { color: '#FFD700' },
        grid: { color: '#3A4D23' },
      },
    },
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