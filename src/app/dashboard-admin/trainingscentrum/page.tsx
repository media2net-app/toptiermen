'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  PlayIcon,
  CalendarIcon,
  FireIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import SchemaBuilder from './SchemaBuilder';
import ExerciseModal from './ExerciseModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';
import { getCDNVideoUrl, getOptimizedVideoUrl } from '@/lib/cdn-config';

// Mock data - in real app this would come from API
const mockSchemas = [
  {
    id: 1,
    name: 'Full Body Krachttraining',
    category: 'Gym',
    days: 3,
    status: 'published',
    description: 'Complete full body workout voor kracht en spiermassa',
    coverImage: '/images/mind/1.png',
    createdAt: '2024-01-15',
    enrolledUsers: 1247
  },
  {
    id: 2,
    name: 'Outdoor Bootcamp',
    category: 'Outdoor',
    days: 4,
    status: 'published',
    description: 'Intensieve outdoor training met bodyweight oefeningen',
    coverImage: '/images/mind/2.png',
    createdAt: '2024-01-10',
    enrolledUsers: 892
  },
  {
    id: 3,
    name: 'Upper Body Focus',
    category: 'Gym',
    days: 2,
    status: 'draft',
    description: 'Specifiek gericht op bovenlichaam ontwikkeling',
    coverImage: '/images/mind/3.png',
    createdAt: '2024-01-20',
    enrolledUsers: 0
  }
];

const mockExercises = [
  // BORST - 5 meest populaire oefeningen
  {
    id: 1,
    name: 'Bench Press',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel'],
    equipment: 'Barbell',
    videoUrl: null,
    instructions: 'Ga liggen op de bank, pak de stang op schouderbreedte, laat zakken naar borst en duw omhoog.',
    difficulty: 'Intermediate'
  },
  {
    id: 2,
    name: 'Dumbbell Press',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel'],
    equipment: 'Dumbbell',
    videoUrl: null,
    instructions: 'Ga liggen met dumbbells op schouderhoogte, duw beide dumbbells gelijktijdig omhoog.',
    difficulty: 'Beginner'
  },
  {
    id: 3,
    name: 'Push-ups',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel', 'Core'],
    equipment: 'Bodyweight',
    videoUrl: null,
    instructions: 'Start in plank positie, laat je lichaam zakken en duw jezelf omhoog.',
    difficulty: 'Beginner'
  },
  {
    id: 4,
    name: 'Incline Bench Press',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel'],
    equipment: 'Barbell',
    videoUrl: null,
    instructions: 'Bench press op een hellende bank (30-45 graden) voor focus op bovenste borst.',
    difficulty: 'Intermediate'
  },
  {
    id: 5,
    name: 'Cable Flyes',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Voorste Deltavleugel'],
    equipment: 'Cable',
    videoUrl: null,
    instructions: 'Sta tussen de kabels, trek beide kabels naar elkaar toe in een vloeiende beweging.',
    difficulty: 'Intermediate'
  }
];

const mockChallenges = [
  {
    id: 1,
    name: '30-Dagen Push-up Challenge',
    description: 'Bouw je kracht op met dagelijkse push-ups',
    duration: 30,
    status: 'active',
    participants: 567,
    startDate: '2024-01-01'
  },
  {
    id: 2,
    name: 'Spartan Week',
    description: '7 dagen van extreme workouts',
    duration: 7,
    status: 'upcoming',
    participants: 234,
    startDate: '2024-02-01'
  }
];

// Analytics Mock Data
const mockAnalytics = {
  popularSchemas: [
    { name: 'Full Body Krachttraining', users: 1247, completionRate: 85 },
    { name: 'Outdoor Bootcamp', users: 892, completionRate: 72 },
    { name: 'Upper Body Focus', users: 567, completionRate: 68 },
    { name: 'Lower Body Power', users: 423, completionRate: 91 },
    { name: 'Core & Stability', users: 298, completionRate: 78 }
  ],
  skippedExercises: [
    { name: 'Bulgarian Split Squats', skipRate: 60, reason: 'Te complex' },
    { name: 'Turkish Get-ups', skipRate: 45, reason: 'Tijdsintensief' },
    { name: 'Handstand Push-ups', skipRate: 38, reason: 'Te moeilijk' },
    { name: 'Pistol Squats', skipRate: 32, reason: 'Balans vereist' },
    { name: 'Muscle-ups', skipRate: 28, reason: 'Gevorderd niveau' }
  ],
  schemaCompletion: [
    { name: 'Beginner Full Body', completionRate: 85, difficulty: 'Beginner' },
    { name: 'Intermediate Push/Pull', completionRate: 72, difficulty: 'Intermediate' },
    { name: 'Advanced Powerlifting', completionRate: 40, difficulty: 'Advanced' },
    { name: 'Bodyweight Mastery', completionRate: 65, difficulty: 'Intermediate' },
    { name: 'Elite Strength', completionRate: 35, difficulty: 'Advanced' }
  ]
};

// Progress Mock Data
const mockProgress = {
  globalStrength: {
    squat: { current: 120, previous: 115, change: '+4.3%' },
    bench: { current: 85, previous: 82, change: '+3.7%' },
    deadlift: { current: 150, previous: 145, change: '+3.4%' }
  },
  popularPRs: [
    { exercise: 'Bench Press', prs: 234, period: 'Deze maand' },
    { exercise: 'Squat', prs: 189, period: 'Deze maand' },
    { exercise: 'Deadlift', prs: 156, period: 'Deze maand' },
    { exercise: 'Pull-ups', prs: 123, period: 'Deze maand' },
    { exercise: 'Overhead Press', prs: 98, period: 'Deze maand' }
  ],
  workoutFeedback: [
    { 
      workout: 'Full Body Krachttraining - Dag 1',
      rating: 4.2,
      difficulty: 'Perfect',
      comments: ['Geweldige workout!', 'Goede balans', 'Uitdagend maar haalbaar'],
      date: '2024-01-20'
    },
    { 
      workout: 'Outdoor Bootcamp - HIIT',
      rating: 3.8,
      difficulty: 'Te zwaar',
      comments: ['Intensief maar effectief', 'Meer rust tussen sets', 'Goede variatie'],
      date: '2024-01-19'
    },
    { 
      workout: 'Upper Body Focus - Push',
      rating: 4.5,
      difficulty: 'Perfect',
      comments: ['Fantastische oefeningen', 'Goede progressie', 'Voel de spieren werken'],
      date: '2024-01-18'
    }
  ]
};

const categories = ['Gym', 'Outdoor', 'Bodyweight'];
// Dynamic muscle groups will be fetched from database
const equipment = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable', 'Kettlebell'];

// Equipment categories for filtering
const equipmentCategories = [
  { label: 'Gym', equipment: ['Barbell', 'Dumbbell', 'Dumbbells', 'Machine', 'Cable Machine', 'Cable', 'Dip Bars'] },
  { label: 'Outdoor', equipment: ['Bodyweight'] },
  { label: 'Home', equipment: ['Bodyweight', 'Dumbbell', 'Dumbbells'] },
  { label: 'Geen Equipment', equipment: ['Bodyweight', 'Geen'] }
];

const mapDbSchemaToForm = (dbSchema: any) => ({
  id: dbSchema.id,
  name: dbSchema.name,
  description: dbSchema.description,
  category: dbSchema.category,
  difficulty: dbSchema.difficulty,
  status: dbSchema.status,
  days: (dbSchema.training_schema_days || []).map((day: any) => ({
    id: day.id,
    schema_id: dbSchema.id,
    day_number: day.day_number,
    name: day.name,
    description: day.description,
    exercises: (day.training_schema_exercises || [])
      .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((ex: any) => ({
        id: ex.id,
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        rest_time: ex.rest_time,
        order_index: ex.order_index ?? 0,
      })),
  })),
});

export default function TrainingscentrumBeheer() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('schemas');
  const [selectedSchema, setSelectedSchema] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [showNewSchemaModal, setShowNewSchemaModal] = useState(false);
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const [editingSchema, setEditingSchema] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Alle Categorieën');
  const [filterMuscle, setFilterMuscle] = useState('Alle Spiergroepen');
  const [filterEquipment, setFilterEquipment] = useState('Alle Materialen');
  
  // Database state
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [schemas, setSchemas] = useState<any[]>([]);
  const [loadingSchemas, setLoadingSchemas] = useState(true);
  const [errorExercises, setErrorExercises] = useState<string | null>(null);
  const [errorSchemas, setErrorSchemas] = useState<string | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  
  // Stats state
  const [stats, setStats] = useState({
    totalSchemas: 0,
    totalExercises: 0,
    totalChallenges: 0,
    activeUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Lazy loading state
  const [visibleExercises, setVisibleExercises] = useState<Set<number>>(new Set());
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<number>>(new Set());
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());
  const [thumbnailLoadingStarted, setThumbnailLoadingStarted] = useState(false);
  const [showVideoLoadingOverlay, setShowVideoLoadingOverlay] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchExercises = useCallback(async () => {
    setLoadingExercises(true);
    setErrorExercises(null);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });
      if (error) {
        setErrorExercises('Fout bij het laden van oefeningen');
        toast.error('Fout bij het laden van oefeningen');
      } else {
        setExercises(data || []);
        // Extract unique muscle groups from exercises
        const uniqueMuscles = Array.from(new Set(
          (data || [])
            .map(exercise => exercise.primary_muscle)
            .filter(muscle => muscle && muscle.trim() !== '')
        )).sort();
        setMuscleGroups(uniqueMuscles);
      }
    } catch (err) {
      setErrorExercises('Fout bij het laden van oefeningen');
      toast.error('Fout bij het laden van oefeningen');
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  const fetchSchemas = useCallback(async (retryCount = 0) => {
    setLoadingSchemas(true);
    setErrorSchemas(null);
    
    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // Exponential backoff
    
    try {
      console.log(`🔄 Fetching training schemas (attempt ${retryCount + 1}/${maxRetries + 1})...`);
      
      const { data, error } = await supabase
        .from('training_schemas')
        .select(`*,training_schema_days (id,day_number,name,training_schema_exercises (id,exercise_id,exercise_name,sets,reps,rest_time,order_index))`)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('❌ Error fetching schemas:', error);
        
        if (retryCount < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelay}ms...`);
          setTimeout(() => fetchSchemas(retryCount + 1), retryDelay);
          return;
        }
        
        setErrorSchemas('Fout bij het laden van trainingsschema\'s');
        toast.error('Fout bij het laden van trainingsschema\'s');
      } else {
        console.log(`✅ Successfully fetched ${data?.length || 0} training schemas`);
        
        // Sort schemas by number of days (ascending)
        const sortedSchemas = (data || []).sort((a, b) => {
          const daysA = a.training_schema_days?.length || 0;
          const daysB = b.training_schema_days?.length || 0;
          return daysA - daysB;
        });
        setSchemas(sortedSchemas);
      }
    } catch (err) {
      console.error('❌ Exception fetching schemas:', err);
      
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        setTimeout(() => fetchSchemas(retryCount + 1), retryDelay);
        return;
      }
      
      setErrorSchemas('Fout bij het laden van trainingsschema\'s');
      toast.error('Fout bij het laden van trainingsschema\'s');
    } finally {
      if (retryCount === 0 || retryCount === maxRetries) {
        setLoadingSchemas(false);
      }
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      // Get total schemas
      const { count: schemasCount } = await supabase
        .from('training_schemas')
        .select('*', { count: 'exact', head: true });

      // Get total exercises
      const { count: exercisesCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

      // Get total challenges (from challenges table if it exists, otherwise 0)
      let challengesCount = 0;
      try {
        const { count } = await supabase
          .from('challenges')
          .select('*', { count: 'exact', head: true });
        challengesCount = count || 0;
      } catch {
        // Challenges table doesn't exist yet
        challengesCount = 0;
      }

      // Get active users (users who have completed a workout in the last 30 days)
      let activeUsersCount = 0;
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count } = await supabase
          .from('workout_sessions')
          .select('user_id', { count: 'exact', head: true })
          .gte('completed_at', thirtyDaysAgo.toISOString());
        
        activeUsersCount = count || 0;
      } catch {
        // Workout sessions table doesn't exist yet or no recent sessions
        activeUsersCount = 0;
      }

      setStats({
        totalSchemas: schemasCount || 0,
        totalExercises: exercisesCount || 0,
        totalChallenges: challengesCount,
        activeUsers: activeUsersCount
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load data when component mounts - parallel loading for better performance
  useEffect(() => {
    if (mounted) {
      console.log('🚀 Starting parallel data loading...');
      
      // Load all data in parallel for faster loading
      Promise.all([
        fetchExercises(),
        fetchSchemas(),
        fetchStats()
      ]).then(() => {
        console.log('✅ All data loaded successfully');
      }).catch((error) => {
        console.error('❌ Error loading data:', error);
        toast.error('Fout bij het laden van data');
      });
    }
  }, [mounted, fetchExercises, fetchSchemas, fetchStats]);

  // Lazy load thumbnails one by one - only for exercises with videos
  useEffect(() => {
    if (!mounted || exercises.length === 0) return;

    // Only show video loading overlay if there are exercises with videos
    const exercisesWithVideos = exercises.filter(ex => 
      ex.video_url && 
      ex.video_url !== '/video-placeholder.jpg' && 
      ex.video_url !== 'video-placeholder.jpg'
    );

    if (exercisesWithVideos.length === 0) {
      console.log('📹 No videos to load, skipping video loading overlay');
      return;
    }

    let isCancelled = false;
    const loadThumbnailsSequentially = async () => {
      console.log(`🎬 Starting sequential thumbnail loading for ${exercisesWithVideos.length} videos...`);
      setThumbnailLoadingStarted(true);
      setShowVideoLoadingOverlay(true); // Show overlay when starting to load videos
      
      for (let i = 0; i < exercisesWithVideos.length; i++) {
        if (isCancelled) break;
        
        const exercise = exercisesWithVideos[i];
        console.log(`📹 Loading thumbnail ${i + 1}/${exercisesWithVideos.length}: ${exercise.name}`);
        
        // Add exercise to visible set to trigger thumbnail loading
        setVisibleExercises(prev => new Set([...prev, exercise.id]));
        
        // Small delay between each thumbnail to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Hide overlay after all videos are loaded (with a small delay to ensure smooth transition)
      setTimeout(() => {
        if (!isCancelled) {
          setShowVideoLoadingOverlay(false);
          console.log('✅ Video loading overlay hidden');
        }
      }, 500);
    };

    loadThumbnailsSequentially();

    return () => {
      isCancelled = true;
    };
  }, [mounted, exercises]);

  const handleAddExercise = async (exerciseData: any) => {
    try {
      console.log('➕ ===== ADDING NEW EXERCISE =====');
      console.log('📋 Exercise Data:', exerciseData);
      
      // Clean up the data to match database expectations
      const cleanedData = {
        name: exerciseData.name,
        primary_muscle: exerciseData.primary_muscle,
        equipment: exerciseData.equipment,
        difficulty: exerciseData.difficulty || 'Intermediate',
        video_url: exerciseData.video_url || null,
        instructions: exerciseData.instructions || 'Geen instructies beschikbaar',
        worksheet_url: exerciseData.worksheet_url || null,
        secondary_muscles: Array.isArray(exerciseData.secondary_muscles) ? exerciseData.secondary_muscles : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🧹 Cleaned data for insert:', cleanedData);
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([cleanedData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error adding exercise:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Fout bij het toevoegen van oefening: ${error.message}`);
        return; // Don't close modal on error
      } else {
        console.log('✅ Exercise added successfully:', data);
        
        // Force a complete refresh of the exercises list
        console.log('🔄 Refreshing exercises list from database...');
        await fetchExercises();
        
        console.log('🔒 Closing modal...');
        setShowNewExerciseModal(false);
        setShowEditModal(false); // Ensure edit modal is also closed
        setEditingExercise(null); // Clear any editing exercise
        
        console.log('✅ Add complete!');
        toast.success('Oefening succesvol toegevoegd');
      }
    } catch (err) {
      console.error('❌ Exception adding exercise:', err);
      console.error('❌ Exception stack:', err instanceof Error ? err.stack : 'No stack');
      toast.error(`Fout bij het toevoegen van oefening: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      // Don't close modal on exception - let user try again
    }
  };

  const handleUpdateExercise = async (id: number, exerciseData: any) => {
    try {
      console.log('🔄 ===== UPDATING EXERCISE =====');
      console.log('📋 Exercise ID:', id);
      console.log('📋 Exercise Data:', exerciseData);
      console.log('📋 Current exercises state:', exercises.length, 'exercises');
      
      // Clean up the data to match database expectations
      const cleanedData = {
        name: exerciseData.name,
        primary_muscle: exerciseData.primary_muscle,
        equipment: exerciseData.equipment,
        difficulty: exerciseData.difficulty || 'Intermediate',
        video_url: exerciseData.video_url || null,
        instructions: exerciseData.instructions || 'Geen instructies beschikbaar',
        worksheet_url: exerciseData.worksheet_url || null,
        secondary_muscles: Array.isArray(exerciseData.secondary_muscles) ? exerciseData.secondary_muscles : [],
        updated_at: new Date().toISOString() // Force update timestamp
      };
      
      console.log('🧹 Cleaned data for update:', cleanedData);
      
      // Test the update step by step
      console.log('🔍 Step 1: Attempting database update...');
      const { data, error } = await supabase
        .from('exercises')
        .update(cleanedData)
        .eq('id', id)
        .select()
        .single();
      
      console.log('🔍 Step 2: Database response received');
      console.log('📊 Response data:', data);
      console.log('📊 Response error:', error);
      
      if (error) {
        console.error('❌ Error updating exercise:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error(`Fout bij het bijwerken van oefening: ${error.message}`);
        return; // Don't close modal on error
      } else {
        console.log('✅ Exercise updated successfully:', data);
        console.log('🔄 Step 3: Updating local state...');
        
        // Force a complete refresh of the exercises list
        console.log('🔄 Refreshing exercises list from database...');
        await fetchExercises();
        
        console.log('🔒 Step 4: Closing modal...');
        setShowEditModal(false);
        setShowNewExerciseModal(false); // Also reset new exercise modal
        setEditingExercise(null);
        
        console.log('✅ Update complete!');
        toast.success('Oefening succesvol bijgewerkt');
      }
    } catch (err) {
      console.error('❌ Exception updating exercise:', err);
      console.error('❌ Exception stack:', err instanceof Error ? err.stack : 'No stack');
      toast.error(`Fout bij het bijwerken van oefening: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      // Don't close modal on exception - let user try again
    }
  };

  const handleDeleteExercise = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze oefening wilt verwijderen?')) return;
    
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting exercise:', error);
        toast.error('Fout bij het verwijderen van oefening');
      } else {
        setExercises(exercises.filter(ex => ex.id !== id));
        toast.success('Oefening succesvol verwijderd');
      }
    } catch (err) {
      console.error('Exception deleting exercise:', err);
      toast.error('Fout bij het verwijderen van oefening');
    }
  };

  const handleDeleteSchema = async (id: number) => {
    if (!confirm('Weet je zeker dat je dit trainingsschema wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return;
    
    try {
      // Eerst alle day IDs ophalen voor dit schema
      const { data: dayIds, error: fetchDaysError } = await supabase
        .from('training_schema_days')
        .select('id')
        .eq('schema_id', id);
      
      if (fetchDaysError) {
        console.error('Error fetching training schema days:', fetchDaysError);
        toast.error('Fout bij het ophalen van trainingsdagen');
        return;
      }

      // Dan alle training schema day exercises verwijderen
      if (dayIds && dayIds.length > 0) {
        const dayIdArray = dayIds.map(day => day.id);
        const { error: dayExercisesError } = await supabase
          .from('training_schema_exercises')
          .delete()
          .in('schema_day_id', dayIdArray);
        
        if (dayExercisesError) {
          console.error('Error deleting training schema day exercises:', dayExercisesError);
          toast.error('Fout bij het verwijderen van oefeningen uit trainingsdagen');
          return;
        }
      }

      // Dan alle training schema days verwijderen
      const { error: daysError } = await supabase
        .from('training_schema_days')
        .delete()
        .eq('schema_id', id);
      
      if (daysError) {
        console.error('Error deleting training schema days:', daysError);
        toast.error('Fout bij het verwijderen van trainingsdagen');
        return;
      }

      // Dan het schema zelf verwijderen
      const { error: schemaError } = await supabase
        .from('training_schemas')
        .delete()
        .eq('id', id);
      
      if (schemaError) {
        console.error('Error deleting training schema:', schemaError);
        toast.error('Fout bij het verwijderen van trainingsschema');
      } else {
        setSchemas(schemas.filter(schema => schema.id !== id));
        toast.success('Trainingsschema succesvol verwijderd');
      }
    } catch (err) {
      console.error('Exception deleting training schema:', err);
      toast.error('Fout bij het verwijderen van trainingsschema');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'draft': return 'text-yellow-400';
      case 'active': return 'text-green-400';
      case 'upcoming': return 'text-blue-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Gepubliceerd';
      case 'draft': return 'Concept';
      case 'active': return 'Actief';
      case 'upcoming': return 'Komend';
      default: return status;
    }
  };

  const filteredSchemas = schemas.filter(schema => 
    schema.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'Alle Categorieën' || schema.category === filterCategory)
  );

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Equipment filter
    let matchesEquipment = true;
    if (filterEquipment !== 'Alle Materialen') {
      const selectedCategory = equipmentCategories.find(cat => cat.label === filterEquipment);
      matchesEquipment = selectedCategory ? selectedCategory.equipment.includes(exercise.equipment) : true;
    }
    
    // Muscle filter
    let matchesMuscle = true;
    if (filterMuscle !== 'Alle Spiergroepen') {
      // Special handling for "Armen" to include Biceps and Triceps
      if (filterMuscle === 'Armen') {
        matchesMuscle = exercise.primary_muscle === 'Biceps' || exercise.primary_muscle === 'Triceps';
      } else {
        matchesMuscle = exercise.primary_muscle === filterMuscle;
      }
    }
    
    return matchesSearch && matchesEquipment && matchesMuscle;
  });

  // Show loading state if component is not mounted yet
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Pagina laden..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Trainingscentrum Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer trainingsschema's, oefeningen en challenges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          icon={<CalendarIcon className="w-6 h-6" />}
          value={loadingStats ? (
            <div className="h-8 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
          ) : stats.totalSchemas}
          title="Trainingsschema's"
          color="blue"
        />
        <AdminStatsCard
          icon={<PlayIcon className="w-6 h-6" />}
          value={loadingStats ? (
            <div className="h-8 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
          ) : stats.totalExercises}
          title="Oefeningen"
          color="green"
        />
        <AdminStatsCard
          icon={<FireIcon className="w-6 h-6" />}
          value={loadingStats ? (
            <div className="h-8 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
          ) : stats.totalChallenges}
          title="Challenges"
          color="orange"
        />
        <AdminStatsCard
          icon={<UserGroupIcon className="w-6 h-6" />}
          value={loadingStats ? (
            <div className="h-8 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
          ) : stats.activeUsers.toLocaleString('nl-NL')}
          title="Actieve Gebruikers"
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="bg-[#232D1A] rounded-2xl p-2 border border-[#3A4D23]">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('schemas')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'schemas'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            Schema Beheer
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'exercises'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <PlayIcon className="w-5 h-5" />
            Oefeningen Bibliotheek
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'challenges'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <FireIcon className="w-5 h-5" />
            Challenge Beheer
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'progress'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-[#8BAE5A] hover:bg-[#181F17]'
            }`}
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            Gebruikersprogressie
          </button>
        </div>
      </div>

      {/* Schema Beheer */}
      {activeTab === 'schemas' && (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
                <input
                  type="text"
                  placeholder="Zoek schema's..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="Alle Categorieën">Alle Categorieën</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <AdminButton
              onClick={() => { 
                console.log('Open SchemaBuilder modal');
                setShowNewSchemaModal(true);
              }}
              variant="primary"
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Nieuw Trainingsschema
            </AdminButton>
          </div>

          {/* Schemas Table */}
          {loadingSchemas ? (
            <AdminCard>
              <div className="space-y-4">
                {/* Skeleton Header */}
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-[#3A4D23] rounded w-48 animate-pulse"></div>
                  <div className="h-6 bg-[#3A4D23] rounded w-32 animate-pulse"></div>
                </div>
                
                {/* Skeleton Rows */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border-b border-[#3A4D23]">
                    <div className="w-12 h-12 bg-[#3A4D23] rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#3A4D23] rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-[#3A4D23] rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-[#3A4D23] rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
                    <div className="h-6 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-[#3A4D23] rounded w-16 animate-pulse"></div>
                      <div className="h-8 bg-[#3A4D23] rounded w-16 animate-pulse"></div>
                      <div className="h-8 bg-[#3A4D23] rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          ) : errorSchemas ? (
            <AdminCard>
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 text-lg mb-2">Fout bij het laden</p>
                <p className="text-[#B6C948]/70 text-sm mb-4">{errorSchemas}</p>
                <AdminButton
                  onClick={fetchSchemas}
                  variant="primary"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Opnieuw proberen
                </AdminButton>
              </div>
            </AdminCard>
          ) : filteredSchemas.length === 0 ? (
            <AdminCard>
              <div className="text-center">
                <CalendarIcon className="w-12 h-12 text-[#8BAE5A]/50 mx-auto mb-4" />
                <p className="text-[#B6C948] text-lg mb-2">Geen trainingsschema's gevonden</p>
                <p className="text-[#B6C948]/70 text-sm">
                  {searchTerm || filterCategory !== 'Alle Categorieën' 
                    ? 'Probeer je zoekcriteria aan te passen.' 
                    : 'Er zijn nog geen trainingsschema\'s toegevoegd.'}
                </p>
              </div>
            </AdminCard>
          ) : (
            <AdminCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#181F17]">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A] w-1/3">Schema</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A] w-1/12">Categorie</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-[#8BAE5A] w-1/12">Dagen</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-[#8BAE5A] w-1/12">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-[#8BAE5A] w-1/12">Gebruikers</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-[#8BAE5A] w-1/4">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {filteredSchemas.map((schema) => (
                      <tr key={schema.id} className="hover:bg-[#181F17] transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#8BAE5A]/20 flex items-center justify-center flex-shrink-0">
                              <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-[#8BAE5A] font-semibold truncate">{schema.name}</h3>
                              <p className="text-[#B6C948] text-sm line-clamp-2">{schema.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#8BAE5A] bg-[#181F17]">
                            {schema.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#8BAE5A] font-semibold">{schema.training_schema_days?.length || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(schema.status)} bg-[#181F17]`}>
                            {getStatusText(schema.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[#8BAE5A] font-semibold">0</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">

                            <AdminButton 
                              onClick={() => {
                                setEditingSchema(mapDbSchemaToForm(schema));
                                setShowNewSchemaModal(true);
                              }}
                              variant="secondary"
                              size="sm"
                              className="!w-[70px] !min-w-[70px] !max-w-[70px] text-xs"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Bewerk
                            </AdminButton>
                            <AdminButton 
                              onClick={() => {
                                // Duplicate schema functionality
                                const duplicatedSchema = {
                                  ...mapDbSchemaToForm(schema),
                                  id: undefined,
                                  name: `${schema.name} (Kopie)`,
                                  status: 'draft'
                                };
                                setEditingSchema(duplicatedSchema);
                                setShowNewSchemaModal(true);
                              }}
                              variant="secondary" 
                              size="sm"
                              className="!w-[70px] !min-w-[70px] !max-w-[70px] text-xs"
                            >
                              <DocumentDuplicateIcon className="w-3 h-3" />
                              Kopieer
                            </AdminButton>
                            <AdminButton 
                              onClick={() => handleDeleteSchema(schema.id)}
                              variant="danger"
                              size="sm"
                              className="!w-[70px] !min-w-[70px] !max-w-[70px] text-xs"
                            >
                              <TrashIcon className="w-3 h-3" />
                              Del
                            </AdminButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}
        </div>
      )}

      {/* Oefeningen Bibliotheek */}
      {activeTab === 'exercises' && (
        <div className="space-y-6 relative">
          {/* Video Loading Overlay */}
          {showVideoLoadingOverlay && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-[#232D1A] rounded-2xl p-8 border border-[#3A4D23] text-center">
                <div className="animate-spin w-12 h-12 border-4 border-[#8BAE5A] border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-[#8BAE5A] text-xl font-semibold mb-2">Videos worden geladen...</h3>
                <p className="text-[#B6C948] text-sm">Even geduld, alle video's worden voorbereid</p>
              </div>
            </div>
          )}
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
                <input
                  type="text"
                  placeholder="Zoek oefeningen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>
              <select
                value={filterMuscle}
                onChange={(e) => setFilterMuscle(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="Alle Spiergroepen">Alle Spiergroepen</option>
                {muscleGroups.map(muscle => (
                  <option key={muscle} value={muscle}>{muscle}</option>
                ))}
              </select>
              <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className="px-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="Alle Materialen">Alle Materialen</option>
                {equipmentCategories.map(category => (
                  <option key={category.label} value={category.label}>{category.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              {/* Debug info */}
              <div className="text-[#B6C948] text-sm">
                {filteredExercises.length} van {exercises.length} oefeningen
                {searchTerm && ` (gevonden: "${searchTerm}")`}
                {filterMuscle !== 'Alle Spiergroepen' && ` (spiergroep: ${filterMuscle})`}
                {filterEquipment !== 'Alle Materialen' && ` (materiaal: ${filterEquipment})`}
              </div>
              <button
                onClick={() => {
                  setShowNewExerciseModal(true);
                  setShowEditModal(false); // Ensure edit modal is closed
                  setEditingExercise(null); // Clear any editing exercise
                }}
                className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nieuwe Oefening
              </button>
            </div>
          </div>

          {/* Exercises Grid */}
          {loadingExercises ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
                  {/* Video Skeleton */}
                  <div className="mb-4 aspect-video bg-[#3A4D23] rounded-xl animate-pulse"></div>
                  
                  {/* Content Skeleton */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#3A4D23] rounded-xl animate-pulse"></div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-[#3A4D23] rounded-xl animate-pulse"></div>
                      <div className="w-8 h-8 bg-[#3A4D23] rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="h-6 bg-[#3A4D23] rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-[#3A4D23] rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-[#3A4D23] rounded w-2/3 mb-4 animate-pulse"></div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-[#3A4D23] rounded w-24 animate-pulse"></div>
                      <div className="h-4 bg-[#3A4D23] rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-[#3A4D23] rounded w-20 animate-pulse"></div>
                      <div className="h-4 bg-[#3A4D23] rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : errorExercises ? (
            <AdminCard>
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 text-lg mb-2">Fout bij het laden</p>
                <p className="text-[#B6C948]/70 text-sm mb-4">{errorExercises}</p>
                <AdminButton
                  onClick={fetchExercises}
                  variant="primary"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Opnieuw proberen
                </AdminButton>
              </div>
            </AdminCard>
          ) : filteredExercises.length === 0 ? (
            <AdminCard>
              <div className="text-center">
                <PlayIcon className="w-12 h-12 text-[#8BAE5A]/50 mx-auto mb-4" />
                <p className="text-[#B6C948] text-lg mb-2">Geen oefeningen gevonden</p>
                <p className="text-[#B6C948]/70 text-sm">
                  {searchTerm || filterMuscle !== 'Alle Spiergroepen' 
                    ? 'Probeer je zoekcriteria aan te passen.' 
                    : 'Er zijn nog geen oefeningen toegevoegd.'}
                </p>
              </div>
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  data-exercise-id={exercise.id}
                  className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300 hover:shadow-lg hover:shadow-[#8BAE5A]/10"
                >
                  {/* Video Preview - Only show if there's a real video */}
                  {exercise.video_url && exercise.video_url !== '/video-placeholder.jpg' && exercise.video_url !== 'video-placeholder.jpg' && (
                    <div className="mb-4 relative">
                      <div 
                        className="aspect-video bg-[#181F17] rounded-xl border border-[#3A4D23] overflow-hidden cursor-pointer hover:border-[#8BAE5A] transition-colors relative group"
                      >
                        {/* Video Player with Controls */}
                        <video
                          src={getOptimizedVideoUrl(exercise.video_url, 'medium')}
                          className="w-full h-full object-cover rounded-xl"
                          preload="metadata"
                          controls
                          controlsList="nodownload"
                          onLoadStart={() => {
                            console.log('🎬 Video loading started:', exercise.name);
                          }}
                          onLoadedMetadata={(e) => {
                            const video = e.target as HTMLVideoElement;
                            setLoadedThumbnails(prev => new Set([...prev, exercise.id]));
                            console.log('✅ Video loaded:', exercise.name);
                          }}
                          onError={(e) => {
                            console.error('❌ Video error:', exercise.name, e);
                            setVideoErrors(prev => new Set([...prev, exercise.id]));
                          }}
                        />
                        

                        
                        {/* Loading Placeholder - Show when no thumbnails are loaded yet */}
                        {!loadedThumbnails.has(exercise.id) && !videoErrors.has(exercise.id) && (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#232D1A] to-[#181F17] flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin w-8 h-8 border-2 border-[#8BAE5A] border-t-transparent rounded-full mx-auto mb-2"></div>
                              <p className="text-[#8BAE5A] text-sm">
                                {thumbnailLoadingStarted ? 'Bezig met laden...' : 'Video laden...'}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Error State - Show when video fails to load */}
                        {videoErrors.has(exercise.id) && (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-red-800/20 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 92.0.1 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <p className="text-red-400 text-sm">Video niet beschikbaar</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Video Indicator */}
                  {(!exercise.video_url || exercise.video_url === '/video-placeholder.jpg' || exercise.video_url === 'video-placeholder.jpg') && (
                    <div className="mb-4 p-4 bg-[#181F17] rounded-xl border border-[#3A4D23] border-dashed">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#3A4D23]/50 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-[#8BAE5A] text-sm font-medium">Geen video</p>
                        <p className="text-[#B6C948] text-xs">Voeg een video toe via bewerken</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <PlayIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔧 Edit button clicked for exercise:', exercise);
                          setEditingExercise(exercise);
                          setShowEditModal(true);
                          setShowNewExerciseModal(false); // Ensure new exercise modal is closed
                          console.log('✅ Edit modal should be open now');
                        }}
                        className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
                      >
                        <PencilIcon className="w-4 h-4 text-[#B6C948]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
                      >
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">{exercise.name}</h3>
                  <p className="text-[#B6C948] text-sm mb-4">
                    {exercise.instructions.length > 100 
                      ? `${exercise.instructions.substring(0, 100)}...` 
                      : exercise.instructions}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948] text-sm">Primaire Spiergroep</span>
                      <span className="text-[#8BAE5A] font-semibold">{exercise.primary_muscle}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948] text-sm">Materiaal</span>
                      <span className="text-[#8BAE5A] font-semibold">{exercise.equipment}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondary_muscles && exercise.secondary_muscles.map((muscle: string, index: number) => (
                        <span key={index} className="px-2 py-1 rounded-full text-xs bg-[#181F17] text-[#B6C948]">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>

                  {exercise.worksheet_url && (
                    <a
                      href={exercise.worksheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline block mt-2"
                    >
                      Download werkblad (PDF)
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenge Beheer */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
                <input
                  type="text"
                  placeholder="Zoek challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>
            </div>
            <button
              onClick={() => setShowNewChallengeModal(true)}
              className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nieuwe Challenge
            </button>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                    <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(challenge.status)} bg-[#181F17]`}>
                    {getStatusText(challenge.status)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">{challenge.name}</h3>
                <p className="text-[#B6C948] text-sm mb-4">{challenge.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C948] text-sm">Duur</span>
                    <span className="text-[#8BAE5A] font-semibold">{challenge.duration} dagen</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C948] text-sm">Deelnemers</span>
                    <span className="text-[#8BAE5A] font-semibold">{challenge.participants.toLocaleString('nl-NL')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C948] text-sm">Startdatum</span>
                    <span className="text-[#8BAE5A] font-semibold">{new Date(challenge.startDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2">
                    <PencilIcon className="w-4 h-4" />
                    Bewerk
                  </button>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A] mb-2">Trainingsschema Analytics</h2>
            <p className="text-[#B6C948]">Data-gedreven inzichten voor het optimaliseren van je content</p>
          </div>

          {/* Popular Schemas Widget */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Meest Populaire Schema's</h3>
              <StarIcon className="w-6 h-6 text-[#B6C948]" />
            </div>
            <div className="space-y-4">
              {mockAnalytics.popularSchemas.map((schema, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#181F17] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center">
                      <span className="text-[#8BAE5A] font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-[#8BAE5A] font-semibold">{schema.name}</h4>
                      <p className="text-[#B6C948] text-sm">{schema.users.toLocaleString('nl-NL')} gebruikers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#8BAE5A] font-bold">{schema.completionRate}%</div>
                    <div className="text-[#B6C948] text-sm">Voltooiing</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schema Completion Widget */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Schema Voltooiingsgraad</h3>
              <CheckCircleIcon className="w-6 h-6 text-[#B6C948]" />
            </div>
            <div className="space-y-4">
              {mockAnalytics.schemaCompletion.map((schema, index) => (
                <div key={index} className="p-4 bg-[#181F17] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[#8BAE5A] font-semibold">{schema.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      schema.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      schema.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {schema.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#B6C948] text-sm">Voltooiing</span>
                        <span className="text-[#8BAE5A] font-semibold">{schema.completionRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#3A4D23] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            schema.completionRate >= 80 ? 'bg-green-500' :
                            schema.completionRate >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${schema.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {schema.completionRate < 50 && (
                    <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Overweeg het aanpassen van de moeilijkheidsgraad</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skipped Exercises Widget */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Meest Overgeslagen Oefeningen</h3>
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-4">
              {mockAnalytics.skippedExercises.map((exercise, index) => (
                <div key={index} className="p-4 bg-[#181F17] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[#8BAE5A] font-semibold">{exercise.name}</h4>
                    <span className="text-red-400 font-bold">{exercise.skipRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C948] text-sm">Reden: {exercise.reason}</span>
                    <button className="px-3 py-1 rounded-lg bg-[#8BAE5A] text-[#181F17] text-sm font-semibold hover:bg-[#B6C948] transition">
                      Alternatief Toevoegen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#8BAE5A] mb-2">Gebruikersprogressie & Feedback</h2>
            <p className="text-[#B6C948]">Community-brede resultaten en feedback voor platform optimalisatie</p>
          </div>

          {/* Global Strength Widget */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Globale Krachttoename</h3>
              <ArrowTrendingUpIcon className="w-6 h-6 text-[#B6C948]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(mockProgress.globalStrength).map(([lift, data]) => (
                <div key={lift} className="p-4 bg-[#181F17] rounded-xl text-center">
                  <h4 className="text-[#8BAE5A] font-semibold capitalize mb-2">{lift}</h4>
                  <div className="text-2xl font-bold text-[#8BAE5A] mb-1">{data.current}kg</div>
                  <div className="text-green-400 font-semibold">{data.change}</div>
                  <div className="text-[#B6C948] text-sm">vs vorige maand</div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular PRs Widget */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Populairste PR's (Deze Maand)</h3>
              <BoltIcon className="w-6 h-6 text-[#B6C948]" />
            </div>
            <div className="space-y-4">
              {mockProgress.popularPRs.map((pr, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#181F17] rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center">
                      <span className="text-[#8BAE5A] font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-[#8BAE5A] font-semibold">{pr.exercise}</h4>
                      <p className="text-[#B6C948] text-sm">{pr.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#8BAE5A] font-bold">{pr.prs}</div>
                    <div className="text-[#B6C948] text-sm">PR's</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Feedback Widget */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#8BAE5A]">Ingekomen Feedback op Workouts</h3>
              <UserGroupIcon className="w-6 h-6 text-[#B6C948]" />
            </div>
            <div className="space-y-4">
              {mockProgress.workoutFeedback.map((feedback, index) => (
                <div key={index} className="p-4 bg-[#181F17] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[#8BAE5A] font-semibold">{feedback.workout}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(feedback.rating) ? 'text-yellow-400 fill-current' : 'text-[#B6C948]'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-[#8BAE5A] font-semibold">{feedback.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#B6C948] text-sm">Moeilijkheidsgraad: {feedback.difficulty}</span>
                    <span className="text-[#B6C948] text-sm">{new Date(feedback.date).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="space-y-1">
                    {feedback.comments.map((comment, commentIndex) => (
                      <div key={commentIndex} className="text-[#B6C948] text-sm bg-[#232D1A] p-2 rounded-lg">
                        "{comment}"
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schema Builder Modal */}
      <SchemaBuilder 
        isOpen={showNewSchemaModal}
        onClose={() => {
          setShowNewSchemaModal(false);
          setEditingSchema(null);
        }}
        schema={editingSchema}
        onSave={(schema) => {
          // Refresh schemas after saving
          fetchSchemas();
          setShowNewSchemaModal(false);
          setEditingSchema(null);
        }}
      />

      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={showNewExerciseModal || showEditModal}
        onClose={() => {
          console.log('🔒 ExerciseModal onClose called');
          console.log('🔒 Resetting modal states...');
          setShowNewExerciseModal(false);
          setShowEditModal(false);
          setEditingExercise(null);
          console.log('🔒 Modal states reset complete');
        }}
        onSave={async (exerciseData) => {
          console.log('💾 ExerciseModal onSave called with data:', exerciseData);
          if (editingExercise) {
            console.log('🔄 Updating existing exercise:', editingExercise.id);
            await handleUpdateExercise(editingExercise.id, exerciseData);
          } else {
            console.log('➕ Adding new exercise');
            await handleAddExercise(exerciseData);
          }
        }}
        exercise={editingExercise}
        muscleGroups={muscleGroups}
      />
    </div>
  );
} 