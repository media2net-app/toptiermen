'use client';
import ClientLayout from '@/app/components/ClientLayout';
import { useState, useEffect } from 'react';
import { LockClosedIcon, PlayIcon, CalendarIcon, ChartBarIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth-systems/optimal/useAuth';
import PreWorkoutModal from '../trainingscentrum/PreWorkoutModal';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface TrainingSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_duration: string;
  cover_image?: string;
}

interface TrainingDay {
  id: string;
  day_number: number;
  name: string;
  description?: string;
  focus_area?: string;
}

interface UserProgress {
  current_day: number;
  completed_days: number;
  total_days: number;
  started_at: string;
  completed_at?: string;
  is_active: boolean;
}

interface TrainingData {
  hasActiveSchema: boolean;
  schema?: TrainingSchema;
  days?: TrainingDay[];
  progress?: UserProgress;
  message?: string;
}

export default function MijnTrainingen() {
  const { user } = useAuth();
  const router = useRouter();
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showPreWorkoutModal, setShowPreWorkoutModal] = useState(false);
  const [selectedDayForWorkout, setSelectedDayForWorkout] = useState<number>(1);

  useEffect(() => {
    if (user) {
      loadTrainingData();
    }
  }, [user]);

  const loadTrainingData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/user-training-schema?userId=${user.id}`);
      const data = await response.json();
      
      setTrainingData(data);
      
      if (data.hasActiveSchema && data.progress) {
        setSelectedDay(data.progress.current_day);
      }
    } catch (error) {
      console.error('Error loading training data:', error);
      toast.error('Fout bij het laden van trainingsgegevens');
    } finally {
      setLoading(false);
    }
  };

  const startWorkout = (dayNumber: number) => {
    if (!trainingData?.schema) return;
    
    console.log('🚀 Starting workout for day:', dayNumber);
    console.log('📊 Training data:', trainingData);
    
    setSelectedDayForWorkout(dayNumber);
    setShowPreWorkoutModal(true);
    
    console.log('✅ Modal should be open now');
  };

  const goToTrainingscentrum = () => {
    router.push('/dashboard/trainingscentrum');
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                <p className="text-[#8BAE5A]">Laden van trainingsgegevens...</p>
              </div>
            </div>
                  </div>
      </div>

      {/* Pre-Workout Modal */}
      {trainingData?.schema && (
        <PreWorkoutModal
          isOpen={showPreWorkoutModal}
          onClose={() => setShowPreWorkoutModal(false)}
          schemaId={trainingData.schema.id}
          dayNumber={selectedDayForWorkout}
          schemaName={trainingData.schema.name}
          focusArea={trainingData.days?.find(d => d.day_number === selectedDayForWorkout)?.focus_area || 'Training'}
          estimatedDuration={trainingData.schema.estimated_duration}
        />
      )}
    </ClientLayout>
  );
}

  // Lock state - no active schema
  if (!trainingData?.hasActiveSchema) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Mijn Trainingen</h1>
              <p className="text-[#8BAE5A] text-lg">Persoonlijke trainingsschema's en voortgang</p>
            </div>

            {/* Lock State */}
            <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-2xl p-12 text-center shadow-xl">
              <div className="mb-8">
                <div className="w-24 h-24 bg-[#3A4D23] rounded-full flex items-center justify-center mx-auto mb-6">
                  <LockClosedIcon className="w-12 h-12 text-[#8BAE5A]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Geen Actief Trainingsschema</h2>
                <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                  Je hebt nog geen trainingsschema geselecteerd. Ga naar het trainingscentrum om een schema te kiezen dat bij jou past.
                </p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={goToTrainingscentrum}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-bold text-lg rounded-xl hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ArrowRightIcon className="w-6 h-6 mr-2" />
                  Ga naar Trainingscentrum
                </button>
                
                <div className="text-sm text-gray-500">
                  <p>Kies een schema dat past bij jouw doelen en niveau</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Gestructureerde Training</h3>
                <p className="text-gray-400 text-sm">Volg een bewezen schema met duidelijke doelen en progressie</p>
              </div>
              
              <div className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Voortgang Tracking</h3>
                <p className="text-gray-400 text-sm">Houd je prestaties bij en zie je vooruitgang over tijd</p>
              </div>
              
              <div className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-[#f0a14f]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="w-6 h-6 text-[#f0a14f]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Direct Starten</h3>
                <p className="text-gray-400 text-sm">Begin direct met trainen zodra je schema is geselecteerd</p>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  // Active schema state
  const { schema, days, progress } = trainingData;

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">Mijn Trainingen</h1>
        <p className="text-[#8BAE5A] text-lg mb-8">Jouw actieve trainingsschema en voortgang</p>

        {/* Schema Overview */}
        <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{schema?.name}</h2>
              <p className="text-gray-400 mb-4">{schema?.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-[#8BAE5A]">Categorie: {schema?.category}</span>
                <span className="text-[#FFD700]">Niveau: {schema?.difficulty}</span>
                <span className="text-[#f0a14f]">Duur: {schema?.estimated_duration}</span>
              </div>
            </div>
            
            {progress && (
              <div className="text-right">
                <div className="text-3xl font-bold text-[#8BAE5A] mb-1">
                  {progress.completed_days}/{progress.total_days}
                </div>
                <div className="text-sm text-gray-400">Dagen voltooid</div>
                <div className="mt-2">
                  <div className="w-32 h-2 bg-[#3A4D23] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] transition-all duration-300"
                      style={{ width: `${(progress.completed_days / progress.total_days) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Training Days */}
        {days && days.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Trainingsdagen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map((day) => {
                const isCompleted = progress ? day.day_number <= progress.completed_days : false;
                const isCurrentDay = day.day_number === selectedDay;
                const isNextDay = progress ? day.day_number === progress.current_day : false;

                return (
                  <div
                    key={day.id}
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
                    <p className="text-sm text-gray-400 mb-3">{day.focus_area}</p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startWorkout(day.day_number);
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200"
                    >
                      Start Training
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-[#181F17] border border-[#3A4D23]/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Snelle Acties</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push('/dashboard/trainingscentrum')}
                className="px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] font-semibold rounded-lg hover:bg-[#4A5D33] transition-all duration-200"
              >
                Wijzig Schema
              </button>
              <button
                onClick={() => router.push('/dashboard/trainingscentrum')}
                className="px-6 py-3 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold rounded-lg hover:from-[#7A9D4A] hover:to-[#e0903f] transition-all duration-200"
              >
                Bekijk Alle Schema's
              </button>
            </div>
          </div>
        </div>

      {/* Pre-Workout Modal */}
      {trainingData?.schema && (
        <PreWorkoutModal
          isOpen={showPreWorkoutModal}
          onClose={() => setShowPreWorkoutModal(false)}
          schemaId={trainingData.schema.id}
          dayNumber={selectedDayForWorkout}
          schemaName={trainingData.schema.name}
          focusArea={trainingData.days?.find(d => d.day_number === selectedDayForWorkout)?.focus_area || 'Training'}
          estimatedDuration={trainingData.schema.estimated_duration}
        />
      )}
    </ClientLayout>
  );
} 