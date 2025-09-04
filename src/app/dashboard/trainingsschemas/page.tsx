"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  FireIcon, 
  StarIcon,
  PlayIcon,
  CheckIcon,
  ArrowRightIcon,
  ClockIcon,
  HeartIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from "@/contexts/OnboardingContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

// Import workout data
import workoutData from '@/data/training-schema-workouts.json';

interface TrainingPreferences {
  frequency: number;
  style: 'gym' | 'bodyweight';
}

interface WorkoutSchema {
  id: string;
  name: string;
  frequency: number;
  style: 'gym' | 'bodyweight';
  description: string;
  days: {
    day: number;
    name: string;
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: string;
      alternatives: { name: string; reason: string }[];
      feedback: string;
    }[];
  }[];
}

interface TrainingSchemaDb {
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

export default function TrainingschemasPage() {
  const { user } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'training' | null>('training');
  const [pageStep, setPageStep] = useState(1);
  const [trainingPreferences, setTrainingPreferences] = useState<TrainingPreferences>({
    frequency: 0,
    style: 'gym'
  });
  const [workoutSchema, setWorkoutSchema] = useState<WorkoutSchema | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [showPreWorkoutModal, setShowPreWorkoutModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);
  const [availableSchemas, setAvailableSchemas] = useState<TrainingSchemaDb[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<TrainingSchemaDb | null>(null);
  const [currentWorkoutData, setCurrentWorkoutData] = useState<any>(null);

  // Training functions
  const fetchTrainingSchemas = async () => {
    try {
      const { data, error } = await supabase
        .from('training_schemas')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching training schemas:', error);
        return;
      }
      
      setAvailableSchemas(data || []);
    } catch (error) {
      console.error('Error in fetchTrainingSchemas:', error);
    }
  };

  const fetchUserActiveSchema = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('user_training_schemas')
        .select(`
          *,
          training_schemas (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (!error && data) {
        setSelectedSchemaId(data.schema_id);
        setSelectedSchema(data.training_schemas);
      }
    } catch (error) {
      console.error('Error fetching user active schema:', error);
    }
  };

  const fetchCurrentWorkout = async () => {
    try {
      if (!user?.id || !selectedSchemaId) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('user_workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('schema_id', selectedSchemaId)
        .eq('scheduled_date', today)
        .single();
      
      if (!error && data) {
        setCurrentWorkoutData(data);
      }
    } catch (error) {
      console.log('No workout scheduled for today');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTrainingSchemas();
      fetchUserActiveSchema();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && selectedSchemaId) {
      fetchCurrentWorkout();
    }
  }, [user?.id, selectedSchemaId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const generateWorkoutSchema = () => {
    if (!trainingPreferences.frequency || !trainingPreferences.style) {
      toast.error('Vul alle voorkeuren in');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const filteredSchemas = workoutData.schemas.filter(schema => 
        schema.frequency === trainingPreferences.frequency && 
        schema.style === trainingPreferences.style
      );

      if (filteredSchemas.length > 0) {
        const randomSchema = filteredSchemas[Math.floor(Math.random() * filteredSchemas.length)];
        setWorkoutSchema(randomSchema);
        setPageStep(3);
      } else {
        toast.error('Geen schema gevonden voor deze voorkeuren');
      }
      
      setIsGenerating(false);
    }, 2000);
  };

  const handleSchemaSelection = async (schemaId: string) => {
    try {
      if (!user?.id) {
        toast.error('Je moet ingelogd zijn');
        return;
      }

      // Deactivate current schema
      await supabase
        .from('user_training_schemas')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate new schema
      const { error } = await supabase
        .from('user_training_schemas')
        .upsert({
          user_id: user.id,
          schema_id: schemaId,
          is_active: true,
          started_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error selecting schema:', error);
        toast.error('Er is een fout opgetreden bij het selecteren van het schema');
        return;
      }

      setSelectedSchemaId(schemaId);
      const selected = availableSchemas.find(s => s.id === schemaId);
      setSelectedSchema(selected || null);
      
      toast.success('Trainingsschema geselecteerd!');
      
      // Complete onboarding step if needed
      if (isOnboarding && onboardingStep === 3) {
        await completeStep(3, { selectedTrainingSchema: schemaId });
      }
      
    } catch (error) {
      console.error('Error in handleSchemaSelection:', error);
      toast.error('Er is een fout opgetreden');
    }
  };

  const handleStartWorkout = () => {
    if (selectedSchema) {
      router.push(`/dashboard/trainingscentrum/workoutschema/${selectedSchema.category.toLowerCase()}`);
    }
  };

  const resetOnboarding = () => {
    setSelectedOption(null);
    setPageStep(1);
    setTrainingPreferences({ frequency: 0, style: 'gym' });
    setWorkoutSchema(null);
  };

  if (isLoading) {
    return (
      <PageLayout 
        title="Trainingsschemas" 
        subtitle="Kies en beheer je trainingsschemas"
        breadcrumbItems={[
          { label: 'Trainingsschemas', isCurrent: true }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#8BAE5A] text-lg">Trainingsschemas laden...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Trainingsschemas" 
      subtitle="Kies en beheer je trainingsschemas voor optimale resultaten"
      breadcrumbItems={[
        { label: 'Trainingsschemas', isCurrent: true }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Training Schema Selection */}
          {!isOnboarding && selectedOption === 'training' && (
            <motion.div
              key="training-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Trainingsschemas
                </h2>
                <p className="text-gray-300 text-lg">
                  Kies een trainingsschema dat past bij jouw doelen en niveau.
                </p>
              </div>

              {/* Current Schema Display */}
              {selectedSchema && (
                <div className="mb-8 p-6 bg-[#232D1A] rounded-xl border border-[#3A4D23]">
                  <h3 className="text-xl font-bold text-white mb-2">Actief Schema</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-[#8BAE5A]">{selectedSchema.name}</h4>
                      <p className="text-gray-300 text-sm">{selectedSchema.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {selectedSchema.estimated_duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4" />
                          {selectedSchema.difficulty}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleStartWorkout}
                      className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold flex items-center gap-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Start Training
                    </button>
                  </div>
                </div>
              )}

              {/* Available Schemas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableSchemas.map((schema) => (
                  <motion.div
                    key={schema.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedSchemaId === schema.id
                        ? 'bg-[#8BAE5A]/10 border-[#8BAE5A]'
                        : 'bg-[#232D1A] border-[#3A4D23] hover:border-[#8BAE5A]/50'
                    }`}
                    onClick={() => handleSchemaSelection(schema.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{schema.name}</h3>
                        <p className="text-gray-300 text-sm mb-3">{schema.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {schema.estimated_duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            {schema.difficulty}
                          </span>
                        </div>
                        
                        {schema.target_audience && (
                          <div className="mt-2">
                            <span className="text-xs bg-[#3A4D23] text-[#8BAE5A] px-2 py-1 rounded-full">
                              {schema.target_audience}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        {selectedSchemaId === schema.id ? (
                          <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center">
                            <CheckIcon className="w-6 h-6 text-[#232D1A]" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
                            <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400 capitalize">
                        {schema.category}
                      </span>
                      {selectedSchemaId === schema.id && (
                        <span className="text-sm text-[#8BAE5A] font-semibold">
                          Actief Schema
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {availableSchemas.length === 0 && (
                <div className="text-center py-12">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-300">Geen trainingsschemas beschikbaar</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Er zijn momenteel geen actieve trainingsschemas beschikbaar.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Onboarding Flow for Training */}
          {isOnboarding && onboardingStep === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Kies je Trainingsschema
                </h2>
                <p className="text-gray-300 text-lg">
                  Selecteer het trainingsschema dat het beste past bij jouw niveau en doelen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableSchemas.map((schema) => (
                  <motion.div
                    key={schema.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-[#232D1A] rounded-xl border-2 border-[#3A4D23] hover:border-[#8BAE5A]/50 cursor-pointer transition-all duration-200"
                    onClick={() => handleSchemaSelection(schema.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{schema.name}</h3>
                        <p className="text-gray-300 text-sm mb-3">{schema.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {schema.estimated_duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            {schema.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <button className="w-full px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#B6C948] transition-colors font-semibold">
                        Selecteer Schema
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
