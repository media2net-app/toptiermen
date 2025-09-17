"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface DynamicTrainingPlanViewProps {
  schemaId: string;
  schemaName: string;
  userId: string;
  onBack: () => void;
}

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  training_goal: string;
  training_schema_days?: {
    id: string;
    day_number: number;
    name: string;
    training_schema_exercises?: {
      id: string;
      exercise_name: string;
      notes?: string;
      sets: number;
      reps: string;
      rest_time_seconds?: number;
      order_index: number;
      exercise_id?: number;
      video_url?: string;
    }[];
  }[];
}

export default function DynamicTrainingPlanView({ schemaId, schemaName, userId, onBack }: DynamicTrainingPlanViewProps) {
  const [schemaData, setSchemaData] = useState<TrainingSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [videoModal, setVideoModal] = useState<{isOpen: boolean, exerciseName: string, videoUrl: string}>({
    isOpen: false,
    exerciseName: '',
    videoUrl: ''
  });

  // Fetch schema data
  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching schema data for ID:', schemaId);
        
        const response = await fetch(`/api/training-schema-detail/${schemaId}`);
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error response:', errorText);
          throw new Error(`Failed to fetch schema details: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📋 API Response data:', data);
        
        if (data.success && data.schema) {
          setSchemaData(data.schema);
          console.log('✅ Schema data loaded successfully:', {
            name: data.schema.name,
            days: data.schema.training_schema_days?.length || 0,
            totalExercises: data.schema.training_schema_days?.reduce((total: number, day: any) => 
              total + (day.training_schema_exercises?.length || 0), 0) || 0
          });
        } else {
          console.error('❌ Invalid response format:', data);
          throw new Error('Invalid response format - missing success or schema data');
        }
      } catch (error) {
        console.error('❌ Error fetching schema data:', error);
        setError(`Kon schema details niet laden: ${error.message}`);
        toast.error('Kon schema details niet laden');
      } finally {
        setLoading(false);
      }
    };

    if (schemaId) {
      fetchSchemaData();
    } else {
      console.error('❌ No schemaId provided');
      setError('Geen schema ID opgegeven');
      setLoading(false);
    }
  }, [schemaId]);

  const openVideoModal = (exerciseName: string, videoUrl: string) => {
    setVideoModal({
      isOpen: true,
      exerciseName,
      videoUrl
    });
  };

  const closeVideoModal = () => {
    setVideoModal({
      isOpen: false,
      exerciseName: '',
      videoUrl: ''
    });
  };

  const handleSelectPlan = async () => {
    try {
      const response = await fetch('/api/training-schema-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          schemaId
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`🎉 ${schemaName} is nu je actieve trainingsschema!`);
        // Navigate back to overview with the selected schema
        // Note: This will trigger the main selectTrainingSchema function which handles onboarding logic
        window.location.href = `/dashboard/trainingsschemas?select=${schemaId}`;
      } else {
        throw new Error(data.error || 'Failed to select training schema');
      }
    } catch (error) {
      console.error('❌ Error selecting training schema:', error);
      toast.error(`Fout bij selecteren van schema: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-[#0A0A0A] text-white"
      >
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-gray-300">Schema wordt geladen...</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !schemaData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-[#0A0A0A] text-white"
      >
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">Fout bij laden van schema</p>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
              >
                Terug naar overzicht
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const currentDay = schemaData.training_schema_days?.find(day => day.day_number === selectedDay);
  const totalDays = schemaData.training_schema_days?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#0A0A0A] text-white"
    >
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#8BAE5A] hover:text-[#B6C948] transition-colors text-sm md:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Terug naar overzicht</span>
            <span className="sm:hidden">Terug</span>
          </button>
        </div>

        {/* Schema Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{schemaData.name}</h1>
          {schemaData.description && (
            <p className="text-gray-300 mb-4 text-sm md:text-base">{schemaData.description}</p>
          )}
          
          {/* Schema Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-[#1A1A1A] rounded-lg p-3 md:p-4 border border-gray-800">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Doel</h3>
              <p className="text-white capitalize text-sm md:text-base">{schemaData.training_goal || 'Niet gespecificeerd'}</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 md:p-4 border border-gray-800">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Equipment</h3>
              <p className="text-white capitalize text-sm md:text-base">{schemaData.category || 'Niet gespecificeerd'}</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 md:p-4 border border-gray-800">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Frequentie</h3>
              <p className="text-white text-sm md:text-base">{totalDays} dagen per week</p>
            </div>
            <div className="bg-[#1A1A1A] rounded-lg p-3 md:p-4 border border-gray-800">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-1 md:mb-2">Status</h3>
              <p className="text-white text-sm md:text-base">Gereed</p>
            </div>
          </div>

          {/* Select Plan Button */}
          <div className="flex justify-center md:justify-end">
            <button
              onClick={handleSelectPlan}
              className="flex items-center gap-2 px-4 md:px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold text-sm md:text-base"
            >
              <CheckIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Selecteer dit schema</span>
              <span className="sm:hidden">Selecteer</span>
            </button>
          </div>
        </div>

        {/* Day Selector */}
        {totalDays > 1 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Kies een dag</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {schemaData.training_schema_days?.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.day_number)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                    selectedDay === day.day_number
                      ? 'bg-[#8BAE5A] text-[#232D1A]'
                      : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                  }`}
                >
                  Dag {day.day_number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Day Exercises */}
        {currentDay && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
              <FireIcon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">{currentDay.name} - Oefeningen</span>
            </h2>
            
            {currentDay.training_schema_exercises && currentDay.training_schema_exercises.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {currentDay.training_schema_exercises.map((exercise, index) => (
                  <div key={exercise.id} className="bg-[#1A1A1A] rounded-lg p-3 md:p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-medium text-white">{exercise.exercise_name}</h3>
                        {exercise.notes && (
                          <p className="text-xs md:text-sm text-gray-400 mt-1">{exercise.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">
                          {exercise.sets} sets × {exercise.reps} reps
                        </div>
                        {exercise.rest_time_seconds && (
                          <div className="text-xs text-gray-400">
                            {exercise.rest_time_seconds}s rust
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Video Button */}
                    {exercise.video_url && exercise.video_url !== '/video-placeholder.jpg' && exercise.video_url !== 'video-placeholder.jpg' && (
                      <div className="mt-3">
                        <button
                          onClick={() => openVideoModal(exercise.exercise_name, exercise.video_url!)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Bekijk video
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Geen oefeningen beschikbaar voor deze dag</p>
              </div>
            )}
          </div>
        )}

        {/* Video Modal */}
        {videoModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{videoModal.exerciseName}</h3>
                <button
                  onClick={closeVideoModal}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  src={videoModal.videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  controlsList="nodownload"
                  autoPlay
                  onError={(e) => {
                    console.error('❌ Video error:', e);
                    toast.error('Video kon niet worden geladen');
                  }}
                >
                  Je browser ondersteunt geen video element.
                </video>
              </div>
              
              {/* Modal Footer */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeVideoModal}
                  className="px-6 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors font-medium"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
