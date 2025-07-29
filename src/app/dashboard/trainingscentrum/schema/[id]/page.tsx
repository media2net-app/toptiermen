"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  FireIcon, 
  ClockIcon,
  CheckIcon,
  PlayIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from 'next/navigation';

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  cover_image: string | null;
  status: string;
  difficulty: string;
  estimated_duration: string;
  target_audience: string | null;
}

interface TrainingDay {
  id: string;
  day_number: number;
  name: string;
  description: string;
  focus_area: string;
  order_index: number;
}

interface TrainingExercise {
  id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_time: string;
  order_index: number;
  notes: string | null;
}

interface UserProgress {
  current_day: number;
  completed_days: number;
  total_days: number;
  started_at: string;
  completed_at: string | null;
  is_active: boolean;
}

export default function TrainingSchemaViewPage() {
  const { user } = useSupabaseAuth();
  const params = useParams();
  const router = useRouter();
  const schemaId = params?.id as string;

  const [schema, setSchema] = useState<TrainingSchema | null>(null);
  const [days, setDays] = useState<TrainingDay[]>([]);
  const [exercises, setExercises] = useState<{ [dayId: string]: TrainingExercise[] }>({});
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    const fetchSchemaData = async () => {
      if (!user || !schemaId) return;

      setIsLoading(true);
      try {
        // Fetch schema details
        const { data: schemaData, error: schemaError } = await supabase
          .from('training_schemas')
          .select('*')
          .eq('id', schemaId)
          .single();

        if (schemaError) throw schemaError;
        setSchema(schemaData);

        // Fetch schema days
        const { data: daysData, error: daysError } = await supabase
          .from('training_schema_days')
          .select('*')
          .eq('schema_id', schemaId)
          .order('order_index');

        if (daysError) throw daysError;
        setDays(daysData);

        // Fetch exercises for each day
        const exercisesData: { [dayId: string]: TrainingExercise[] } = {};
        for (const day of daysData) {
          const { data: dayExercises, error: exercisesError } = await supabase
            .from('training_schema_exercises')
            .select('*')
            .eq('schema_day_id', day.id)
            .order('order_index');

          if (!exercisesError && dayExercises) {
            exercisesData[day.id] = dayExercises;
          }
        }
        setExercises(exercisesData);

        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_training_schema_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('schema_id', schemaId)
          .single();

        if (!progressError && progressData) {
          setUserProgress(progressData);
          setSelectedDay(progressData.current_day);
        } else {
          // Create new progress if none exists
          const { data: newProgress, error: createError } = await supabase
            .from('user_training_schema_progress')
            .insert({
              user_id: user.id,
              schema_id: schemaId,
              current_day: 1,
              completed_days: 0,
              total_days: daysData.length,
              is_active: true
            })
            .select()
            .single();

          if (!createError && newProgress) {
            setUserProgress(newProgress);
            setSelectedDay(1);
          }
        }

      } catch (error) {
        console.error('Error fetching schema data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemaData();
  }, [user, schemaId]);

  const startWorkout = async (dayNumber: number) => {
    if (!user || !schema) return;

    // Update current day in progress
    const { error } = await supabase
      .from('user_training_schema_progress')
      .update({ current_day: dayNumber })
      .eq('user_id', user.id)
      .eq('schema_id', schemaId);

    if (!error) {
      setUserProgress(prev => prev ? { ...prev, current_day: dayNumber } : null);
      setSelectedDay(dayNumber);
    }

    // Navigate to workout page
    router.push(`/dashboard/trainingscentrum/workout/${schemaId}/${dayNumber}`);
  };

  const completeDay = async (dayNumber: number) => {
    if (!user || !schema) return;

    try {
      // Find the day
      const day = days.find(d => d.day_number === dayNumber);
      if (!day) return;

      // Mark day as completed
      const { error: dayError } = await supabase
        .from('user_training_day_progress')
        .upsert({
          user_id: user.id,
          schema_day_id: day.id,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (dayError) throw dayError;

      // Update schema progress
      const newCompletedDays = (userProgress?.completed_days || 0) + 1;
      const { error: progressError } = await supabase
        .from('user_training_schema_progress')
        .update({ 
          completed_days: newCompletedDays,
          current_day: Math.min(dayNumber + 1, days.length)
        })
        .eq('user_id', user.id)
        .eq('schema_id', schemaId);

      if (progressError) throw progressError;

      // Update local state
      setUserProgress(prev => prev ? {
        ...prev,
        completed_days: newCompletedDays,
        current_day: Math.min(dayNumber + 1, days.length)
      } : null);

    } catch (error) {
      console.error('Error completing day:', error);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Trainingsschema" description="Laden...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-gray-300">Schema laden...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!schema) {
    return (
      <PageLayout title="Trainingsschema" description="Schema niet gevonden">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Schema niet gevonden</h2>
          <p className="text-gray-300 mb-6">Het opgevraagde trainingsschema bestaat niet of is niet beschikbaar.</p>
          <button
            onClick={() => router.push('/dashboard/trainingscentrum')}
            className="bg-[#8BAE5A] text-white px-6 py-3 rounded-lg hover:bg-[#7A9D4A] transition-all"
          >
            Terug naar Trainingscentrum
          </button>
        </div>
      </PageLayout>
    );
  }

  const currentDay = days.find(d => d.day_number === selectedDay);
  const currentDayExercises = currentDay ? exercises[currentDay.id] || [] : [];

  return (
    <PageLayout title={schema.name} description={schema.description}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/trainingscentrum')}
            className="flex items-center text-[#8BAE5A] hover:text-[#7A9D4A] mb-4 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Terug naar Trainingscentrum
          </button>

          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{schema.name}</h1>
                <p className="text-gray-300 mb-3">{schema.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-[#8BAE5A]">
                    <FireIcon className="w-4 h-4 mr-1" />
                    {schema.category}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {schema.estimated_duration}
                  </div>
                  <div className="text-gray-400">
                    Niveau: {schema.difficulty}
                  </div>
                </div>
              </div>

              {userProgress && (
                <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#8BAE5A] mb-1">
                    {userProgress.completed_days}/{userProgress.total_days}
                  </div>
                  <div className="text-sm text-gray-400">Dagen voltooid</div>
                  <div className="w-full bg-[#3A4D23] rounded-full h-2 mt-2">
                    <div 
                      className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(userProgress.completed_days / userProgress.total_days) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Navigation */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Trainingsdagen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map((day) => {
              const isCompleted = userProgress ? day.day_number <= userProgress.completed_days : false;
              const isCurrentDay = day.day_number === selectedDay;
              const isNextDay = userProgress ? day.day_number === userProgress.current_day : false;

              return (
                <motion.div
                  key={day.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isCurrentDay
                      ? 'border-[#8BAE5A] bg-[#232D1A]'
                      : isCompleted
                      ? 'border-green-500 bg-[#1A1A1A]'
                      : 'border-[#3A4D23] bg-[#1A1A1A] hover:border-[#5A6D43]'
                  }`}
                  onClick={() => setSelectedDay(day.day_number)}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Dag {day.day_number}</h3>
                    {isNextDay && (
                      <span className="text-xs bg-[#8BAE5A] text-[#232D1A] px-2 py-1 rounded-full">
                        Volgende
                      </span>
                    )}
                  </div>
                  <h4 className="text-[#8BAE5A] font-medium mb-1">{day.name}</h4>
                  <p className="text-sm text-gray-400">{day.focus_area}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Current Day Details */}
        {currentDay && (
          <div className="bg-[#1A1A1A] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentDay.name}
                </h2>
                <p className="text-gray-300">{currentDay.description}</p>
                <p className="text-[#8BAE5A] font-medium mt-2">{currentDay.focus_area}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => startWorkout(currentDay.day_number)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#232D1A] font-bold rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Workout
                </button>
                
                {userProgress && currentDay.day_number <= userProgress.completed_days && (
                  <button
                    onClick={() => completeDay(currentDay.day_number)}
                    className="flex items-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Voltooid
                  </button>
                )}
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Oefeningen</h3>
              {currentDayExercises.length > 0 ? (
                currentDayExercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-[#232D1A] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {index + 1}. {exercise.exercise_name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-gray-300">
                        <span className="font-medium">Sets:</span> {exercise.sets}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium">Reps:</span> {exercise.reps}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium">Rust:</span> {exercise.rest_time}
                      </div>
                    </div>
                    {exercise.notes && (
                      <div className="mt-3 p-3 bg-[#1A1A1A] rounded-lg">
                        <p className="text-sm text-gray-400">{exercise.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Geen oefeningen gevonden voor deze dag.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
} 