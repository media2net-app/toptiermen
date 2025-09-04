"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon,
  EyeIcon,
  AcademicCapIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter } from 'next/navigation';

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
  training_goal: string;
  rep_range: string;
  rest_time_seconds: number;
  equipment_type: string;
}

interface TrainingProfile {
  id?: string;
  user_id: string;
  training_goal: 'spiermassa' | 'kracht_uithouding' | 'power_kracht';
  training_frequency: 3 | 4 | 5 | 6;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  equipment_type: 'gym' | 'home' | 'outdoor';
  created_at?: string;
  updated_at?: string;
}

const trainingGoals = [
  {
    id: 'spiermassa',
    name: 'Spiermassa',
    subtitle: 'Focus op spiergroei en hypertrofie',
    description: '8-12 reps, 4 sets, 90s rust',
    icon: '💪',
  },
  {
    id: 'kracht_uithouding',
    name: 'Kracht & Uithouding',
    subtitle: 'Balans tussen kracht en conditionering',
    description: '15-20 reps, 4 sets, 40-60s rust',
    icon: '🏃',
  },
  {
    id: 'power_kracht',
    name: 'Power & Kracht',
    subtitle: 'Maximale kracht en explosiviteit',
    description: '3-6 reps, 4 sets, 150-180s rust',
    icon: '⚡',
  }
];

const experienceLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    subtitle: 'Minder dan 1 jaar ervaring',
    description: 'Focus op techniek en basisbewegingen',
    icon: '🌱',
  },
  {
    id: 'intermediate',
    name: 'Gemiddeld',
    subtitle: '1-3 jaar ervaring',
    description: 'Kan complexere oefeningen uitvoeren',
    icon: '📈',
  },
  {
    id: 'advanced',
    name: 'Gevorderd',
    subtitle: 'Meer dan 3 jaar ervaring',
    description: 'Geavanceerde technieken en zware gewichten',
    icon: '🏆',
  }
];

const equipmentTypes = [
  {
    id: 'gym',
    name: 'Gym',
    subtitle: 'Volledige gym met alle apparaten',
    description: 'Toegang tot alle gewichten en machines',
    icon: '🏋️',
  },
  {
    id: 'home',
    name: 'Thuis',
    subtitle: 'Beperkte apparaten of bodyweight',
    description: 'Dumbbells, resistance bands, bodyweight',
    icon: '🏠',
  },
  {
    id: 'outdoor',
    name: 'Buiten',
    subtitle: 'Outdoor training en bootcamp',
    description: 'Park training, bootcamp, outdoor fitness',
    icon: '🌳',
  }
];

const trainingFrequencies = [
  { id: 3, name: '3x per week', description: 'Perfect voor beginners' },
  { id: 4, name: '4x per week', description: 'Ideaal voor consistentie' },
  { id: 5, name: '5x per week', description: 'Voor gevorderden' },
  { id: 6, name: '6x per week', description: 'Maximale intensiteit' }
];

export default function TrainingschemasPage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const router = useRouter();

  // Training schemas state
  const [trainingSchemas, setTrainingSchemas] = useState<TrainingSchema[]>([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [userTrainingProfile, setUserTrainingProfile] = useState<TrainingProfile | null>(null);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string | null>(null);
  const [showRequiredProfile, setShowRequiredProfile] = useState(false);
  
  // Training calculator state
  const [calculatorData, setCalculatorData] = useState({
    training_goal: '',
    training_frequency: '',
    experience_level: '',
    equipment_type: ''
  });

  // Training functions
  const fetchTrainingSchemas = async () => {
    try {
      setTrainingLoading(true);
      
      const response = await fetch('/api/training-schemas');
      
      if (!response.ok) {
        throw new Error('Failed to fetch training schemas');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Filter schemas based on user's profile if they have one
        let filteredSchemas = data.schemas || [];
        
        if (userTrainingProfile) {
          filteredSchemas = filterSchemasByProfile(filteredSchemas, userTrainingProfile);
        }
        
        setTrainingSchemas(filteredSchemas);
        console.log('✅ Training schemas loaded:', filteredSchemas.length);
      } else {
        setTrainingError(data.error || 'Failed to load training schemas');
      }
    } catch (error) {
      console.error('Error fetching training schemas:', error);
      setTrainingError('Failed to load training schemas');
    } finally {
      setTrainingLoading(false);
    }
  };

  const filterSchemasByProfile = (schemas: TrainingSchema[], profile: TrainingProfile) => {
    return schemas.filter(schema => {
      // Map user profile to database fields
      const goalMapping = {
        'spiermassa': 'spiermassa',
        'kracht_uithouding': 'uithouding',
        'power_kracht': 'kracht'
      };
      
      const equipmentMapping = {
        'gym': 'Gym',
        'home': 'Home',
        'outdoor': 'Outdoor'
      };
      
      const difficultyMapping = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced'
      };
      
      // Filter by training goal
      const mappedGoal = goalMapping[profile.training_goal];
      if (schema.training_goal !== mappedGoal) return false;
      
      // Filter by equipment type
      const mappedEquipment = equipmentMapping[profile.equipment_type];
      if (schema.category !== mappedEquipment) return false;
      
      // Don't filter by difficulty - show all levels for the goal/equipment
      return true;
    });
  };

  const fetchUserTrainingProfile = async () => {
    try {
      if (!user?.id) return;
      
      console.log('🔍 Fetching training profile for user:', user.email);
      
      // Check if user.id is an email and convert to UUID if needed
      let actualUserId = user.id;
      if (user.id.includes('@')) {
        try {
          const response = await fetch('/api/auth/get-user-uuid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.id })
          });
          
          if (response.ok) {
            const { uuid } = await response.json();
            actualUserId = uuid;
            console.log('✅ Found UUID for training profile:', actualUserId);
          }
        } catch (error) {
          console.log('❌ Error getting UUID for training profile:', error);
        }
      }
      
      const response = await fetch(`/api/training-profile?userId=${actualUserId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setUserTrainingProfile(data.profile);
          console.log('✅ Training profile loaded:', data.profile);
        } else {
          console.log('ℹ️ No training profile found');
        }
      }
    } catch (error) {
      console.error('Error fetching training profile:', error);
    }
  };

  const saveTrainingProfile = async (profileData: any) => {
    if (!user?.id) return;
    
    try {
      // Check if user.id is an email and convert to UUID if needed
      let actualUserId = user.id;
      if (user.id.includes('@')) {
        try {
          const response = await fetch('/api/auth/get-user-uuid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.id })
          });
          
          if (response.ok) {
            const { uuid } = await response.json();
            actualUserId = uuid;
          }
        } catch (error) {
          console.log('❌ Error getting UUID for training profile:', error);
        }
      }
      
      const apiPayload = {
        userId: actualUserId,
        training_goal: profileData.training_goal,
        training_frequency: parseInt(profileData.training_frequency),
        experience_level: profileData.experience_level,
        equipment_type: profileData.equipment_type
      };
      
      console.log('📤 Saving training profile:', apiPayload);
      
      const response = await fetch('/api/training-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Training profile saved successfully');
        toast.success('Je trainingsprofiel is opgeslagen!');
        setUserTrainingProfile(data.profile);
        setShowRequiredProfile(false);
        // Reset calculator data
        setCalculatorData({ training_goal: '', training_frequency: '', experience_level: '', equipment_type: '' });
        
        // Fetch updated training schemas
        await fetchTrainingSchemas();
      } else {
        toast.error(data.error || 'Failed to save training profile');
      }
    } catch (error) {
      console.error('Error saving training profile:', error);
      toast.error('Failed to save training profile');
    }
  };

  const calculateTrainingProfile = () => {
    const { training_goal, training_frequency, experience_level, equipment_type } = calculatorData;
    
    console.log('🧮 Calculating training profile with data:', calculatorData);
    
    if (!training_goal || !training_frequency || !experience_level || !equipment_type) {
      toast.error('Vul alle velden in om je trainingsprofiel te berekenen');
      return;
    }

    const profile = {
      training_goal,
      training_frequency: parseInt(training_frequency),
      experience_level,
      equipment_type
    };

    console.log('💾 Saving profile:', profile);
    saveTrainingProfile(profile);
  };

  const selectTrainingSchema = async (schemaId: string) => {
    try {
      if (!user?.id) return;
      
      // Check if user.id is an email and convert to UUID if needed
      let actualUserId = user.id;
      if (user.id.includes('@')) {
        try {
          const response = await fetch('/api/auth/get-user-uuid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.id })
          });
          
          if (response.ok) {
            const { uuid } = await response.json();
            actualUserId = uuid;
          }
        } catch (error) {
          console.log('❌ Error getting UUID for training schema selection:', error);
        }
      }
      
      const response = await fetch('/api/training-schema-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: actualUserId,
          schemaId: schemaId
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSelectedTrainingSchema(schemaId);
        toast.success('Trainingsschema geselecteerd!');
        
        // Complete onboarding step if needed
        if (isOnboarding && onboardingStep === 3) {
          await completeStep(3);
        }
      } else {
        toast.error(data.error || 'Failed to select training schema');
      }
    } catch (error) {
      console.error('Error selecting training schema:', error);
      toast.error('Failed to select training schema');
    }
  };

  // Effects
  useEffect(() => {
    if (user?.id) {
      fetchUserTrainingProfile();
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTrainingSchemas();
  }, [userTrainingProfile]);

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trainingsschemas</h1>
          <p className="text-gray-300">
            Kies en beheer je trainingsschemas voor optimale resultaten
          </p>
        </div>

        {/* Daily Requirements Notice */}
        {userTrainingProfile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-[#232D1A] border border-[#8BAE5A] rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Jouw Trainingsprofiel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Doel:</span>
                    <p className="text-white font-medium">
                      {trainingGoals.find(g => g.id === userTrainingProfile.training_goal)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Frequentie:</span>
                    <p className="text-white font-medium">{userTrainingProfile.training_frequency}x per week</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Niveau:</span>
                    <p className="text-white font-medium">
                      {experienceLevels.find(l => l.id === userTrainingProfile.experience_level)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Equipment:</span>
                    <p className="text-white font-medium">
                      {equipmentTypes.find(t => t.id === userTrainingProfile.equipment_type)?.name}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowRequiredProfile(true)}
                className="px-4 py-2 bg-[#3A4D23] text-white rounded-lg hover:bg-[#4A5D33] transition-colors text-sm"
              >
                Bewerken
              </button>
            </div>
          </motion.div>
        )}

        {/* Training Profile Calculator */}
        <AnimatePresence>
          {showRequiredProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-[#232D1A] border border-[#8BAE5A] rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Trainingsprofiel Calculator</h3>
                <button
                  onClick={() => setShowRequiredProfile(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Training Goal */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Wat is je trainingsdoel?</label>
                  <div className="space-y-2">
                    {trainingGoals.map((goal) => (
                      <label key={goal.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        calculatorData.training_goal === goal.id 
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
                          : 'border-gray-600 hover:border-[#8BAE5A]'
                      }`}>
                        <input
                          type="radio"
                          name="training_goal"
                          value={goal.id}
                          checked={calculatorData.training_goal === goal.id}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, training_goal: e.target.value }))}
                          className="mr-3 h-4 w-4 text-[#8BAE5A] border-gray-300 focus:ring-[#8BAE5A]"
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <div className="text-white font-medium">{goal.name}</div>
                            <div className="text-sm text-gray-400">{goal.subtitle}</div>
                            <div className="text-xs text-gray-500">{goal.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Training Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Hoe vaak wil je per week trainen?</label>
                  <div className="space-y-2">
                    {trainingFrequencies.map((freq) => (
                      <label key={freq.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        calculatorData.training_frequency === freq.id.toString() 
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
                          : 'border-gray-600 hover:border-[#8BAE5A]'
                      }`}>
                        <input
                          type="radio"
                          name="training_frequency"
                          value={freq.id}
                          checked={calculatorData.training_frequency === freq.id.toString()}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, training_frequency: e.target.value }))}
                          className="mr-3 h-4 w-4 text-[#8BAE5A] border-gray-300 focus:ring-[#8BAE5A]"
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">📅</span>
                          <div>
                            <div className="text-white font-medium">{freq.name}</div>
                            <div className="text-sm text-gray-400">{freq.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Wat is je ervaringsniveau?</label>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <label key={level.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        calculatorData.experience_level === level.id 
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
                          : 'border-gray-600 hover:border-[#8BAE5A]'
                      }`}>
                        <input
                          type="radio"
                          name="experience_level"
                          value={level.id}
                          checked={calculatorData.experience_level === level.id}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, experience_level: e.target.value }))}
                          className="mr-3 h-4 w-4 text-[#8BAE5A] border-gray-300 focus:ring-[#8BAE5A]"
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{level.icon}</span>
                          <div>
                            <div className="text-white font-medium">{level.name}</div>
                            <div className="text-sm text-gray-400">{level.subtitle}</div>
                            <div className="text-xs text-gray-500">{level.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Equipment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Waar ga je trainen?</label>
                  <div className="space-y-2">
                    {equipmentTypes.map((type) => (
                      <label key={type.id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        calculatorData.equipment_type === type.id 
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10' 
                          : 'border-gray-600 hover:border-[#8BAE5A]'
                      }`}>
                        <input
                          type="radio"
                          name="equipment_type"
                          value={type.id}
                          checked={calculatorData.equipment_type === type.id}
                          onChange={(e) => setCalculatorData(prev => ({ ...prev, equipment_type: e.target.value }))}
                          className="mr-3 h-4 w-4 text-[#8BAE5A] border-gray-300 focus:ring-[#8BAE5A]"
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="text-white font-medium">{type.name}</div>
                            <div className="text-sm text-gray-400">{type.subtitle}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={calculateTrainingProfile}
                  className="px-6 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
                >
                  Profiel Opslaan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Profile - Show Calculator Button */}
        {!userTrainingProfile && !showRequiredProfile && (
          <div className="text-center py-12 mb-8">
            <CalculatorIcon className="mx-auto h-16 w-16 text-[#8BAE5A] mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Vul je trainingsprofiel in
            </h3>
            <p className="text-gray-300 mb-6">
              Vul je trainingsvoorkeuren in om gepersonaliseerde trainingsschemas te krijgen die perfect bij jou passen.
            </p>
            <button
              onClick={() => setShowRequiredProfile(true)}
              className="px-8 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
            >
              Start Trainingsprofiel
            </button>
          </div>
        )}

        {/* Training Schemas */}
        {userTrainingProfile && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Beschikbare Trainingsschemas</h2>
              <div className="text-sm text-gray-400">
                {trainingSchemas.length} schema{trainingSchemas.length !== 1 ? "'s" : ""} beschikbaar
              </div>
            </div>

            {trainingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A]"></div>
              </div>
            ) : trainingError ? (
              <div className="text-center py-12">
                <p className="text-red-400">{trainingError}</p>
              </div>
            ) : trainingSchemas.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">Geen trainingsschemas beschikbaar</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Er zijn momenteel geen trainingsschemas beschikbaar voor jouw profiel.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingSchemas.map((schema) => (
                  <motion.div
                    key={schema.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      selectedTrainingSchema === schema.id
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10'
                        : 'border-[#3A4D23] bg-[#232D1A] hover:border-[#8BAE5A]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                          <AcademicCapIcon className="h-6 w-6 text-[#8BAE5A]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{schema.name}</h3>
                          <p className="text-sm text-gray-400">{schema.difficulty}</p>
                        </div>
                      </div>
                      {selectedTrainingSchema === schema.id && (
                        <CheckIcon className="h-6 w-6 text-[#8BAE5A]" />
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {schema.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{schema.estimated_duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FireIcon className="h-4 w-4" />
                          <span>{schema.rep_range}</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-[#3A4D23] rounded text-xs">
                        {schema.category}
                      </span>
                    </div>

                    <button
                      onClick={() => selectTrainingSchema(schema.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        selectedTrainingSchema === schema.id
                          ? 'bg-[#8BAE5A] text-[#232D1A]'
                          : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                      }`}
                    >
                      {selectedTrainingSchema === schema.id ? 'Geselecteerd' : 'Selecteer dit plan'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Continue to Voedingsplannen Button - Only show during onboarding */}
        {userTrainingProfile && trainingSchemas.length > 0 && isOnboarding && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                completeStep(3);
                window.location.href = '/dashboard/voedingsplannen';
              }}
              className="px-8 py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold"
            >
              Doorgaan naar Voedingsplannen →
            </button>
            <p className="mt-2 text-sm text-gray-400">
              Je kunt later altijd terugkomen om je trainingsschema te wijzigen
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}