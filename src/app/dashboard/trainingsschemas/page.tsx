"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
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
  CalendarDaysIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useOnboardingV2 } from "@/contexts/OnboardingV2Context";
import OnboardingNotice from '@/components/OnboardingNotice';
import OnboardingV2Progress from '@/components/OnboardingV2Progress';
import OnboardingLoadingOverlay from '@/components/OnboardingLoadingOverlay';
import PostOnboardingSchemaModal from '@/components/PostOnboardingSchemaModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import DynamicTrainingPlanView from './components/DynamicTrainingPlanView';
import SchemaChangeWarningModal from '@/components/SchemaChangeWarningModal';

interface TrainingSchema {
  id: string;
  name: string;
  // The following fields are optional in list view to allow minimal selects
  description?: string;
  category?: string;
  cover_image?: string | null;
  status?: string;
  difficulty?: string;
  estimated_duration?: string;
  target_audience?: string | null;
  training_goal: string;
  rep_range?: string;
  rest_time_seconds?: number;
  equipment_type: string;
  schema_nummer: number | null;
  duration?: string;
  training_schema_days?: {
    id?: string;
    day_number: number;
    name?: string;
    training_schema_exercises?: {
      id?: string;
      exercise_name?: string;
      notes?: string;
      sets?: number;
      reps?: string;
      rest_time_seconds?: number;
      order_index?: number;
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

interface SchemaPeriod {
  id: string;
  user_id: string;
  training_schema_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
  training_schemas?: {
    id: string;
    name: string;
    description: string;
    difficulty: string;
    schema_nummer: number | null;
  };
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
  { id: 1, name: '1x per week' },
  { id: 2, name: '2x per week' },
  { id: 3, name: '3x per week' },
  { id: 4, name: '4x per week' },
  { id: 5, name: '5x per week' },
  { id: 6, name: '6x per week' }
];

function TrainingschemasContent() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { isCompleted, currentStep: onboardingStep, completeStep, showLoadingOverlay, loadingText, loadingProgress } = useOnboardingV2();
  const { hasAccess, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ref to the continue button section for auto-scroll during onboarding
  const continueRef = useRef<HTMLDivElement | null>(null);
  // Ref to the calculator section to scroll into view when opened
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  // Ref to the available training schemas section
  const availableSchemasRef = useRef<HTMLDivElement | null>(null);
  const [highlightAvailable, setHighlightAvailable] = useState(false);
  // Scroll intent after saving profile to ensure we scroll after mount
  const [scrollToAvailablePending, setScrollToAvailablePending] = useState(false);

  // DEBUG: Enhanced logging (moved after state declarations)

  // Training schemas state
  const [trainingSchemas, setTrainingSchemas] = useState<TrainingSchema[]>([]);
  const [allTrainingSchemas, setAllTrainingSchemas] = useState<TrainingSchema[]>([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [userTrainingProfile, setUserTrainingProfile] = useState<TrainingProfile | null>(null);
  const [selectedTrainingSchema, setSelectedTrainingSchema] = useState<string | null>(null);
  const [unlockedSchemas, setUnlockedSchemas] = useState<{ [key: number]: boolean }>({ 1: true, 2: false, 3: false });
  const [schemaCompletionStatus, setSchemaCompletionStatus] = useState<{ [key: string]: boolean }>({});
  const [showRequiredProfile, setShowRequiredProfile] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSchemaWarningModal, setShowSchemaWarningModal] = useState(false);
  const [schemaToChange, setSchemaToChange] = useState<string | null>(null);
  const [showSchemaChangeWarningModal, setShowSchemaChangeWarningModal] = useState(false);
  const [showAllSchemas, setShowAllSchemas] = useState(false);
  const [selectedSchemaDetail, setSelectedSchemaDetail] = useState<TrainingSchema | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentSchemaPeriod, setCurrentSchemaPeriod] = useState<SchemaPeriod | null>(null);
  const [schemaPeriodLoading, setSchemaPeriodLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{isOpen: boolean, exerciseName: string, videoUrl: string}>({
    isOpen: false,
    exerciseName: '',
    videoUrl: ''
  });
  
  // Post-onboarding modal state
  const [showPostOnboardingModal, setShowPostOnboardingModal] = useState(false);
  const [selectedSchemaForModal, setSelectedSchemaForModal] = useState<TrainingSchema | null>(null);
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

  // Auto-scroll to calculator whenever it opens (required profile prompt or manual open)
  useEffect(() => {
    if (showRequiredProfile || showCalculator) {
      setTimeout(() => {
        try {
          calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {}
      }, 100);
    }
  }, [showRequiredProfile, showCalculator]);

  // When profile and filtered schemas are ready and a scroll is pending, perform the scroll
  useEffect(() => {
    if (scrollToAvailablePending && userTrainingProfile && trainingSchemas.length > 0) {
      setTimeout(() => {
        try {
          availableSchemasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setHighlightAvailable(true);
          setTimeout(() => setHighlightAvailable(false), 1200);
        } catch {}
        setScrollToAvailablePending(false);
      }, 150);
    }
  }, [scrollToAvailablePending, userTrainingProfile, trainingSchemas.length]);

  // DEBUG: Enhanced logging (after all state declarations)
  console.log('🔍 TrainingschemasContent render:', {
    user: user ? { id: user.id, email: user.email } : null,
    authLoading,
    subscriptionLoading,
    hasAccessTraining: hasAccess('training'),
    profileLoading,
    trainingLoading,
    userTrainingProfile: userTrainingProfile ? {
      training_goal: userTrainingProfile.training_goal,
      training_frequency: userTrainingProfile.training_frequency,
      equipment_type: userTrainingProfile.equipment_type
    } : null,
    trainingSchemasCount: trainingSchemas.length,
    showOnboardingStep3,
    onboardingStatus,
    currentSchemaPeriod: currentSchemaPeriod ? {
      id: currentSchemaPeriod.id,
      training_schema_id: currentSchemaPeriod.training_schema_id,
      start_date: currentSchemaPeriod.start_date,
      end_date: currentSchemaPeriod.end_date,
      status: currentSchemaPeriod.status,
      schema_name: currentSchemaPeriod.training_schemas?.name
    } : null
  });

  // Fetch current schema period
  const fetchCurrentSchemaPeriod = async () => {
    if (!user?.id) {
      console.log('⚠️ fetchCurrentSchemaPeriod: No user ID');
      return;
    }
    
    console.log('🔄 fetchCurrentSchemaPeriod: Starting fetch for user:', user.id);
    
    try {
      setSchemaPeriodLoading(true);
      const response = await fetch(`/api/training-schema-period?userId=${user.id}`);
      const result = await response.json();
      
      console.log('📡 fetchCurrentSchemaPeriod: API response:', result);
      
      if (response.ok && result.data) {
        // Transform the API response to match the expected format
        // The API returns schema_start_date and schema_end_date, not start_date and end_date
        const transformedData = {
          id: result.data.selected_schema_id,
          user_id: user.id,
          training_schema_id: result.data.selected_schema_id,
          start_date: result.data.schema_start_date,
          end_date: result.data.schema_end_date,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          training_schemas: result.data.training_schema
        };
        
        console.log('🔍 fetchCurrentSchemaPeriod: Raw schema_start_date:', result.data.schema_start_date);
        console.log('🔍 fetchCurrentSchemaPeriod: Raw schema_end_date:', result.data.schema_end_date);
        console.log('🔍 fetchCurrentSchemaPeriod: Start date parsed:', new Date(transformedData.start_date));
        console.log('🔍 fetchCurrentSchemaPeriod: End date parsed:', new Date(transformedData.end_date));
        console.log('🔍 fetchCurrentSchemaPeriod: Is start_date valid?', !isNaN(new Date(transformedData.start_date).getTime()));
        console.log('🔍 fetchCurrentSchemaPeriod: Is end_date valid?', !isNaN(new Date(transformedData.end_date).getTime()));
        console.log('🔍 fetchCurrentSchemaPeriod: Schema name:', transformedData.training_schemas?.name);
        
        setCurrentSchemaPeriod(transformedData);
        console.log('✅ Current schema period loaded:', transformedData);
      } else {
        console.log('⚠️ No active schema period found');
        setCurrentSchemaPeriod(null);
      }
    } catch (error) {
      console.error('❌ Error fetching schema period:', error);
      setCurrentSchemaPeriod(null);
    } finally {
      setSchemaPeriodLoading(false);
    }
  };

  // Refresh schema period data when user comes back to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id) {
        console.log('🔄 Page became visible, refreshing schema period data...');
        fetchCurrentSchemaPeriod();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id]);

  // Fetch user's schema progress to determine which schemas are unlocked
  const fetchSchemaProgress = async (userId: string) => {
    try {
      console.log('🔍 Fetching schema progress for user:', userId);
      const response = await fetch(`/api/user/schema-progress?userId=${userId}`);
      const data = await response.json();
      
      if (data.unlockedSchemas) {
        setUnlockedSchemas(data.unlockedSchemas);
        console.log('✅ Schema progress loaded:', data.unlockedSchemas);
      }
    } catch (error) {
      console.error('❌ Error fetching schema progress:', error);
      // Default to only Schema 1 unlocked
      setUnlockedSchemas({ 1: true, 2: false, 3: false });
    }
  };

  // Fetch schema completion status
  const fetchSchemaCompletionStatus = async (userId: string) => {
    try {
      console.log('🔍 Fetching schema completion status for user:', userId);
      const response = await fetch(`/api/schema-completion?userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.schemas) {
        // Create a map of schema completion status
        const completionStatus: Record<string, boolean> = {};
        data.schemas.forEach((schema: any) => {
          if (schema.completed_at) {
            completionStatus[schema.schema_id] = true;
          }
        });
        setSchemaCompletionStatus(completionStatus);
        console.log('✅ Schema completion status loaded:', completionStatus);
      }
    } catch (error) {
      console.error('❌ Error fetching schema completion status:', error);
      setSchemaCompletionStatus({});
    }
  };

  // Training functions - using same method as admin dashboard
  const fetchTrainingSchemas = async () => {
    try {
      setTrainingLoading(true);
      setTrainingError(null);
      
      console.log('⚡ [PERFORMANCE] Fetching training schemas for user:', user?.email);
      const startTime = Date.now();
      
      // OPTIMIZED: Use direct Supabase query with performance timing
      const { data, error } = await supabase
        .from('training_schemas')
        .select(`
          id,
          name,
          training_goal,
          equipment_type,
          schema_nummer,
          training_schema_days (
            day_number
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      const queryTime = Date.now() - startTime;
      console.log(`⚡ [PERFORMANCE] Training schemas query completed in ${queryTime}ms`);
      
      if (error) {
        console.error('❌ Error fetching training schemas:', error);
        setTrainingError(`Failed to load training schemas: ${error.message}`);
        return;
      }
      
      console.log('✅ Training schemas fetched from database:', data?.length || 0);
      
      // Store all schemas for re-filtering (cast to our app type)
      const minimalList = (data || []) as unknown as TrainingSchema[];
      setAllTrainingSchemas(minimalList);
      
      // Filter schemas based on user's profile if they have one
      let filteredSchemas: TrainingSchema[] = minimalList;
      
      if (userTrainingProfile && !showOnboardingStep3) {
        // Only filter during normal use, not during onboarding
        filteredSchemas = filterSchemasByProfile(filteredSchemas, userTrainingProfile);
      } else if (showOnboardingStep3 && userTrainingProfile) {
        // During onboarding, show schemas that match the user's training goal, frequency and equipment
        if (userTrainingProfile) {
          filteredSchemas = filterSchemasByProfile(data || [], userTrainingProfile);
          console.log('🎯 Onboarding: Using profile-based filtering');
        } else {
          // Fallback to real schemas if no profile - prefer 3-day schemas
          let fallbackSchemas = (data || []).filter(s => 
            s.training_goal === 'spiermassa' && 
            s.equipment_type === 'gym' &&
            (s.training_schema_days?.length || 0) === 3
          ).sort((a, b) => (a.schema_nummer || 0) - (b.schema_nummer || 0));
          
          // If not enough 3-day schemas, add other frequencies to reach 3 schemas
          if (fallbackSchemas.length < 3) {
            const otherSchemas = (data || []).filter(s => 
              s.training_goal === 'spiermassa' && 
              s.equipment_type === 'gym' &&
              (s.training_schema_days?.length || 0) !== 3
            ).sort((a, b) => (a.schema_nummer || 0) - (b.schema_nummer || 0));
            
            // Add other schemas to reach 3 total
            const needed = 3 - fallbackSchemas.length;
            fallbackSchemas = [...fallbackSchemas, ...otherSchemas.slice(0, needed)];
          }
          
          filteredSchemas = fallbackSchemas.slice(0, 3);
          console.log('🎯 Onboarding: Using fallback schemas (spiermassa + gym, prefer 3-day)');
          console.log('📊 Fallback schemas:', filteredSchemas.map(s => `${s.name} (${s.training_schema_days?.length || 0} days)`));
        }
      }
      
      setTrainingSchemas(filteredSchemas);
      console.log('✅ Training schemas loaded:', filteredSchemas.length, 'from', data?.length || 0, 'total');
      
    } catch (error) {
      console.error('❌ Training schemas fetch error:', error);
      setTrainingError(error instanceof Error ? error.message : 'Failed to load training schemas');
    } finally {
      setTrainingLoading(false);
    }
  };

  // OPTIMIZED: Parallel data loading function with enhanced debugging, timeout, and retry
  const loadAllData = async (retryCount = 0) => {
    if (!user?.id) {
      console.log('❌ loadAllData: No user ID available');
      return;
    }
    
    console.log(`⚡ [PERFORMANCE] Starting parallel data loading for user: ${user.email} (attempt ${retryCount + 1})`);
    const totalStartTime = Date.now();
    console.log('🔍 Current state before loading:', {
      profileLoading,
      trainingLoading,
      userTrainingProfile: userTrainingProfile ? 'exists' : 'null',
      trainingSchemasCount: trainingSchemas.length
    });
    
    // Add overall timeout to prevent infinite loading
    const overallTimeout = setTimeout(() => {
      console.warn('⚠️ Overall loading timeout reached (30s), forcing completion...');
      setTrainingLoading(false);
      setProfileLoading(false);
      setTrainingError('Loading duurde te lang. Probeer de pagina te verversen.');
    }, 30000); // 30 second overall timeout
    
    try {
      setTrainingLoading(true);
      setProfileLoading(true);
      
      // Start all API calls in parallel with timeouts
      console.log('📡 Starting parallel API calls with timeouts...');
      
      // Helper function to add timeout to fetch requests
      const fetchWithTimeout = (url: string, timeout = 10000) => {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Request timeout: ${url}`)), timeout)
          )
        ]);
      };
      
      const [schemasResult, profileResult, periodResult, progressResult, completionResult] = await Promise.allSettled([
        // Load training schemas with timeout
        Promise.race([
          supabase
            .from('training_schemas')
            .select(`
              id,
              name,
              training_goal,
              equipment_type,
              schema_nummer,
              training_schema_days (
                day_number
              )
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Training schemas query timeout')), 15000)
          )
        ]),
        
        // Load training profile with timeout
        fetchWithTimeout(`/api/training-profile?userId=${user.email}`, 10000),
        
        // Load current schema period with timeout
        fetchWithTimeout(`/api/training-schema-period?userId=${user.id}`, 10000),
        
        // Load schema progress with timeout
        fetchWithTimeout(`/api/user/schema-progress?userId=${user.id}`, 10000),
        
        // Load schema completion status with timeout
        fetchWithTimeout(`/api/schema-completion?userId=${user.id}`, 10000)
      ]);
      
      console.log('📡 API calls completed:', {
        schemasStatus: schemasResult.status,
        profileStatus: profileResult.status,
        periodStatus: periodResult.status,
        progressStatus: progressResult.status
      });
      
      // Process training schemas with enhanced error handling
      let allSchemas: TrainingSchema[] = [];
      if (schemasResult.status === 'fulfilled') {
        const { data, error } = schemasResult.value as { data: any; error: any };
        if (error) {
          console.error('❌ Error fetching training schemas:', error);
          setTrainingError(`Failed to load training schemas: ${error.message}`);
          // Try fallback: load schemas without joins
          try {
            console.log('🔄 Attempting fallback schema loading...');
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('training_schemas')
              .select('*')
              .eq('status', 'published')
              .order('created_at', { ascending: false })
              .limit(50);
            
            if (!fallbackError && fallbackData) {
              allSchemas = fallbackData;
              console.log('✅ Fallback schemas loaded:', allSchemas.length);
              setTrainingError(null);
            }
          } catch (fallbackErr) {
            console.error('❌ Fallback schema loading failed:', fallbackErr);
          }
        } else {
          console.log('✅ Training schemas loaded:', data?.length || 0, 'schemas');
          allSchemas = data || [];
        }
      } else {
        console.error('❌ Training schemas promise rejected:', schemasResult.reason);
        setTrainingError(`Training schemas failed: ${schemasResult.reason?.message || 'Unknown error'}`);
        
        // Try fallback loading
        try {
          console.log('🔄 Attempting fallback schema loading after promise rejection...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('training_schemas')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (!fallbackError && fallbackData) {
            allSchemas = fallbackData;
            console.log('✅ Fallback schemas loaded after rejection:', allSchemas.length);
            setTrainingError(null);
          }
        } catch (fallbackErr) {
          console.error('❌ Fallback schema loading failed:', fallbackErr);
        }
      }
      
      // Process training profile with enhanced error handling
      let userProfile: TrainingProfile | null = null;
      if (profileResult.status === 'fulfilled') {
        const response = profileResult.value as Response;
        console.log('📡 Profile API response status:', response.status);
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log('📡 Profile API response data:', data);
            
            if (data.success && data.profile) {
              userProfile = data.profile;
              setUserTrainingProfile(data.profile);
              console.log('✅ Training profile loaded:', data.profile);
              
              // Update calculator data
              setCalculatorData({
                training_goal: data.profile.training_goal,
                training_frequency: data.profile.training_frequency.toString(),
                equipment_type: data.profile.equipment_type
              });
            } else {
              console.log('ℹ️ No training profile found');
              if (!showOnboardingStep3) {
                console.log('🔧 Creating basic profile for non-onboarding user');
                await createBasicProfile();
              }
            }
          } catch (jsonError) {
            console.error('❌ Error parsing profile JSON:', jsonError);
            if (!showOnboardingStep3) {
              await createBasicProfile();
            }
          }
        } else {
          console.error('❌ Profile API error:', response.status, response.statusText);
          if (!showOnboardingStep3) {
            await createBasicProfile();
          }
        }
      } else {
        console.error('❌ Training profile promise rejected:', profileResult.reason);
        console.log('🔄 Profile API failed, attempting to create basic profile...');
        if (!showOnboardingStep3) {
          try {
            await createBasicProfile();
          } catch (createError) {
            console.error('❌ Failed to create basic profile:', createError);
          }
        }
      }
      
      // Process schema period
      if (periodResult.status === 'fulfilled') {
        const response = periodResult.value as Response;
        if (response.ok) {
          const result = await response.json();
          // Transform to match SchemaPeriod interface (align with fetchCurrentSchemaPeriod)
          if (result?.data) {
            const transformedData = {
              id: result.data.selected_schema_id,
              user_id: user.id,
              training_schema_id: result.data.selected_schema_id,
              start_date: result.data.schema_start_date,
              end_date: result.data.schema_end_date,
              status: 'active' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              training_schemas: result.data.training_schema
            };
            setCurrentSchemaPeriod(transformedData);
            console.log('✅ Current schema period loaded:', transformedData);
          } else {
            console.log('⚠️ No active schema period found');
            setCurrentSchemaPeriod(null);
          }
        } else {
          console.log('⚠️ No active schema period found');
          setCurrentSchemaPeriod(null);
        }
      } else {
        console.error('❌ Schema period promise rejected:', periodResult.reason);
        setCurrentSchemaPeriod(null);
      }
      
      // Process schema progress
      if (progressResult.status === 'fulfilled') {
        const response = progressResult.value as Response;
        if (response.ok) {
          const data = await response.json();
          if (data.unlockedSchemas) {
            setUnlockedSchemas(data.unlockedSchemas);
            console.log('✅ Schema progress loaded:', data.unlockedSchemas);
          }
        } else {
          console.log('⚠️ Schema progress API error:', response.status);
          setUnlockedSchemas({ 1: true, 2: false, 3: false });
        }
      } else {
        console.error('❌ Schema progress promise rejected:', progressResult.reason);
        setUnlockedSchemas({ 1: true, 2: false, 3: false });
      }
      
      // Process schema completion status
      if (completionResult.status === 'fulfilled') {
        const response = completionResult.value as Response;
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.schemas) {
            // Create a map of schema completion status
            const completionStatus: Record<string, boolean> = {};
            data.schemas.forEach((schema: any) => {
              if (schema.completed_at) {
                completionStatus[schema.schema_id] = true;
              }
            });
            setSchemaCompletionStatus(completionStatus);
            console.log('✅ Schema completion status loaded:', completionStatus);
          }
        } else {
          console.log('⚠️ Schema completion API error:', response.status);
        }
      } else {
        console.error('❌ Schema completion promise rejected:', completionResult.reason);
      }
      
      // Apply filtering after both data sources are loaded
      console.log('🎯 Applying filtering...', {
        hasProfile: !!userProfile,
        schemasCount: allSchemas.length
      });
      
      // Store all schemas for re-filtering
      setAllTrainingSchemas(allSchemas);
      
      if (userProfile && allSchemas.length > 0) {
        const filtered = filterSchemasByProfile(allSchemas, userProfile);
        setTrainingSchemas(filtered);
        console.log('🎯 Applied filtering:', filtered.length, 'schemas');
      } else {
        // If no profile, show real schemas for spiermassa + gym as fallback
        // Try to find 3-day schemas first (most common), then fallback to any available
        let fallbackSchemas = allSchemas.filter(s => 
          s.training_goal === 'spiermassa' && 
          s.equipment_type === 'gym' &&
          (s.training_schema_days?.length || 0) === 3
        ).sort((a, b) => (a.schema_nummer || 0) - (b.schema_nummer || 0));
        
        // If not enough 3-day schemas, add other frequencies to reach 3 schemas
        if (fallbackSchemas.length < 3) {
          const otherSchemas = allSchemas.filter(s => 
            s.training_goal === 'spiermassa' && 
            s.equipment_type === 'gym' &&
            (s.training_schema_days?.length || 0) !== 3
          ).sort((a, b) => (a.schema_nummer || 0) - (b.schema_nummer || 0));
          
          // Add other schemas to reach 3 total
          const needed = 3 - fallbackSchemas.length;
          fallbackSchemas = [...fallbackSchemas, ...otherSchemas.slice(0, needed)];
        }
        
        // Take first 3 schemas
        fallbackSchemas = fallbackSchemas.slice(0, 3);
        
        setTrainingSchemas(fallbackSchemas);
        console.log('🎯 No profile found, showing fallback schemas (spiermassa + gym):', fallbackSchemas.length);
        console.log('📊 Fallback schemas:', fallbackSchemas.map(s => `${s.name} (${s.training_schema_days?.length || 0} days)`));
      }
      
    } catch (error) {
      console.error('❌ Parallel loading error:', error);
      
      // Auto-retry for network errors (max 2 retries)
      if (retryCount < 2 && (error instanceof TypeError || error instanceof Error)) {
        console.log(`🔄 Auto-retry ${retryCount + 1}/2 in 3 seconds...`);
        setTimeout(() => {
          loadAllData(retryCount + 1);
        }, 3000);
        return;
      }
      
      setTrainingError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clear the overall timeout
      clearTimeout(overallTimeout);
      
      const totalTime = Date.now() - totalStartTime;
      console.log(`⚡ [PERFORMANCE] Total loading time: ${totalTime}ms`);
      console.log('🏁 Loading completed, setting loading states to false');
      setTrainingLoading(false);
      setProfileLoading(false);
    }
  };

  // Function to convert database field names to user-friendly names
  const getDisplayName = (dbValue: string): string => {
    const displayMapping: { [key: string]: string } = {
      'spiermassa': 'Spiermassa',
      'power_kracht': 'Power & Kracht',
      'kracht_uithouding': 'Kracht & Uithouding',
      'gym': 'Gym',
      'home': 'Thuis',
      'outdoor': 'Buiten'
    };
    return displayMapping[dbValue] || dbValue;
  };

  const filterSchemasByProfile = (schemas: TrainingSchema[], profile: TrainingProfile) => {
    console.log('🔍 Filtering schemas for profile:', profile);
    console.log('📊 Total schemas before filtering:', schemas.length);
    console.log('🎯 Looking for schemas with:', {
      goal: profile.training_goal,
      frequency: profile.training_frequency,
      equipment: profile.equipment_type
    });
    
    // Map frontend training goals to database values
    const goalMapping: { [key: string]: string } = {
      'spiermassa': 'spiermassa',
      'kracht': 'power_kracht', 
      'conditie': 'kracht_uithouding',
      'kracht/conditie': 'kracht_uithouding',
      'kracht/power': 'power_kracht',
      'Power & Kracht': 'power_kracht',
      'Kracht & Uithouding': 'kracht_uithouding', // Frontend naam -> Database naam
      'power_kracht': 'power_kracht',
      'kracht_uithouding': 'kracht_uithouding'
    };
    
    // Get the correct database goal value
    const dbGoal = goalMapping[profile.training_goal] || profile.training_goal;
    
    console.log(`🎯 Mapping frontend goal "${profile.training_goal}" to database goal "${dbGoal}"`);
    
    // OPTIMIZED: Use more efficient filtering with early returns
    const startTime = Date.now();
    
    // NEW APPROACH: Always show ALL schemas that match goal + frequency, regardless of equipment type
    // This ensures users see all 3 schemas (1, 2, 3) for their chosen goal and frequency
    const primaryMatches = schemas.filter(schema => {
      // Early return for performance
      if (schema.training_goal !== dbGoal) return false;
      if ((schema.training_schema_days?.length || 0) !== profile.training_frequency) return false;
      
      return true;
    });
    
    const filterTime = Date.now() - startTime;
    console.log(`⚡ [PERFORMANCE] Filtering completed in ${filterTime}ms`);
    
    console.log(`🎯 Primary matches (goal + frequency): ${primaryMatches.length}`);
    primaryMatches.forEach(schema => {
      console.log(`  ✅ "${schema.name}" - Schema ${schema.schema_nummer} (${schema.training_goal}, ${schema.equipment_type}, ${schema.training_schema_days?.length || 0} days)`);
    });
    
    // OPTIMIZED: Use Map for faster deduplication
    const uniqueMatchesMap = new Map<number, TrainingSchema>();
    primaryMatches.forEach(schema => {
      if (schema.schema_nummer && !uniqueMatchesMap.has(schema.schema_nummer)) {
        uniqueMatchesMap.set(schema.schema_nummer, schema);
      }
    });
    
    const uniqueMatches = Array.from(uniqueMatchesMap.values());
    
    console.log(`🎯 Unique matches after deduplication: ${uniqueMatches.length}`);
    
    // Sort by schema number to ensure consistent ordering (1, 2, 3)
    const sortedMatches = uniqueMatches.sort((a, b) => {
      const aNum = a.schema_nummer || 0;
      const bNum = b.schema_nummer || 0;
      return aNum - bNum;
    });
    
    // Take first 3 schemas (should be Schema 1, 2, 3)
    let result = sortedMatches.slice(0, 3);
    
    console.log(`🎯 Final result: ${result.length} schemas`);
    result.forEach((schema, index) => {
      console.log(`  ${index + 1}. Schema ${schema.schema_nummer}: "${schema.name}" (${schema.training_goal}, ${schema.equipment_type}, ${schema.training_schema_days?.length || 0} days) - Status: ${schema.status}`);
    });
    
    // If we don't have enough matches, show what we have with clear messaging
    if (result.length === 0) {
      console.log('⚠️ No matches found, showing fallback schemas');
      // Fallback to goal only (any frequency, any equipment)
      const fallbackMatches = schemas.filter(schema => {
        const goalMatch = schema.training_goal === dbGoal;
        return goalMatch;
      });
      
      // Deduplicate and sort
      const uniqueFallback = fallbackMatches.reduce((acc, schema) => {
        const existing = acc.find(s => s.schema_nummer === schema.schema_nummer);
        if (!existing) {
          acc.push(schema);
        }
        return acc;
      }, [] as TrainingSchema[]);
      
      result = uniqueFallback.sort((a, b) => (a.schema_nummer || 0) - (b.schema_nummer || 0)).slice(0, 3);
    } else if (result.length < 3) {
      console.log(`⚠️ Only ${result.length} matches found for ${profile.training_frequency}x per week ${dbGoal}`);
      console.log('📝 This is expected if the database doesn\'t have all 3 schemas for this frequency');
      
      // Show a helpful message to the user about available schemas
      if (result.length === 1) {
        console.log(`ℹ️ Only Schema ${result[0].schema_nummer} is available for ${profile.training_frequency}x per week ${dbGoal}`);
      } else if (result.length === 2) {
        const schemaNumbers = result.map(s => s.schema_nummer).sort();
        console.log(`ℹ️ Only Schemas ${schemaNumbers.join(' and ')} are available for ${profile.training_frequency}x per week ${dbGoal}`);
      }
    }
    
    console.log('✅ Final filtered schemas:', result.length);
    result.forEach((schema, index) => {
      console.log(`  ${index + 1}. Schema ${schema.schema_nummer}: "${schema.name}" (${schema.training_goal}, ${schema.equipment_type}, ${schema.training_schema_days?.length || 0} days) - Status: ${schema.status}`);
    });
    
    return result;
  };

  // OPTIMIZED: Create basic profile function with enhanced debugging
  const createBasicProfile = async () => {
    try {
      console.log('🔧 Creating basic training profile for user:', user?.email);
      
      // Don't create automatic profile during onboarding step 3
      if (showOnboardingStep3) {
        console.log('🎯 Onboarding step 3 active - not creating automatic profile, user should fill form manually');
        setUserTrainingProfile(null);
        return;
      }
      
      // Get main_goal from user profile
      console.log('📡 Fetching main_goal from profiles table...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('main_goal')
        .eq('email', user?.email)
        .single();
      
      console.log('📡 Profile data result:', { profileData, profileError });
      
      if (profileData?.main_goal && !profileError) {
        console.log('🎯 Found main_goal from onboarding:', profileData.main_goal);
        
        // Create a basic training profile based on main_goal
        let trainingGoal = 'spiermassa'; // default
        const mainGoal = profileData.main_goal.toLowerCase();
        
        if (mainGoal.includes('power') || mainGoal.includes('kracht')) {
          trainingGoal = 'power_kracht';
        } else if (mainGoal.includes('conditie') || mainGoal.includes('uithouding')) {
          trainingGoal = 'kracht_uithouding';
        } else if (mainGoal.includes('spiermassa')) {
          trainingGoal = 'spiermassa';
        }
        
        console.log('🎯 Mapped training goal:', { mainGoal, trainingGoal });
        
        // Try to get training frequency from onboarding data (if column exists)
        let trainingFrequency = 3; // default
        try {
          console.log('📡 Fetching training frequency from onboarding_status...');
          const { data: onboardingData, error: onboardingError } = await supabase
            .from('onboarding_status')
            .select('*')
            .eq('user_id', user?.id)
            .single();
          
          console.log('📡 Onboarding data result:', { onboardingData, onboardingError });
          
          // Check if training_frequency column exists and has data
          if (onboardingData && !onboardingError && onboardingData.training_frequency) {
            trainingFrequency = onboardingData.training_frequency;
            console.log('🎯 Found training frequency from onboarding:', trainingFrequency);
          } else {
            console.log('ℹ️ No training_frequency column or data found, using default 3');
          }
        } catch (e) {
          console.log('ℹ️ Onboarding query failed (column may not exist), using default 3:', e.message);
        }
        
        const basicProfile = {
          user_id: (user?.email || user?.id) as string,
          training_goal: trainingGoal as 'spiermassa' | 'kracht_uithouding' | 'power_kracht',
          training_frequency: trainingFrequency as 1 | 2 | 3 | 4 | 5 | 6,
          equipment_type: 'gym' as 'gym' | 'home' | 'outdoor'
        };
        
        setUserTrainingProfile(basicProfile);
        console.log('🔧 Created basic training profile from main_goal:', basicProfile);
        
        // Update calculator data
        setCalculatorData({
          training_goal: trainingGoal,
          training_frequency: trainingFrequency.toString(),
          equipment_type: 'gym'
        });
      } else {
        console.log('❌ No main_goal found or error:', { profileData, profileError });
        setUserTrainingProfile(null);
      }
    } catch (error) {
      console.error('❌ Error creating basic profile:', error);
      setUserTrainingProfile(null);
    }
  };

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const response = await fetch(`/api/auth/login-data?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data.profile;
      } else {
        console.error('❌ Error loading user profile:', data.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      return null;
    }
  }, [user?.id]);

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
          console.log('ℹ️ No training profile found');
          // Don't create automatic profile during onboarding - let user fill form manually
          if (showOnboardingStep3) {
            console.log('🎯 Onboarding step 3 active - not creating automatic profile');
            setUserTrainingProfile(null);
          } else {
            console.log('🔧 Creating basic profile for non-onboarding user');
          await createBasicProfile();
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
        
        // Re-apply filtering with new profile
        if (allTrainingSchemas.length > 0) {
          const filtered = filterSchemasByProfile(allTrainingSchemas, data.profile);
          setTrainingSchemas(filtered);
          console.log('🎯 Re-applied filtering after profile save:', filtered.length, 'schemas');
        }

        // Defer scroll until the available section is mounted
        setScrollToAvailablePending(true);
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

    // Check if profile has changed
    const hasChanged = 
      userTrainingProfile?.training_goal !== training_goal ||
      userTrainingProfile?.training_frequency !== parseInt(training_frequency) ||
      userTrainingProfile?.equipment_type !== equipment_type;
    
    if (!hasChanged) {
      toast.success('Je profiel is al up-to-date');
      setShowCalculator(false);
      return;
    }

    // Check if user has an active schema period (within 8 weeks)
    // Only show warning if there's a valid active schema period
    if (currentSchemaPeriod && 
        currentSchemaPeriod.status === 'active' &&
        currentSchemaPeriod.start_date && 
        currentSchemaPeriod.end_date && 
        currentSchemaPeriod.training_schemas?.name &&
        hasChanged) {
      setShowWarningModal(true);
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

  const confirmProfileChange = () => {
    const { training_goal, training_frequency, equipment_type } = calculatorData;
    
    const profile = {
      training_goal,
      training_frequency: parseInt(training_frequency),
      equipment_type
    };

    console.log('💾 Confirming profile change despite warning:', profile);
    saveTrainingProfile(profile);
    setShowWarningModal(false);
  };

  const confirmSchemaChange = async () => {
    if (!schemaToChange) return;
    
    console.log('🔄 Confirming schema change despite warning:', schemaToChange);
    setShowSchemaWarningModal(false);
    
    // Proceed with schema selection
    await selectTrainingSchemaDirect(schemaToChange);
    setSchemaToChange(null);
  };

  // Handle profile edit with active schema warning
  const handleProfileEditWithWarning = async () => {
    try {
      console.log('🔄 User confirmed profile edit, deactivating current schema...');
      console.log('🔍 Current schema period:', currentSchemaPeriod);
      console.log('🔍 User ID:', user?.id);
      
      // Deactivate current schema period
      if (currentSchemaPeriod && user?.id) {
        console.log('📡 Making API call to deactivate schema...');
        const response = await fetch('/api/training-schema-period', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            trainingSchemaId: currentSchemaPeriod.training_schema_id,
            action: 'deactivate'
          })
        });

        console.log('📡 API response status:', response.status);
        const responseData = await response.json();
        console.log('📡 API response data:', responseData);

        if (response.ok) {
          console.log('✅ Current schema period deactivated');
          setCurrentSchemaPeriod(null);
          toast.success('Huidige schema is gedeactiveerd');
        } else {
          console.error('❌ Failed to deactivate schema period:', responseData);
          toast.error('Er is een fout opgetreden bij het deactiveren van het schema');
          return;
        }
      } else {
        console.log('⚠️ No current schema period or user ID available');
      }

      // Close the warning modal and show calculator
      setShowSchemaChangeWarningModal(false);
      
      // Show calculator with current profile data
      setShowCalculator(true);
      setCalculatorData({
        training_goal: userTrainingProfile?.training_goal || '',
        training_frequency: userTrainingProfile?.training_frequency?.toString() || '',
        equipment_type: userTrainingProfile?.equipment_type || 'gym'
      });
      
    } catch (error) {
      console.error('❌ Error handling profile edit confirmation:', error);
      toast.error('Er is een fout opgetreden');
    }
  };

  const selectTrainingSchema = useCallback(async (schemaId: string) => {
    try {
      console.log('🎯 selectTrainingSchema called with:', { schemaId, userId: user?.id, userEmail: user?.email });
      if (!user?.id) {
        console.log('❌ No user ID available');
        return;
      }

      // Check if user has an active schema and is trying to change it
      if (currentSchemaPeriod && 
          currentSchemaPeriod.status === 'active' && 
          currentSchemaPeriod.training_schema_id !== schemaId) {
        console.log('⚠️ User trying to change active schema, showing warning');
        setSchemaToChange(schemaId);
        setShowSchemaWarningModal(true);
        return;
      }

      // If no active schema or same schema, proceed directly
      await selectTrainingSchemaDirect(schemaId);
    } catch (error) {
      console.error('❌ Error in selectTrainingSchema:', error);
      toast.error('Er is een fout opgetreden bij het selecteren van het schema');
    }
  }, [user?.id, user?.email, currentSchemaPeriod]);

  const selectTrainingSchemaDirect = useCallback(async (schemaId: string) => {
    try {
      console.log('🎯 selectTrainingSchemaDirect called with:', { schemaId, userId: user?.id, userEmail: user?.email });
      if (!user?.id) {
        console.log('❌ No user ID available');
        return;
      }
      
      // Clear localStorage training data when switching schemas
      if (currentSchemaPeriod && currentSchemaPeriod.training_schema_id !== schemaId) {
        console.log('🔄 Switching schemas, clearing localStorage training data...');
        try {
          // Clear all training-related localStorage items
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('completedWeeks_') || key.includes('training_') || key.includes('workout_'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          console.log('✅ localStorage training data cleared');
        } catch (error) {
          console.log('⚠️ Warning: Could not clear localStorage:', error);
        }
      }
      
      // Set selected schema immediately for instant UI feedback
      setSelectedTrainingSchema(schemaId);
      
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
      
      // Create schema period with start date (8 weeks)
      const startDate = new Date().toISOString().split('T')[0]; // Today's date
      const response = await fetch('/api/training-schema-period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: actualUserId,
          schemaId: schemaId,
          startDate: startDate
        }),
      });

      const data = await response.json();
      console.log('📡 Schema selection API response:', { status: response.status, data });
      
      if (response.ok && data.success) {
        // Transform the API response to match the expected format
        const transformedData = {
          id: data.data.selected_schema_id,
          user_id: user.id,
          training_schema_id: data.data.selected_schema_id,
          start_date: data.data.schema_start_date,
          end_date: data.data.schema_end_date,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          training_schemas: data.data.training_schema
        };
        
        setCurrentSchemaPeriod(transformedData);
        console.log('✅ Schema period created:', transformedData);
        
        const startDate = new Date(data.data.schema_start_date).toLocaleDateString('nl-NL');
        const endDate = new Date(data.data.schema_end_date).toLocaleDateString('nl-NL');
        toast.success(`Trainingsschema geselecteerd! 8-weken periode gestart: ${startDate} - ${endDate}`);

        // Only redirect to Mijn trainingen if NOT in onboarding
        if (isCompleted && !showOnboardingStep3) {
          console.log('🔄 Redirecting to Mijn trainingen...');
          // Direct redirect without delay
          router.push('/dashboard/mijn-trainingen');
        } else {
          // Small delay to ensure the continue button is rendered before scrolling
          setTimeout(() => {
            const nextStepButton = document.querySelector('[data-next-step-button]') as HTMLElement | null;
            if (nextStepButton) {
              console.log('🎯 Auto-scrolling to next step button...');
              nextStepButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              // Fallback to container ref
              continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      } else {
        toast.error(data.error || 'Failed to select training schema');
      }
    } catch (error) {
      console.error('Error selecting training schema:', error);
      toast.error('Failed to select training schema');
    }
  }, [user?.id, isCompleted, onboardingStep, showOnboardingStep3]); // Removed completeStep from dependencies

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

  const handlePrintSchema = async (schemaId: string) => {
    try {
      // Fetch detailed schema data for printing
      const response = await fetch(`/api/training-schema-detail/${schemaId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schema details');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.schema) {
        throw new Error('Schema not found');
      }
      
      const schema = data.schema;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) return;

      const currentDate = new Date().toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${schema.name} - Top Tier Men</title>
            <style>
              @page {
                margin: 20mm;
                size: A4;
              }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #8BAE5A;
                padding-bottom: 20px;
              }
              .logo {
                font-size: 32px;
                font-weight: bold;
                color: #8BAE5A;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 2px;
              }
              .schema-title {
                font-size: 28px;
                font-weight: bold;
                color: #333;
                margin: 15px 0 10px 0;
              }
              .schema-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .info-item {
                text-align: center;
              }
              .info-label {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 16px;
                font-weight: bold;
                color: #333;
              }
              .day-section {
                margin: 30px 0;
                page-break-inside: avoid;
              }
              .day-header {
                background-color: #8BAE5A;
                color: white;
                padding: 15px;
                border-radius: 8px 8px 0 0;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 0;
              }
              .exercises-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                border-radius: 0 0 8px 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .exercises-table th {
                background-color: #3A4D23;
                color: white;
                padding: 12px 8px;
                text-align: center;
                font-weight: bold;
                font-size: 14px;
              }
              .exercises-table td {
                padding: 12px 8px;
                text-align: center;
                border-bottom: 1px solid #e9ecef;
                font-size: 14px;
              }
              .exercises-table tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              .exercise-name {
                text-align: left !important;
                font-weight: bold;
                color: #333;
              }
              .notes {
                text-align: left !important;
                font-style: italic;
                color: #666;
                font-size: 12px;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #e9ecef;
                padding-top: 20px;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Top Tier Men</div>
              <div class="schema-title">${schema.name}</div>
              <div style="font-size: 14px; color: #666;">Gegenereerd op ${currentDate}</div>
            </div>

            <div class="schema-info">
              <div class="info-item">
                <div class="info-label">Doel</div>
                <div class="info-value">${schema.training_goal}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Duur</div>
                <div class="info-value">${schema.estimated_duration}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Dagen</div>
                <div class="info-value">${schema.training_schema_days?.length || 0} dagen</div>
              </div>
              <div class="info-item">
                <div class="info-label">Rep Range</div>
                <div class="info-value">${schema.rep_range}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Locatie</div>
                <div class="info-value">${schema.equipment_type}</div>
              </div>
            </div>

            ${schema.description ? `
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">Beschrijving</h3>
                <p style="margin: 0; color: #666; line-height: 1.6;">${schema.description}</p>
              </div>
            ` : ''}

            ${schema.training_schema_days && schema.training_schema_days.length > 0 ? 
              schema.training_schema_days
                .sort((a, b) => a.day_number - b.day_number)
                .map(day => `
                  <div class="day-section">
                    <h2 class="day-header">Dag ${day.day_number} - ${day.name}</h2>
                    <table class="exercises-table">
                      <thead>
                        <tr>
                          <th style="width: 40%;">Oefening</th>
                          <th style="width: 15%;">Sets</th>
                          <th style="width: 15%;">Reps</th>
                          <th style="width: 15%;">Rust</th>
                          <th style="width: 15%;">Gewicht</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${day.training_schema_exercises && day.training_schema_exercises.length > 0 ? 
                          day.training_schema_exercises.map(exercise => `
                            <tr>
                              <td class="exercise-name">
                                ${exercise.exercise_name}
                                ${exercise.notes ? `<br><span class="notes">${exercise.notes}</span>` : ''}
                              </td>
                              <td>${exercise.sets}</td>
                              <td>${exercise.reps}</td>
                              <td>${exercise.rest_time_seconds ? (exercise.rest_time_seconds < 60 ? `${exercise.rest_time_seconds}s` : `${Math.floor(exercise.rest_time_seconds / 60)}m ${exercise.rest_time_seconds % 60}s`) : '90s'}</td>
                              <td>___ kg</td>
                            </tr>
                          `).join('') : 
                          '<tr><td colspan="5" style="text-align: center; color: #666; font-style: italic;">Geen oefeningen beschikbaar</td></tr>'
                        }
                      </tbody>
                    </table>
                  </div>
                `).join('') : 
              '<div style="text-align: center; color: #666; font-style: italic; margin: 40px 0;">Geen trainingsdagen beschikbaar</div>'
            }

            <div class="footer">
              <p>Top Tier Men - Trainingsschema</p>
              <p>Gegenereerd op ${currentDate}</p>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (error) {
      console.error('Error printing schema:', error);
      toast.error('Er is een fout opgetreden bij het printen van het schema');
    }
  };

  // Effects - OPTIMIZED: Use parallel loading with enhanced debugging
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    console.log('🔄 useEffect triggered:', {
      hasUser: !!user?.id,
      userEmail: user?.email,
      authLoading,
      subscriptionLoading,
      shouldLoad: user?.id && !authLoading && !subscriptionLoading
    });
    
    if (user?.id && !authLoading && !subscriptionLoading) {
      console.log('🚀 User authenticated, starting parallel data loading for:', user.email);
      loadAllData();
    } else {
      console.log('⏳ Waiting for authentication to complete...', {
        waitingFor: {
          user: !user?.id ? 'user' : null,
          auth: authLoading ? 'auth' : null,
          subscription: subscriptionLoading ? 'subscription' : null
        }
      });
    }
  }, [user?.id, authLoading, subscriptionLoading]);

  // CRITICAL: Emergency reset when user returns from external tab
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // This fires when user returns from back/forward or external tab
      if (event.persisted || performance.navigation?.type === 2) {
        console.log('🚨 EMERGENCY: Page show event detected - user returned from external source');
        if (trainingLoading) {
          console.log('🔄 EMERGENCY: Force resetting stuck loading state');
          setTrainingLoading(false);
        }
        // Also refresh current schema period data
        if (user?.id) {
          console.log('🔄 EMERGENCY: Refreshing current schema period data');
          fetchCurrentSchemaPeriod();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        console.log('🔄 Page became visible, refreshing current schema period');
        fetchCurrentSchemaPeriod();
      }
    };

    const handleFocus = () => {
      if (user?.id) {
        console.log('🔄 Window focused, refreshing current schema period');
        fetchCurrentSchemaPeriod();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [trainingLoading, user?.id]);

  // Periodic refresh of current schema period data
  useEffect(() => {
    if (!user?.id) return;

    // Refresh every 30 seconds when page is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        console.log('🔄 Periodic refresh of current schema period');
        fetchCurrentSchemaPeriod();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  // CRITICAL: Safety mechanism to prevent stuck loading states
  useEffect(() => {
    if (trainingLoading || profileLoading) {
      // Shorter timeout for quicker recovery
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Loading timeout reached (8s), forcing reset');
        if (trainingSchemas.length > 0) {
          console.log('🔄 FORCE: We have training schemas data, resetting loading state');
          setTrainingLoading(false);
        } else {
          console.log('🔄 FORCE: No training schemas data, retrying with fallback');
          // Fallback to sequential loading if parallel loading failed
          fetchTrainingSchemas();
          fetchUserTrainingProfile();
        }
        
        if (userTrainingProfile) {
          console.log('🔄 FORCE: We have training profile data, resetting loading state');
          setProfileLoading(false);
        }
      }, 8000); // 8 second timeout

      return () => clearTimeout(timeoutId);
    }
  }, [trainingLoading, profileLoading, trainingSchemas.length, userTrainingProfile]);

  // showAllSchemas functionality removed - no longer needed

  useEffect(() => {
    console.log('🔄 UserTrainingProfile changed:', userTrainingProfile);
    // Only re-filter if we have both profile and all schemas data
    if (userTrainingProfile && allTrainingSchemas.length > 0) {
      const filtered = filterSchemasByProfile(allTrainingSchemas, userTrainingProfile);
      setTrainingSchemas(filtered);
      console.log('🎯 Re-applied filtering after profile change:', filtered.length, 'schemas');
    }
  }, [userTrainingProfile, allTrainingSchemas]);

  // Handle schema selection from URL parameter
  useEffect(() => {
    const selectParam = searchParams?.get('select');
    if (selectParam && trainingSchemas.length > 0) {
      const schema = trainingSchemas.find(s => s.id === selectParam);
      if (schema) {
        console.log('🎯 Auto-selecting schema from URL parameter:', selectParam);
        // Call selectTrainingSchema directly to avoid stale closure issues
        selectTrainingSchema(selectParam);
        // Remove the select parameter from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('select');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, trainingSchemas]); // Removed selectTrainingSchema from dependencies

  // Check onboarding status
  useEffect(() => {
    if (!user?.id) return;

    async function checkOnboardingStatus() {
      try {
        const response = await fetch(`/api/onboarding-v2?email=${user?.email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform Onboarding V2 API response to match expected format
            const transformedData = {
              onboarding_completed: data.onboarding.isCompleted,
              current_step: data.onboarding.currentStep,
              user_id: user?.id,
              ...data.onboarding.status // Include the full status object if available
            };
            setOnboardingStatus(transformedData);
            
            // Show onboarding step 3 if onboarding is not completed and user needs to select training schema
            // This includes users on step 3 OR users who haven't selected training schema yet
            const shouldShowStep3 = !data.onboarding.isCompleted && 
              (data.onboarding.currentStep === 3 || (!data.onboarding.status?.training_schema_selected && data.onboarding.currentStep >= 2));
            setShowOnboardingStep3(shouldShowStep3);
            
            // Check if user just completed onboarding and has a selected schema
            if (data.onboarding.isCompleted && data.onboarding.status?.training_schema_selected && data.onboarding.status?.selected_training_schema_id) {
              console.log('🎯 User completed onboarding with selected schema, checking for post-onboarding modal...');
              // Check if this is the first visit after onboarding completion
              const hasSeenPostOnboardingModal = localStorage.getItem('hasSeenPostOnboardingModal');
              if (!hasSeenPostOnboardingModal) {
                console.log('🎯 First visit after onboarding completion, showing modal...');
                // Find the selected schema in the loaded schemas
                const selectedSchema = trainingSchemas.find(schema => schema.id === data.onboarding.status.selected_training_schema_id);
                if (selectedSchema) {
                  setSelectedSchemaForModal(selectedSchema);
                  setShowPostOnboardingModal(true);
                  localStorage.setItem('hasSeenPostOnboardingModal', 'true');
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    }

    checkOnboardingStatus();
  }, [user?.id]);

  // Re-fetch training profile when onboarding step 3 status changes
  useEffect(() => {
    if (user?.id && !profileLoading) {
      console.log('🔄 Onboarding step 3 status changed, re-fetching training profile...');
      fetchUserTrainingProfile();
    }
  }, [showOnboardingStep3]);

  // Fetch current schema period when user is available
  useEffect(() => {
    if (user?.id && !authLoading) {
      console.log('🔄 Fetching current schema period for user:', user.id);
      fetchCurrentSchemaPeriod();
    }
  }, [user?.id, authLoading]);

  // Also fetch when returning to this page (on focus/visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id && !authLoading) {
        console.log('🔄 Page became visible, refreshing schema period data...');
        fetchCurrentSchemaPeriod();
      }
    };

    const handleFocus = () => {
      if (user?.id && !authLoading) {
        console.log('🔄 Page focused, refreshing schema period data...');
        fetchCurrentSchemaPeriod();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, authLoading]);

  // Refresh schema period data when component mounts (useful when navigating back)
  useEffect(() => {
    if (user?.id && !authLoading && !schemaPeriodLoading) {
      console.log('🔄 Component mounted/remounted, refreshing schema period data...');
      fetchCurrentSchemaPeriod();
    }
  }, [user?.id, authLoading]);

  // Set selectedTrainingSchema when currentSchemaPeriod is loaded or from profile
  useEffect(() => {
    if (currentSchemaPeriod && currentSchemaPeriod.training_schema_id) {
      console.log('🔄 Setting selectedTrainingSchema from currentSchemaPeriod:', currentSchemaPeriod.training_schema_id);
      setSelectedTrainingSchema(currentSchemaPeriod.training_schema_id);
    } else if (user && user.id) {
      // If no currentSchemaPeriod but user has selected_schema_id in profile, use that
      fetchUserProfile().then((profile) => {
        if (profile && profile.selected_schema_id) {
          console.log('🔄 Setting selectedTrainingSchema from profile:', profile.selected_schema_id);
          setSelectedTrainingSchema(profile.selected_schema_id);
        }
      });
    }
  }, [currentSchemaPeriod, user, fetchUserProfile]);

  // Progressieve loading states
  if (authLoading) {
    return (
      <PageLayout title="Trainingsschemas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Authenticatie controleren...</h3>
            <p className="text-gray-300">Even geduld, we controleren je inloggegevens</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <PageLayout title="Trainingsschemas">
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

  // Check subscription loading
  if (subscriptionLoading) {
    return (
      <PageLayout title="Trainingsschemas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Toegang controleren...</h3>
            <p className="text-gray-300 mb-6">We controleren je abonnement</p>
            
            {/* Hard Refresh Button */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Pagina laadt niet?</h4>
              <p className="text-gray-300 text-sm mb-4">
                Klik op onderstaande button als de pagina niet laadt, en dat hij daarna sowieso laadt
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('🔄 Schema period refresh button clicked');
                    fetchCurrentSchemaPeriod();
                  }}
                  className="w-full bg-[#8BAE5A] text-[#232D1A] font-semibold px-4 py-2 rounded-lg hover:bg-[#7A9D4A] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Schema Data Verversen
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 Hard refresh button clicked - forcing page reload');
                    window.location.reload();
                  }}
                  className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] font-bold px-6 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200 flex items-center justify-center gap-2"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Harde Refresh
              </button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Check access permissions for training schemas
  if (!hasAccess('training')) {
    return (
      <PageLayout title="Trainingsschemas">
        <div className="w-full p-6">
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
                  onClick={() => {
                    alert('Mocht je deze onderdelen willen neem dan contact op met Rick voor het upgraden van je pakket');
                  }}
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] font-bold px-6 md:px-8 py-3 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200 text-sm md:text-base"
                >
                  Upgrade naar Premium
                </button>
                <button
                  onClick={() => {
                    alert('Mocht je deze onderdelen willen neem dan contact op met Rick voor het upgraden van je pakket');
                  }}
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
    <PageLayout title="Trainingsschemas">
      {/* Show onboarding UI only if onboarding is not completed */}
      {!isCompleted && <OnboardingV2Progress />}
      {!isCompleted && <OnboardingNotice />}
      
      {/* Continue to Voedingsplannen Button - Only show during onboarding and when schema is selected */}
      {userTrainingProfile && trainingSchemas.length > 0 && !isCompleted && selectedTrainingSchema && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 sm:mx-4 md:mx-6 mb-4 sm:mb-6"
          ref={continueRef}
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
              data-next-step-button
              onClick={async () => {
                try {
                  await completeStep(3); // Database step 3 = SELECT_TRAINING for UI step 4
                  console.log('✅ Training schema step completed, redirecting to nutrition plans...');
                  // Use router.push instead of window.location.href for better navigation
                  router.push('/dashboard/voedingsplannen-v2');
                } catch (error) {
                  console.error('❌ Error completing training step:', error);
                  toast.error('Er is een fout opgetreden bij het voltooien van de stap');
                }
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
      
      <div className="w-full p-3 sm:p-4 md:p-6">
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
                <p className="text-sm sm:text-base text-gray-300">
                  Kies en beheer je trainingsschemas voor optimale resultaten
                </p>
              </div>


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
                    // Check if user has an active schema period
                    if (currentSchemaPeriod) {
                      // Show warning modal instead of calculator
                      setShowSchemaChangeWarningModal(true);
                    } else {
                      // No active schema, proceed normally
                      setShowCalculator(true);
                      // Pre-fill calculator with current profile data
                      setCalculatorData({
                        training_goal: userTrainingProfile.training_goal,
                        training_frequency: userTrainingProfile.training_frequency.toString(),
                        equipment_type: userTrainingProfile.equipment_type
                      });
                      // Give the UI a tick to render and then scroll to the calculator
                      setTimeout(() => {
                        try {
                          calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } catch {}
                      }, 100);
                    }
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
                      <h4 className="text-xs sm:text-sm font-medium text-gray-400">Locatie</h4>
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

        {/* Current Schema Period */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                  <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Huidige Schema Periode</h3>
                  <p className="text-xs sm:text-sm text-gray-400">8-weken trainingsperiode</p>
                </div>
              </div>
              
            {currentSchemaPeriod ? (
              <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#8BAE5A]">📅</span>
                    <span className="text-sm font-medium text-gray-300">Startdatum</span>
                  </div>
                  <p className="text-white font-semibold">
                    {new Date(currentSchemaPeriod.start_date).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                
                <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#8BAE5A]">🏁</span>
                    <span className="text-sm font-medium text-gray-300">Einddatum</span>
                  </div>
                  <p className="text-white font-semibold">
                    {new Date(currentSchemaPeriod.end_date).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                
                <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#8BAE5A]">📊</span>
                    <span className="text-sm font-medium text-gray-300">Schema</span>
                  </div>
                  <p className="text-white font-semibold">
                    {currentSchemaPeriod.training_schemas?.name || 'Onbekend'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-lg">
                <div className="flex items-center gap-2 text-[#8BAE5A] text-sm">
                  <span>ℹ️</span>
                  <span>Je volgt dit schema voor 8 weken. Na voltooiing kun je een nieuw schema selecteren.</span>
                </div>
              </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#8BAE5A]">📅</span>
                      <span className="text-sm font-medium text-gray-300">Startdatum</span>
            </div>
                    <p className="text-gray-400 font-semibold">
                      Kies eerst schema
                    </p>
                  </div>
                  
                  <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#8BAE5A]">🏁</span>
                      <span className="text-sm font-medium text-gray-300">Einddatum</span>
                    </div>
                    <p className="text-gray-400 font-semibold">
                      Kies eerst schema
                    </p>
                  </div>
                  
                  <div className="bg-[#232D1A]/50 border border-[#3A4D23] rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#8BAE5A]">📊</span>
                      <span className="text-sm font-medium text-gray-300">Schema</span>
                    </div>
                    <p className="text-gray-400 font-semibold">
                      Kies eerst schema
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#FFD700] text-sm">
                    <span>💡</span>
                    <span>Selecteer een trainingsschema hieronder om je 8-weken trainingsperiode te starten.</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Training Profile Calculator */}
        <AnimatePresence>
          {(showRequiredProfile || showCalculator) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
              ref={calculatorRef}
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
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>


                  {/* Training Location - Only Gym Available */}
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

        {/* Loading State - OPTIMIZED */}
        {(profileLoading || trainingLoading) && (
          <div className="text-center py-12 mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {authLoading ? 'Authenticatie controleren...' : 
               subscriptionLoading ? 'Pakket controleren...' :
               profileLoading ? 'Trainingsprofiel laden...' :
               trainingLoading ? 'Trainingsschemas laden...' : 'Laden...'}
            </h3>
            <p className="text-gray-300 mb-6">
              {authLoading ? 'Even geduld, we controleren je inloggegevens' :
               subscriptionLoading ? 'We controleren je pakket toegang' :
               profileLoading ? 'Je trainingsprofiel wordt geladen' :
               trainingLoading ? 'Trainingsschemas worden geladen' : 'Even geduld...'}
            </p>
            
            {/* Hard Refresh Button for Loading States */}
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Pagina laadt niet?</h4>
              <p className="text-gray-300 text-sm mb-4">
                Klik op onderstaande button als de pagina niet laadt, en dat hij daarna sowieso laadt
              </p>
              <button
                onClick={() => {
                  console.log('🔄 Hard refresh button clicked during loading - forcing page reload');
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] font-bold px-4 py-2 rounded-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Harde Refresh
              </button>
            </div>
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
            ref={availableSchemasRef}
          >
            <div className="bg-gradient-to-r from-[#8BAE5A]/10 to-[#8BAE5A]/5 border border-[#8BAE5A]/30 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 bg-[#8BAE5A]/20 rounded-lg">
                    <AcademicCapIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8BAE5A]" />
                  </div>
                  <div className={`${highlightAvailable ? 'ring-2 ring-[#8BAE5A] ring-offset-2 ring-offset-[#0F1419] rounded-lg transition' : ''}`}>
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white break-words">Beschikbare Trainingsschemas</h2>
                    <p className="text-xs sm:text-sm text-gray-400 break-words">Beschikbaar op basis van jouw profiel</p>
                    <div className="mt-2 p-2 sm:p-3 bg-[#8BAE5A]/10 border border-[#8BAE5A]/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-[#8BAE5A] leading-relaxed break-words">
                        <span className="font-semibold">📅 8-weken systeem:</span> Trainingsschemas gaan per 8 weken. Schema 2 wordt beschikbaar na voltooiing van schema 1. <span className="font-semibold">Consistentie zorgt voor resultaat</span> - volg een schema minimaal 8 weken.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Schema count and view toggle removed - user only sees filtered schemas */}
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
                {trainingSchemas.map((schema) => {
                  const isSchema1 = schema.schema_nummer === 1;
                  const isSchema2 = schema.schema_nummer === 2;
                  const isSchema3 = schema.schema_nummer === 3;
                  
                  // Progressive unlocking: Schema 1 is always unlocked, Schema 2 unlocks after 8 weeks of Schema 1, Schema 3 unlocks after 8 weeks of Schema 2
                  // Schema 1 is always unlocked, even if it's a placeholder
                  const isPlaceholder = schema.status === 'coming_soon';
                  const isLocked = schema.schema_nummer === 1 ? false : (isPlaceholder || !unlockedSchemas[schema.schema_nummer || 1]);
                  
                  // Check if schema is completed
                  const isCompleted = schemaCompletionStatus[schema.id] || false;
                  
                  return (
                    <motion.div
                      key={schema.id}
                      whileHover={isLocked ? {} : { scale: 1.02, y: -5 }}
                      className={`p-3 sm:p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                        isLocked
                          ? 'border-gray-600 bg-[#1A1A1A]/30 opacity-50 cursor-not-allowed'
                          : selectedTrainingSchema === schema.id
                          ? 'border-[#8BAE5A] bg-[#8BAE5A]/10 shadow-[#8BAE5A]/20'
                          : 'border-gray-700 bg-[#1A1A1A]/50 hover:border-[#8BAE5A]/50 hover:shadow-[#8BAE5A]/10'
                      }`}
                    >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`p-2 sm:p-3 rounded-xl ${isLocked ? 'bg-gray-600/20' : 'bg-[#8BAE5A]/20'}`}>
                          <AcademicCapIcon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${isLocked ? 'text-gray-500' : 'text-[#8BAE5A]'}`} />
                        </div>
                        <div>
                          <h3 className={`text-sm sm:text-base md:text-lg font-semibold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                            {schema.name}
                            {isCompleted && (
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                ✅ Voltooid
                              </span>
                            )}
                            {schema.schema_nummer && (
                              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                isCompleted
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : isSchema1 
                                  ? 'bg-[#8BAE5A]/20 text-[#8BAE5A] border-[#8BAE5A]/30'
                                  : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                              }`}>
                                Schema {schema.schema_nummer}
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                      {!isLocked && selectedTrainingSchema === schema.id && (
                        <div className="p-1.5 sm:p-2 bg-[#8BAE5A] rounded-full">
                          <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#232D1A]" />
                        </div>
                      )}
                      {isLocked && (
                        <div className="p-1.5 sm:p-2 bg-gray-600 rounded-full">
                          <span className="text-gray-400 text-xs">🔒</span>
                        </div>
                      )}
                    </div>

                    <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 ${isLocked ? 'text-gray-500' : 'text-gray-300'}`}>
                      {schema.description}
                    </p>

                    {isLocked && (
                      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                          <span className="text-yellow-500">🔒</span>
                          <span>
                            {isPlaceholder
                              ? 'Binnenkort beschikbaar'
                              : isSchema2 
                              ? 'Vergrendeld - Voltooi Schema 1 eerst'
                              : isSchema3 
                              ? 'Vergrendeld - Voltooi Schema 2 eerst'
                              : 'Vergrendeld - Voltooi vorig schema eerst'
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0 ${isLocked ? 'text-gray-500' : 'text-gray-400'}`}>
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        <div className="flex items-center space-x-1">
                          <FireIcon className={`h-3 w-3 sm:h-4 sm:w-4 ${isLocked ? 'text-gray-500' : 'text-[#8BAE5A]'}`} />
                          <span className="text-xs sm:text-sm">{schema.rep_range}</span>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                        isLocked ? 'bg-gray-700 text-gray-500' : 'bg-[#3A4D23]'
                      }`}>
                        {schema.category}
                      </span>
                    </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            console.log('🔘 Select button clicked:', { schemaId: schema.id, isLocked, schemaName: schema.name });
                            if (!isLocked && selectedTrainingSchema !== schema.id) {
                              selectTrainingSchema(schema.id);
                            }
                          }}
                          disabled={isLocked}
                          className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
                            isLocked
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : selectedTrainingSchema === schema.id
                              ? 'bg-[#8BAE5A] text-[#232D1A] shadow-lg shadow-[#8BAE5A]/20'
                              : 'bg-[#3A4D23] text-white hover:bg-[#4A5D33]'
                          }`}
                        >
                          {isPlaceholder ? 'Binnenkort' : isLocked ? 'Vergrendeld' : selectedTrainingSchema === schema.id ? 'Actief' : 'Selecteer Schema'}
                        </button>
                        <button
                          onClick={() => !isLocked && handlePrintSchema(schema.id)}
                          disabled={isLocked}
                          className={`py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-colors text-xs sm:text-sm flex items-center justify-center ${
                            isLocked
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-[#1E3A8A] text-white hover:bg-[#1E40AF]'
                          }`}
                          title={isPlaceholder ? 'Binnenkort beschikbaar' : isLocked ? 'Vergrendeld' : 'Print schema'}
                        >
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            )}
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

      {/* Warning Modal for Profile Changes */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1A] border border-gray-700 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Let op!</h3>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Het is niet aanbevolen tussentijds van schema te wijzigen. Wij adviseren minimaal 8 weken een schema te volgen, consistentie is de sleutel van succes.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmProfileChange}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Ja, toch wijzigen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Modal for Schema Changes */}
      <AnimatePresence>
        {showSchemaWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1A1A1A] border border-gray-700 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Schema Wijzigen</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-300 leading-relaxed">
                  Je hebt momenteel een actief trainingsschema. Door van schema te wijzigen:
                </p>
                
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Je huidige schema komt te vervallen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Je begint opnieuw vanaf week 1</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Je voortgang wordt gereset</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Nieuwe start- en einddatum worden ingesteld</span>
                  </li>
                </ul>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    <strong>Advies:</strong> Wij raden aan om minimaal 8 weken een schema te volgen voor optimale resultaten.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSchemaWarningModal(false);
                    setSchemaToChange(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmSchemaChange}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Ja, schema wijzigen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Loading Overlay */}
      <OnboardingLoadingOverlay 
        show={showLoadingOverlay} 
        text={loadingText} 
        progress={loadingProgress} 
      />
      
      {/* Post-Onboarding Schema Modal */}
      <PostOnboardingSchemaModal
        isOpen={showPostOnboardingModal}
        onClose={() => setShowPostOnboardingModal(false)}
        selectedSchema={selectedSchemaForModal as any}
      />

      {/* Schema Change Warning Modal */}
      <SchemaChangeWarningModal
        isOpen={showSchemaChangeWarningModal}
        onClose={() => setShowSchemaChangeWarningModal(false)}
        onConfirm={handleProfileEditWithWarning}
        currentSchemaName={currentSchemaPeriod?.training_schemas?.name || 'Huidige Schema'}
      />
    </PageLayout>
  );
}

export default function TrainingschemasPage() {
  return (
    <Suspense fallback={
      <PageLayout title="Trainingsschemas">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BAE5A]"></div>
        </div>
      </PageLayout>
    }>
      <TrainingschemasContent />
    </Suspense>
  );
}