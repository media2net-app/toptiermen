"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon,
  EyeIcon,
  AcademicCapIcon,
  FireIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import DynamicTrainingPlanView from './components/DynamicTrainingPlanView';

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
  duration?: string;
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

interface TrainingProfile {
  id?: string;
  user_id: string;
  training_goal: 'spiermassa' | 'kracht_uithouding' | 'power_kracht';
  training_frequency: 1 | 2 | 3 | 4 | 5 | 6;
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


const equipmentTypes = [
  {
    id: 'gym',
    name: 'Gym',
    subtitle: 'Volledige gym met alle apparaten',
    description: 'Toegang tot alle gewichten en machines',
    icon: '🏋️',
  }
];

const trainingFrequencies = [
  { id: 1, name: '1x per week', description: 'Minimale training' },
  { id: 2, name: '2x per week', description: 'Basis training' },
  { id: 3, name: '3x per week', description: 'Perfect voor beginners' },
  { id: 4, name: '4x per week', description: 'Ideaal voor consistentie' },
  { id: 5, name: '5x per week', description: 'Voor gevorderden' },
  { id: 6, name: '6x per week', description: 'Maximale intensiteit' }
];

function TrainingschemasContent() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { isOnboarding, currentStep: onboardingStep, completeStep } = useOnboarding();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debug logging
  console.log('🔍 TrainingschemasContent render:', {
    user: user ? { id: user.id, email: user.email } : null,
    authLoading,
    subscriptionLoading,
    hasAccessTraining: hasAccess('training')
  });

  // Training schemas state
  const [trainingSchemas, setTrainingSchemas] = useState<TrainingSchema[]>([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [userTrainingProfile, setUserTrainingProfile] = useState<TrainingProfile | null>(null);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string | null>(null);
  const [showRequiredProfile, setShowRequiredProfile] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAllSchemas, setShowAllSchemas] = useState(false);
  const [selectedSchemaDetail, setSelectedSchemaDetail] = useState<TrainingSchema | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{isOpen: boolean, exerciseName: string, videoUrl: string}>({
    isOpen: false,
    exerciseName: '',
    videoUrl: ''
  });
  const [viewingDynamicPlan, setViewingDynamicPlan] = useState<{schemaId: string, schemaName: string} | null>(null);
  
  // Onboarding state
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showOnboardingStep3, setShowOnboardingStep3] = useState(false);
  
  // Training calculator state
  const [calculatorData, setCalculatorData] = useState({
    training_goal: '',
    training_frequency: '',
    equipment_type: 'gym'
  });

  // Training functions - using same method as admin dashboard
  const fetchTrainingSchemas = async () => {
    try {
      setTrainingLoading(true);
      setTrainingError(null);
      
      console.log('🔍 Fetching training schemas for user:', user?.email);
      
      // Use the same direct Supabase query as the admin dashboard, including days
      const { data, error } = await supabase
        .from('training_schemas')
        .select(`
          *,
          training_schema_days (
            id,
            day_number,
            name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching training schemas:', error);
        setTrainingError(`Failed to load training schemas: ${error.message}`);
        return;
      }
      
      console.log('✅ Training schemas fetched from database:', data?.length || 0);
      
      // Filter schemas based on user's profile if they have one
      let filteredSchemas = data || [];
      
      if (userTrainingProfile && !showOnboardingStep3) {
        // Only filter during normal use, not during onboarding
        filteredSchemas = filterSchemasByProfile(filteredSchemas, userTrainingProfile);
      } else if (showOnboardingStep3 && userTrainingProfile) {
        // During onboarding, show schemas that match the user's training frequency and equipment
        filteredSchemas = data?.filter(schema => {
          const schemaDays = schema.training_schema_days?.length || 0;
          const userFrequency = userTrainingProfile.training_frequency;
          const frequencyMatch = schemaDays === userFrequency;
          
          // Also match equipment type
          const equipmentMatch = schema.equipment_type === userTrainingProfile.equipment_type;
          
          console.log(`🎯 Onboarding Schema "${schema.name}": ${schemaDays} days (${frequencyMatch}), ${schema.equipment_type} equipment (${equipmentMatch})`);
          
          return frequencyMatch && equipmentMatch;
        }) || [];
        console.log('🎯 Onboarding: Showing schemas for frequency', userTrainingProfile.training_frequency, 'days and equipment', userTrainingProfile.equipment_type, ':', filteredSchemas.length);
      }
      
      setTrainingSchemas(filteredSchemas);
      console.log('✅ Training schemas loaded:', filteredSchemas.length, 'from', data?.length || 0, 'total');
      
    } catch (error) {
      console.error('Error fetching training schemas:', error);
      setTrainingError('Failed to load training schemas');
    } finally {
      setTrainingLoading(false);
    }
  };

  const filterSchemasByProfile = (schemas: TrainingSchema[], profile: TrainingProfile) => {
    // If showAllSchemas is true, return all schemas without filtering
    if (showAllSchemas) {
      console.log('🔍 Showing all schemas (filtering disabled)');
      return schemas;
    }
    
    console.log('🔍 Filtering schemas for profile:', profile);
    console.log('📊 Total schemas before filtering:', schemas.length);
    
    const filtered = schemas.filter(schema => {
      // Map user profile to database fields
      const goalMapping = {
        'spiermassa': ['spiermassa'],
        'kracht_uithouding': ['kracht', 'uithouding', 'spiermassa'], // Show multiple goal types
        'power_kracht': ['kracht', 'spiermassa'] // Show power and strength related
      };
      
      const equipmentMapping = {
        'gym': 'Gym',
        'home': 'Gym', // Home users can also use gym schemas
        'outdoor': 'Outdoor'
      };
      
      // Filter by training goal based on schema name - FLEXIBLE matching
      let goalMatch = false;
      const schemaName = schema.name.toLowerCase();
      
      if (profile.training_goal === 'spiermassa') {
        // Show schemas with 'spiermassa', 'split', or general gym schemas
        goalMatch = schemaName.includes('spiermassa') || 
                   schemaName.includes('split') || 
                   schemaName.includes('gym') ||
                   schemaName.includes('training');
      } else if (profile.training_goal === 'kracht_uithouding') {
        // Show schemas with 'conditie', 'uithouding', or general fitness
        goalMatch = schemaName.includes('conditie') || 
                   schemaName.includes('uithouding') ||
                   schemaName.includes('fitness') ||
                   schemaName.includes('cardio');
      } else if (profile.training_goal === 'power_kracht') {
        // Show schemas with 'kracht', 'power', or strength-related
        goalMatch = schemaName.includes('kracht') || 
                   schemaName.includes('power') ||
                   schemaName.includes('strength') ||
                   schemaName.includes('maximale');
      }
      
      // Filter by equipment type - FLEXIBLE matching
      let equipmentMatch = false;
      const schemaEquipment = schema.category?.toLowerCase();
      const userEquipment = profile.equipment_type?.toLowerCase();
      
      if (userEquipment === 'gym') {
        // Gym users can use gym schemas and most general schemas
        equipmentMatch = schemaEquipment === 'gym' || 
                        schemaEquipment === 'home' || 
                        !schemaEquipment; // Allow schemas without specific equipment
      } else if (userEquipment === 'home') {
        // Home users can use home, bodyweight, and gym schemas
        equipmentMatch = ['home', 'bodyweight', 'gym'].includes(schemaEquipment || '') ||
                        !schemaEquipment; // Allow schemas without specific equipment
      } else if (userEquipment === 'outdoor') {
        // Outdoor users can use outdoor, bodyweight, and home schemas
        equipmentMatch = ['outdoor', 'bodyweight', 'home'].includes(schemaEquipment || '') ||
                        !schemaEquipment; // Allow schemas without specific equipment
      }
      
      // Filter by training frequency - EXACT matching
      const schemaDays = schema.training_schema_days?.length || 0;
      const userFrequency = profile.training_frequency;
      const frequencyMatch = schemaDays === userFrequency;
      
      console.log(`📅 Schema "${schema.name}": ${schemaDays} days vs user frequency ${userFrequency} (${frequencyMatch})`);
      
      console.log(`📋 Schema "${schema.name}": goal=${schema.training_goal} (${goalMatch}), category=${schema.category} (${equipmentMatch}), frequency=${schemaDays} days (${frequencyMatch})`);
      console.log(`   User profile: goal=${profile.training_goal}, equipment=${profile.equipment_type}, frequency=${profile.training_frequency}`);
      
      return goalMatch && equipmentMatch && frequencyMatch;
    });
    
    console.log('✅ Filtered schemas:', filtered.length);
    
    // Limit to 3 schemas maximum
    const limitedSchemas = filtered.slice(0, 3);
    
    // If no schemas match the strict criteria, show some general schemas as fallback
    if (limitedSchemas.length === 0) {
      console.log('⚠️ No schemas match strict criteria, showing fallback schemas');
      const fallbackSchemas = schemas.filter(schema => {
        const schemaEquipment = schema.category?.toLowerCase();
        const userEquipment = profile.equipment_type?.toLowerCase();
        
        // Show schemas that match equipment type at least
        if (userEquipment === 'gym') {
          return schemaEquipment === 'gym' || !schemaEquipment;
        } else if (userEquipment === 'home') {
          return ['home', 'bodyweight', 'gym'].includes(schemaEquipment || '') || !schemaEquipment;
        } else if (userEquipment === 'outdoor') {
          return ['outdoor', 'bodyweight', 'home'].includes(schemaEquipment || '') || !schemaEquipment;
        }
        
        return true; // Show all if equipment type is unknown
      }).slice(0, 3); // Limit to 3 fallback schemas
      
      console.log('🔄 Showing fallback schemas:', fallbackSchemas.length);
      return fallbackSchemas;
    }
    
    return limitedSchemas; // Return limited schemas (max 3)
  };

  const fetchUserTrainingProfile = async () => {
    try {
      if (!user?.id) {
        console.log('❌ No user ID available for training profile fetch');
        return;
      }
      
      setProfileLoading(true);
      console.log('🔍 Fetching training profile for user:', user.email);
      
      // First try to get existing training profile
      const response = await fetch(`/api/training-profile?userId=${user.email}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setUserTrainingProfile(data.profile);
          console.log('✅ Training profile loaded:', data.profile);
          
          // Also update calculator data to show the profile
          setCalculatorData({
            training_goal: data.profile.training_goal,
            training_frequency: data.profile.training_frequency.toString(),
            equipment_type: data.profile.equipment_type
          });
        } else {
          console.log('ℹ️ No training profile found, checking main_goal from onboarding');
          
          // If no training profile exists, try to get main_goal from user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('main_goal')
            .eq('email', user.email)
            .single();
          
          if (profileData?.main_goal && !profileError) {
            console.log('🎯 Found main_goal from onboarding:', profileData.main_goal);
            
            // Create a basic training profile based on main_goal
            let trainingGoal = 'spiermassa'; // default
            if (profileData.main_goal.toLowerCase().includes('kracht')) {
              trainingGoal = 'power_kracht';
            } else if (profileData.main_goal.toLowerCase().includes('conditie') || 
                      profileData.main_goal.toLowerCase().includes('uithouding')) {
              trainingGoal = 'kracht_uithouding';
            }
            
            const basicProfile = {
              user_id: user.email || user.id,
              training_goal: trainingGoal as 'spiermassa' | 'kracht_uithouding' | 'power_kracht',
              training_frequency: 3 as 1 | 2 | 3 | 4 | 5 | 6, // Default to 3x per week
              equipment_type: 'gym' as 'gym' | 'home' | 'outdoor'
            };
            
            setUserTrainingProfile(basicProfile);
            console.log('🔧 Created basic training profile from main_goal:', basicProfile);
          } else {
            setUserTrainingProfile(null);
          }
        }
      } else {
        console.log('❌ Failed to fetch training profile:', response.status);
        setUserTrainingProfile(null);
      }
    } catch (error) {
      console.error('Error fetching training profile:', error);
      setUserTrainingProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveTrainingProfile = async (profileData: any) => {
    if (!user?.id) return;
    
    try {
      console.log('📤 Saving training profile for user:', user.email);
      
      const apiPayload = {
        userEmail: user.email, // Send email instead of trying to convert
        training_goal: profileData.training_goal,
        training_frequency: parseInt(profileData.training_frequency),
        equipment_type: profileData.equipment_type
      };
      
      console.log('📤 API payload:', apiPayload);
      
      const response = await fetch('/api/training-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();
      
      console.log('📥 API response:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Training profile saved successfully');
        toast.success('Je trainingsprofiel is opgeslagen!');
        setUserTrainingProfile(data.profile);
        setShowRequiredProfile(false);
        setShowCalculator(false); // Hide calculator after saving
        // Reset calculator data
        setCalculatorData({ training_goal: '', training_frequency: '', equipment_type: '' });
        
        // Fetch updated training schemas
        await fetchTrainingSchemas();
      } else {
        console.error('❌ Failed to save training profile:', data);
        toast.error(data.error || 'Failed to save training profile');
      }
    } catch (error) {
      console.error('Error saving training profile:', error);
      toast.error('Failed to save training profile');
    }
  };

  const calculateTrainingProfile = () => {
    const { training_goal, training_frequency, equipment_type } = calculatorData;
    
    console.log('🧮 Calculating training profile with data:', calculatorData);
    
    if (!training_goal || !training_frequency || !equipment_type) {
      toast.error('Vul alle velden in om je trainingsprofiel te berekenen');
      return;
    }

    const profile = {
      training_goal,
      training_frequency: parseInt(training_frequency),
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
          console.log('🎯 Completing onboarding step 3 after schema selection');
          await completeStep(3);
        } else if (showOnboardingStep3) {
          console.log('🎯 Schema selected during onboarding step 3');
          // Don't auto-complete, let user click "Volgende Stap" button
        }
      } else {
        toast.error(data.error || 'Failed to select training schema');
      }
    } catch (error) {
      console.error('Error selecting training schema:', error);
      toast.error('Failed to select training schema');
    }
  };

  const viewSchemaDetail = async (schemaId: string) => {
    try {
      console.log('🔍 Fetching schema detail for:', schemaId);
      const response = await fetch('/api/training-schema-detail/' + schemaId);
      if (!response.ok) {
        throw new Error('Failed to fetch schema details');
      }
      
      const data = await response.json();
      console.log('📋 API response:', data);
      
      if (data.success && data.schema) {
        setSelectedSchemaDetail(data.schema);
        console.log('✅ Schema detail loaded:', data.schema.name);
      } else {
        console.error('❌ Invalid API response:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching schema detail:', error);
      toast.error('Kon schema details niet laden');
    }
  };

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

  const handleViewDynamicPlan = (schemaId: string, schemaName: string) => {
    console.log('🔍 handleViewDynamicPlan called with:', { schemaId, schemaName });
    console.log('👤 User training profile:', userTrainingProfile);
    
    if (!userTrainingProfile) {
      console.log('❌ No user training profile found');
      toast.error('Vul eerst je trainingsprofiel in om het schema te kunnen bekijken');
      setShowRequiredProfile(true);
      return;
    }
    
    console.log('✅ Setting viewingDynamicPlan to:', { schemaId, schemaName });
    setViewingDynamicPlan({ schemaId, schemaName });
    console.log('🔄 State updated, should show DynamicTrainingPlanView component');
  };

  const handleBackFromDynamicPlan = () => {
    console.log('🔄 Going back from dynamic plan view');
    setViewingDynamicPlan(null);
  };

  // Effects
  useEffect(() => {
    if (user?.id) {
      console.log('🔄 User changed, fetching training profile for:', user.email);
      console.log('🔄 User details:', { id: user.id, email: user.email });
      fetchUserTrainingProfile();
    } else {
      console.log('❌ No user ID available in useEffect');
    }
  }, [user?.id]);

  // Re-fetch schemas when showAllSchemas changes
  useEffect(() => {
    if (user?.id && userTrainingProfile) {
      console.log('🔄 showAllSchemas changed, re-fetching schemas...');
      fetchTrainingSchemas();
    }
  }, [showAllSchemas]);

  useEffect(() => {
    console.log('🔄 UserTrainingProfile changed:', userTrainingProfile);
    fetchTrainingSchemas();
  }, [userTrainingProfile]);

  // Handle schema selection from URL parameter
  useEffect(() => {
    const selectParam = searchParams?.get('select');
    if (selectParam && trainingSchemas.length > 0) {
      const schema = trainingSchemas.find(s => s.id === selectParam);
      if (schema) {
        selectTrainingSchema(selectParam);
        // Remove the select parameter from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('select');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, trainingSchemas]);

  // Check onboarding status
  useEffect(() => {
    if (!user?.id) return;

    async function checkOnboardingStatus() {
      try {
        const response = await fetch(`/api/onboarding?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setOnboardingStatus(data);
          
          // Only show onboarding step 3 if onboarding is not completed and user is on step 3
          setShowOnboardingStep3(!data.onboarding_completed && data.current_step === 3);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    }

    checkOnboardingStatus();
  }, [user?.id]);

  // Show loading state while authentication is being checked
  if (authLoading || subscriptionLoading) {
    return (
      <PageLayout title="Training Schemas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Trainingsschemas laden...</h3>
            <p className="text-gray-300">Even geduld, we controleren je toegang</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <PageLayout title="Training Schemas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
              <AcademicCapIcon className="w-12 h-12 text-[#0A0F0A]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Authenticatie Vereist</h1>
            <p className="text-xl text-gray-300 mb-8">
              Je moet ingelogd zijn om trainingsschemas te bekijken
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] font-bold px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200"
            >
              Inloggen
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Check access permissions for training schemas
  if (!hasAccess('training')) {
    return (
      <PageLayout title="Training Schemas">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center">
                <AcademicCapIcon className="w-12 h-12 text-[#0A0F0A]" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Trainingsschemas</h1>
              <p className="text-xl text-gray-300 mb-8">
                Upgrade naar Premium of Lifetime voor toegang tot trainingsschemas
              </p>
            </div>
            
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">🚀 Upgrade je Account</h2>
              <p className="text-gray-300 mb-6">
                Trainingsschemas zijn alleen beschikbaar voor Premium en Lifetime leden. 
                Upgrade nu om toegang te krijgen tot:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-4 h-4 md:w-5 md:h-5 text-[#8BAE5A]" />
                  <span className="text-white text-sm md:text-base">Persoonlijke trainingsschemas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-4 h-4 md:w-5 md:h-5 text-[#8BAE5A]" />
                  <span className="text-white text-sm md:text-base">Oefening video's</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-4 h-4 md:w-5 md:h-5 text-[#8BAE5A]" />
                  <span className="text-white text-sm md:text-base">Progressie tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-4 h-4 md:w-5 md:h-5 text-[#8BAE5A]" />
                  <span className="text-white text-sm md:text-base">Trainingsadvies</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button
                  onClick={() => router.push('/pakketten/premium-tier')}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] font-bold px-6 md:px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200 text-sm md:text-base"
                >
                  Upgrade naar Premium
                </button>
                <button
                  onClick={() => router.push('/pakketten/lifetime-tier')}
                  className="bg-gradient-to-r from-[#FFD700] to-[#8BAE5A] text-[#0A0F0A] font-bold px-6 md:px-8 py-3 rounded-lg hover:from-[#FFE55C] hover:to-[#A6C97B] transition-all duration-200 text-sm md:text-base"
                >
                  Upgrade naar Lifetime
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Training Schemas">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Dynamic Training Plan View */}
        <AnimatePresence mode="wait">
          {viewingDynamicPlan ? (
            <DynamicTrainingPlanView
              schemaId={viewingDynamicPlan.schemaId}
              schemaName={viewingDynamicPlan.schemaName}
              userId={user?.id || ''}
              onBack={handleBackFromDynamicPlan}
            />
          ) : (
            <>
              {/* Header */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Trainingsschemas</h1>
                <p className="text-sm sm:text-base text-gray-300">
                  Kies en beheer je trainingsschemas voor optimale resultaten
                </p>
              </div>

        {/* Onboarding Progress - Step 3: Training Schemas */}
        {!profileLoading && showOnboardingStep3 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border-2 border-[#8BAE5A] rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl md:text-3xl">💪</span>
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Onboarding Stap 3: Trainingsschema Selecteren</h2>
                    <p className="text-[#8BAE5A] text-xs sm:text-sm">Vul je trainingsprofiel in en selecteer een trainingsschema</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#FFD700]">3/6</div>
                  <div className="text-[#8BAE5A] text-xs sm:text-sm">Stappen voltooid</div>
                </div>
              </div>
              
              {!userTrainingProfile ? (
                <div className="bg-[#181F17]/80 rounded-xl p-4 border border-[#3A4D23]">
                  <p className="text-[#f0a14f] text-sm font-semibold mb-2">
                    ⚠️ Je moet eerst je trainingsprofiel invullen
                  </p>
                  <p className="text-gray-300 text-sm">
                    Vul je trainingsvoorkeuren in om gepersonaliseerde trainingsschemas te krijgen die perfect bij jou passen.
                  </p>
                </div>
              ) : !selectedTrainingSchema ? (
                <div className="bg-[#181F17]/80 rounded-xl p-4 border border-[#3A4D23]">
                  <p className="text-[#f0a14f] text-sm font-semibold mb-2">
                    ⚠️ Selecteer een trainingsschema om door te gaan
                  </p>
                  <p className="text-gray-300 text-sm">
                    Kies een trainingsschema dat past bij je doelen en ervaringsniveau.
                  </p>
                </div>
              ) : (
                <div className="bg-[#8BAE5A]/20 rounded-xl p-4 border border-[#8BAE5A]">
                  <p className="text-[#8BAE5A] text-sm font-semibold mb-2">
                    ✅ Perfect! Je hebt een trainingsschema geselecteerd
                  </p>
                  <p className="text-gray-300 text-sm mb-4">
                    Je kunt nu door naar de volgende stap van de onboarding.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        // Mark step 3 as completed
                        const response = await fetch('/api/onboarding', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            userId: user?.id,
                            step: 3,
                            action: 'complete_step',
                            selectedTrainingSchema: selectedTrainingSchema
                          }),
                        });

                        if (response.ok) {
                          toast.success('Trainingsschema opgeslagen! Doorsturen naar voedingsplannen...');
                          // Navigate to nutrition plans
                          setTimeout(() => {
                            window.location.href = '/dashboard/voedingsplannen';
                          }, 1500);
                        } else {
                          toast.error('Er is een fout opgetreden');
                        }
                      } catch (error) {
                        console.error('Error completing step:', error);
                        toast.error('Er is een fout opgetreden');
                      }
                    }}
                    className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#181F17] px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    Volgende Stap
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* User Training Profile Summary */}
        {userTrainingProfile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                    <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Jouw Trainingsprofiel</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Gepersonaliseerd voor jouw doelen</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCalculator(true);
                    // Pre-fill calculator with current profile data
                    setCalculatorData({
                      training_goal: userTrainingProfile.training_goal,
                      training_frequency: userTrainingProfile.training_frequency.toString(),
                      equipment_type: userTrainingProfile.equipment_type
                    });
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors text-xs sm:text-sm font-medium"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bewerken
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-[#1A1A1A]/50 rounded-lg p-3 sm:p-4 border border-gray-800">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-lg sm:text-xl md:text-2xl">
                      {trainingGoals.find(g => g.id === userTrainingProfile.training_goal)?.icon}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-400">Doel</h4>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {trainingGoals.find(g => g.id === userTrainingProfile.training_goal)?.name}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#1A1A1A]/50 rounded-lg p-3 sm:p-4 border border-gray-800">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <CalendarDaysIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#8BAE5A]" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-400">Frequentie</h4>
                      <p className="text-white font-semibold text-sm sm:text-base">{userTrainingProfile.training_frequency}x per week</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#1A1A1A]/50 rounded-lg p-3 sm:p-4 border border-gray-800 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-lg sm:text-xl md:text-2xl">
                      {equipmentTypes.find(t => t.id === userTrainingProfile.equipment_type)?.icon}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-400">Equipment</h4>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        {equipmentTypes.find(t => t.id === userTrainingProfile.equipment_type)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Training Profile Calculator */}
        <AnimatePresence>
          {(showRequiredProfile || showCalculator) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                      <CalculatorIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Trainingsprofiel Calculator</h3>
                      <p className="text-xs sm:text-sm text-gray-400">Stel je persoonlijke trainingsvoorkeuren in</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowRequiredProfile(false);
                      setShowCalculator(false);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {/* Training Goal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
                      <span className="text-base md:text-lg">🎯</span>
                      <span className="text-sm md:text-base">Wat is je trainingsdoel?</span>
                    </label>
                    <div className="space-y-2 md:space-y-3">
                      {trainingGoals.map((goal) => (
                        <label key={goal.id} className={`flex items-start p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          calculatorData.training_goal === goal.id 
                            ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-lg shadow-[#8BAE5A]/20' 
                            : 'border-gray-700 hover:border-[#8BAE5A]/50 hover:bg-gray-800/50'
                        }`}>
                          <input
                            type="radio"
                            name="training_goal"
                            value={goal.id}
                            checked={calculatorData.training_goal === goal.id}
                            onChange={(e) => setCalculatorData(prev => ({ ...prev, training_goal: e.target.value }))}
                            className="mt-1 mr-4 h-4 w-4 text-[#8BAE5A] border-gray-300 focus:ring-[#8BAE5A]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 md:gap-3 mb-2">
                              <span className="text-xl md:text-2xl">{goal.icon}</span>
                              <div className="text-white font-semibold text-sm md:text-base">{goal.name}</div>
                            </div>
                            <div className="text-xs md:text-sm text-gray-300 mb-1">{goal.subtitle}</div>
                            <div className="text-xs text-gray-500">{goal.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Training Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 md:h-5 md:w-5 text-[#8BAE5A]" />
                      <span className="text-sm md:text-base">Hoe vaak wil je per week trainen?</span>
                    </label>
                    <div className="space-y-2 md:space-y-3">
                      {trainingFrequencies.map((freq) => (
                        <label key={freq.id} className={`flex items-start p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          calculatorData.training_frequency === freq.id.toString() 
                            ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-lg shadow-[#8BAE5A]/20' 
                            : 'border-gray-700 hover:border-[#8BAE5A]/50 hover:bg-gray-800/50'
                        }`}>
                          <input
                            type="radio"
                            name="training_frequency"
                            value={freq.id}
                            checked={calculatorData.training_frequency === freq.id.toString()}
                            onChange={(e) => setCalculatorData(prev => ({ ...prev, training_frequency: e.target.value }))}
                            className="mt-1 mr-4 h-4 w-4 text-[#8BAE5A] border-gray-300 focus:ring-[#8BAE5A]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 md:gap-3 mb-2">
                              <CalendarDaysIcon className="h-4 w-4 md:h-5 md:w-5 text-[#8BAE5A]" />
                              <div className="text-white font-semibold text-sm md:text-base">{freq.name}</div>
                            </div>
                            <div className="text-xs md:text-sm text-gray-300">{freq.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>


                  {/* Equipment Type - Only Gym Available */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
                      <span className="text-base md:text-lg">🏋️</span>
                      <span className="text-sm md:text-base">Waar ga je trainen?</span>
                    </label>
                    <div className="bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-xl p-3 md:p-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xl md:text-2xl">🏋️</span>
                        <div>
                          <div className="text-white font-semibold text-sm md:text-base">Gym</div>
                          <div className="text-xs md:text-sm text-gray-300">Volledige gym met alle apparaten</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 md:mt-8 flex justify-center md:justify-end">
                  <button
                    onClick={calculateTrainingProfile}
                    className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold shadow-lg shadow-[#8BAE5A]/20 text-sm sm:text-base"
                  >
                    <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    Profiel Opslaan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {profileLoading && (
          <div className="text-center py-12 mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Laden...
            </h3>
            <p className="text-gray-300">
              Je trainingsprofiel wordt geladen...
            </p>
          </div>
        )}

        {/* No Profile - Show Calculator Button */}
        {!profileLoading && !userTrainingProfile && !showRequiredProfile && (
          <div className="text-center py-8 sm:py-12 mb-6 sm:mb-8">
            <CalculatorIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[#8BAE5A] mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              Vul je trainingsprofiel in
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 px-4">
              Vul je trainingsvoorkeuren in om gepersonaliseerde trainingsschemas te krijgen die perfect bij jou passen.
            </p>
            <button
              onClick={() => setShowRequiredProfile(true)}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold text-sm sm:text-base"
            >
              Start Trainingsprofiel
            </button>
          </div>
        )}

        {/* Training Schemas */}
        {!profileLoading && userTrainingProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                    <AcademicCapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Beschikbare Trainingsschemas</h2>
                    <p className="text-xs sm:text-sm text-gray-400">Gepersonaliseerd voor jouw profiel</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-gray-400">
                    {userTrainingProfile ? 
                      `${filterSchemasByProfile(trainingSchemas, userTrainingProfile).length} schema${filterSchemasByProfile(trainingSchemas, userTrainingProfile).length !== 1 ? "'s" : ""} beschikbaar` :
                      `${trainingSchemas.length} schema${trainingSchemas.length !== 1 ? "'s" : ""} beschikbaar`
                    }
                    {showAllSchemas && (
                      <span className="ml-2 text-[#8BAE5A]">(alle schemas)</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAllSchemas(!showAllSchemas)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                      showAllSchemas
                        ? 'bg-[#8BAE5A] text-[#232D1A]'
                        : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                    }`}
                  >
                    <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{showAllSchemas ? 'Toon gefilterde' : 'Bekijk alle schemas'}</span>
                    <span className="sm:hidden">{showAllSchemas ? 'Gefilterd' : 'Alle'}</span>
                  </button>
                </div>
              </div>

            {trainingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A]"></div>
              </div>
            ) : trainingError ? (
              <div className="text-center py-12">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
                  <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Fout bij laden</h3>
                  <p className="text-red-400 text-sm mb-4">{trainingError}</p>
                  <button
                    onClick={() => {
                      setTrainingError(null);
                      fetchTrainingSchemas();
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    Opnieuw proberen
                  </button>
                </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {trainingSchemas.map((schema) => (
                  <motion.div
                    key={schema.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`p-3 sm:p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                      selectedTrainingSchema === schema.id
                        ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-[#8BAE5A]/20'
                        : 'border-gray-700 bg-[#1A1A1A]/50 hover:border-[#8BAE5A]/50 hover:shadow-[#8BAE5A]/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="p-2 sm:p-3 bg-[#8BAE5A]/20 rounded-xl">
                          <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#8BAE5A]" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">{schema.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">{schema.difficulty}</p>
                        </div>
                      </div>
                      {selectedTrainingSchema === schema.id && (
                        <div className="p-1.5 sm:p-2 bg-[#8BAE5A] rounded-full">
                          <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#232D1A]" />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
                      {schema.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#8BAE5A]" />
                          <span className="text-xs sm:text-sm">{schema.estimated_duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FireIcon className="h-3 w-3 sm:h-4 sm:w-4 text-[#8BAE5A]" />
                          <span className="text-xs sm:text-sm">{schema.rep_range}</span>
                        </div>
                      </div>
                      <span className="px-2 sm:px-3 py-1 bg-[#3A4D23] rounded-full text-xs font-medium self-start sm:self-auto">
                        {schema.category}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3">
                      <button
                        onClick={() => handleViewDynamicPlan(schema.id, schema.name)}
                        className="w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors bg-[#8BAE5A] text-[#232D1A] hover:bg-[#7A9D4A] shadow-lg shadow-[#8BAE5A]/20 text-xs sm:text-sm"
                      >
                        Bekijk schema
                      </button>
                      <button
                        onClick={() => selectTrainingSchema(schema.id)}
                        className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                          selectedTrainingSchema === schema.id
                            ? 'bg-[#8BAE5A] text-[#232D1A] shadow-lg shadow-[#8BAE5A]/20'
                            : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                        }`}
                      >
                        {selectedTrainingSchema === schema.id ? 'Geselecteerd' : 'Selecteer'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </div>
          </motion.div>
        )}


        {/* Continue to Voedingsplannen Button - Only show during onboarding and when schema is selected */}
        {userTrainingProfile && trainingSchemas.length > 0 && isOnboarding && selectedTrainingSchema && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
                <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                  <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">Trainingsschema Geselecteerd!</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Je bent klaar voor de volgende stap</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  completeStep(3);
                  window.location.href = '/dashboard/voedingsplannen';
                }}
                className="flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold shadow-lg shadow-[#8BAE5A]/20 mx-auto text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Doorgaan naar Voedingsplannen</span>
                <span className="sm:hidden">Volgende Stap</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400 px-4">
                Je kunt later altijd terugkomen om je trainingsschema te wijzigen
              </p>
            </div>
          </motion.div>
        )}

        {/* Video Modal */}
        {videoModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] rounded-2xl p-3 sm:p-6 border border-gray-800 max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm sm:text-xl font-semibold text-white">{videoModal.exerciseName}</h3>
                </div>
                <button
                  onClick={closeVideoModal}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
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
              <div className="mt-3 sm:mt-6 flex justify-end">
                <button
                  onClick={closeVideoModal}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-[#8BAE5A] text-[#232D1A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-medium shadow-lg shadow-[#8BAE5A]/20 text-sm sm:text-base"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </div>
        )}
            </>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}

export default function TrainingschemasPage() {
  return (
    <Suspense fallback={
      <PageLayout title="Training Schemas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </PageLayout>
    }>
      <TrainingschemasContent />
    </Suspense>
  );
}