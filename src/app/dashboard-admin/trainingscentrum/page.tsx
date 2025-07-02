'use client';
import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
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
  BoltIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import SchemaBuilder from './SchemaBuilder';
import ExerciseModal from './ExerciseModal';

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
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Ga liggen op de bank, pak de stang op schouderbreedte, laat zakken naar borst en duw omhoog.',
    difficulty: 'Intermediate'
  },
  {
    id: 2,
    name: 'Dumbbell Press',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Ga liggen met dumbbells op schouderhoogte, duw beide dumbbells gelijktijdig omhoog.',
    difficulty: 'Beginner'
  },
  {
    id: 3,
    name: 'Push-ups',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel', 'Core'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Start in plank positie, laat je lichaam zakken en duw jezelf omhoog.',
    difficulty: 'Beginner'
  },
  {
    id: 4,
    name: 'Incline Bench Press',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Triceps', 'Voorste Deltavleugel'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Bench press op een hellende bank (30-45 graden) voor focus op bovenste borst.',
    difficulty: 'Intermediate'
  },
  {
    id: 5,
    name: 'Cable Flyes',
    primaryMuscle: 'Borst',
    secondaryMuscles: ['Voorste Deltavleugel'],
    equipment: 'Cable',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Sta tussen de kabels, trek beide kabels naar elkaar toe in een vloeiende beweging.',
    difficulty: 'Intermediate'
  },

  // RUG - 5 meest populaire oefeningen
  {
    id: 6,
    name: 'Pull-up',
    primaryMuscle: 'Rug',
    secondaryMuscles: ['Biceps', 'Onderarmen'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hang aan de pull-up bar, trek jezelf omhoog tot je kin over de stang is.',
    difficulty: 'Advanced'
  },
  {
    id: 7,
    name: 'Deadlift',
    primaryMuscle: 'Rug',
    secondaryMuscles: ['Benen', 'Glutes', 'Core'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Pak de stang op, houd je rug recht en til de stang op door je heupen te strekken.',
    difficulty: 'Advanced'
  },
  {
    id: 8,
    name: 'Barbell Row',
    primaryMuscle: 'Rug',
    secondaryMuscles: ['Biceps', 'Onderarmen'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Buig voorover, trek de stang naar je onderbuik terwijl je je ellebogen dicht bij je lichaam houdt.',
    difficulty: 'Intermediate'
  },
  {
    id: 9,
    name: 'Lat Pulldown',
    primaryMuscle: 'Rug',
    secondaryMuscles: ['Biceps', 'Onderarmen'],
    equipment: 'Machine',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Trek de stang naar je borst terwijl je je schouderbladen naar elkaar toe trekt.',
    difficulty: 'Beginner'
  },
  {
    id: 10,
    name: 'Seated Cable Row',
    primaryMuscle: 'Rug',
    secondaryMuscles: ['Biceps', 'Onderarmen'],
    equipment: 'Cable',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Zit rechtop, trek de handgrepen naar je buik terwijl je je rug recht houdt.',
    difficulty: 'Beginner'
  },

  // BENEN - 5 meest populaire oefeningen
  {
    id: 11,
    name: 'Squat',
    primaryMuscle: 'Benen',
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Plaats de stang op je schouders, zak door je knieën tot je dijen parallel zijn aan de grond.',
    difficulty: 'Beginner'
  },
  {
    id: 12,
    name: 'Deadlift',
    primaryMuscle: 'Benen',
    secondaryMuscles: ['Rug', 'Glutes', 'Core'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Pak de stang op, houd je rug recht en til de stang op door je heupen te strekken.',
    difficulty: 'Advanced'
  },
  {
    id: 13,
    name: 'Leg Press',
    primaryMuscle: 'Benen',
    secondaryMuscles: ['Glutes'],
    equipment: 'Machine',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Zit in de machine, duw het platform weg met je voeten en laat gecontroleerd zakken.',
    difficulty: 'Beginner'
  },
  {
    id: 14,
    name: 'Lunges',
    primaryMuscle: 'Benen',
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Stap naar voren, zak door beide knieën en duw jezelf terug naar de startpositie.',
    difficulty: 'Beginner'
  },
  {
    id: 15,
    name: 'Romanian Deadlift',
    primaryMuscle: 'Benen',
    secondaryMuscles: ['Rug', 'Glutes'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Houd je benen recht, buig voorover en laat de stang langs je benen zakken.',
    difficulty: 'Intermediate'
  },

  // SCHOUDERS - 5 meest populaire oefeningen
  {
    id: 16,
    name: 'Overhead Press',
    primaryMuscle: 'Schouders',
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Duw de stang van schouderhoogte omhoog tot je armen volledig gestrekt zijn.',
    difficulty: 'Intermediate'
  },
  {
    id: 17,
    name: 'Dumbbell Shoulder Press',
    primaryMuscle: 'Schouders',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Duw beide dumbbells gelijktijdig omhoog vanaf schouderhoogte.',
    difficulty: 'Beginner'
  },
  {
    id: 18,
    name: 'Lateral Raises',
    primaryMuscle: 'Schouders',
    secondaryMuscles: ['Trapezius'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hef beide dumbbells zijwaarts omhoog tot schouderhoogte.',
    difficulty: 'Beginner'
  },
  {
    id: 19,
    name: 'Front Raises',
    primaryMuscle: 'Schouders',
    secondaryMuscles: ['Voorste Deltavleugel'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hef beide dumbbells voorwaarts omhoog tot schouderhoogte.',
    difficulty: 'Beginner'
  },
  {
    id: 20,
    name: 'Upright Rows',
    primaryMuscle: 'Schouders',
    secondaryMuscles: ['Trapezius', 'Biceps'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Trek de stang omhoog langs je lichaam tot onder je kin.',
    difficulty: 'Intermediate'
  },

  // ARMEN - 5 meest populaire oefeningen
  {
    id: 21,
    name: 'Bicep Curl',
    primaryMuscle: 'Armen',
    secondaryMuscles: ['Onderarmen'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hef de dumbbells omhoog door je ellebogen te buigen, houd je bovenarmen stil.',
    difficulty: 'Beginner'
  },
  {
    id: 22,
    name: 'Tricep Dip',
    primaryMuscle: 'Armen',
    secondaryMuscles: ['Borst', 'Schouders'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Laat je lichaam zakken door je ellebogen te buigen en duw jezelf omhoog.',
    difficulty: 'Intermediate'
  },
  {
    id: 23,
    name: 'Hammer Curl',
    primaryMuscle: 'Armen',
    secondaryMuscles: ['Onderarmen'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hef de dumbbells omhoog met je handpalmen naar elkaar toe gericht.',
    difficulty: 'Beginner'
  },
  {
    id: 24,
    name: 'Tricep Pushdown',
    primaryMuscle: 'Armen',
    secondaryMuscles: [],
    equipment: 'Cable',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Duw de kabel naar beneden door je ellebogen te strekken.',
    difficulty: 'Beginner'
  },
  {
    id: 25,
    name: 'Preacher Curl',
    primaryMuscle: 'Armen',
    secondaryMuscles: ['Onderarmen'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Voer bicep curls uit met je armen ondersteund op de preacher bank.',
    difficulty: 'Intermediate'
  },

  // CORE - 5 meest populaire oefeningen
  {
    id: 26,
    name: 'Plank',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Schouders', 'Glutes'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Houd je lichaam in een rechte lijn, ondersteund door je onderarmen en tenen.',
    difficulty: 'Beginner'
  },
  {
    id: 27,
    name: 'Crunches',
    primaryMuscle: 'Core',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Krul je bovenlichaam omhoog terwijl je je voeten op de grond houdt.',
    difficulty: 'Beginner'
  },
  {
    id: 28,
    name: 'Russian Twist',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Obliques'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Draai je bovenlichaam van links naar rechts terwijl je je voeten van de grond houdt.',
    difficulty: 'Intermediate'
  },
  {
    id: 29,
    name: 'Mountain Climbers',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Schouders', 'Benen'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Wissel snel je knieën af terwijl je in plank positie blijft.',
    difficulty: 'Intermediate'
  },
  {
    id: 30,
    name: 'Leg Raises',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Heupflexoren'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hef je benen omhoog terwijl je op je rug ligt, houd je onderrug op de grond.',
    difficulty: 'Intermediate'
  },

  // GLUTES - 5 meest populaire oefeningen
  {
    id: 31,
    name: 'Hip Thrust',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Benen', 'Core'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Leun tegen een bank, plaats de stang op je heupen en duw je heupen omhoog.',
    difficulty: 'Intermediate'
  },
  {
    id: 32,
    name: 'Glute Bridge',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Benen', 'Core'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Lig op je rug, buig je knieën en duw je heupen omhoog.',
    difficulty: 'Beginner'
  },
  {
    id: 33,
    name: 'Donkey Kicks',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Benen'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Op handen en knieën, schop je been omhoog en naar achteren.',
    difficulty: 'Beginner'
  },
  {
    id: 34,
    name: 'Bulgarian Split Squat',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Benen', 'Core'],
    equipment: 'Dumbbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Plaats je achterste voet op een verhoging en voer squats uit met je voorste been.',
    difficulty: 'Advanced'
  },
  {
    id: 35,
    name: 'Cable Kickback',
    primaryMuscle: 'Glutes',
    secondaryMuscles: ['Benen'],
    equipment: 'Cable',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Schop je been naar achteren terwijl je voorover buigt en de kabel vasthoudt.',
    difficulty: 'Beginner'
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
const muscleGroups = ['Borst', 'Rug', 'Benen', 'Schouders', 'Armen', 'Core', 'Glutes'];
const equipment = ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable', 'Kettlebell'];

export default function TrainingscentrumBeheer() {
  const [activeTab, setActiveTab] = useState('schemas');
  const [selectedSchema, setSelectedSchema] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [showNewSchemaModal, setShowNewSchemaModal] = useState(false);
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Alle Categorieën');
  const [filterMuscle, setFilterMuscle] = useState('Alle Spiergroepen');
  
  // Database state
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch exercises from database
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching exercises:', error);
        toast.error('Fout bij het laden van oefeningen');
      } else {
        setExercises(data || []);
      }
    } catch (err) {
      console.error('Exception fetching exercises:', err);
      toast.error('Fout bij het laden van oefeningen');
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleAddExercise = async (exerciseData: any) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding exercise:', error);
        toast.error('Fout bij het toevoegen van oefening');
      } else {
        setExercises([...exercises, data]);
        setShowNewExerciseModal(false);
        toast.success('Oefening succesvol toegevoegd');
      }
    } catch (err) {
      console.error('Exception adding exercise:', err);
      toast.error('Fout bij het toevoegen van oefening');
    }
  };

  const handleUpdateExercise = async (id: number, exerciseData: any) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(exerciseData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating exercise:', error);
        toast.error('Fout bij het bijwerken van oefening');
      } else {
        setExercises(exercises.map(ex => ex.id === id ? data : ex));
        setShowEditModal(false);
        setEditingExercise(null);
        toast.success('Oefening succesvol bijgewerkt');
      }
    } catch (err) {
      console.error('Exception updating exercise:', err);
      toast.error('Fout bij het bijwerken van oefening');
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

  const filteredSchemas = mockSchemas.filter(schema => 
    schema.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'Alle Categorieën' || schema.category === filterCategory)
  );

  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterMuscle === 'Alle Spiergroepen' || exercise.primary_muscle === filterMuscle)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Trainingscentrum Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer trainingsschema's, oefeningen en challenges</p>
        </div>
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
            <button
              onClick={() => { 
                console.log('Open SchemaBuilder modal');
                setShowNewSchemaModal(true);
              }}
              className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nieuw Trainingsschema
            </button>
          </div>

          {/* Schemas Table */}
          <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                  <tr>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Schema</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Categorie</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Dagen</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Gebruikers</th>
                    <th className="px-6 py-4 text-center text-[#8BAE5A] font-semibold">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {filteredSchemas.map((schema) => (
                    <tr key={schema.id} className="hover:bg-[#181F17] transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#8BAE5A]/20 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                          </div>
                          <div>
                            <h3 className="text-[#8BAE5A] font-semibold">{schema.name}</h3>
                            <p className="text-[#B6C948] text-sm">{schema.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#8BAE5A] bg-[#181F17]">
                          {schema.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#8BAE5A] font-semibold">{schema.days}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(schema.status)} bg-[#181F17]`}>
                          {getStatusText(schema.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#8BAE5A] font-semibold">{schema.enrolledUsers.toLocaleString('nl-NL')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                            <EyeIcon className="w-4 h-4 text-[#B6C948]" />
                          </button>
                          <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                            <PencilIcon className="w-4 h-4 text-[#B6C948]" />
                          </button>
                          <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                            <DocumentDuplicateIcon className="w-4 h-4 text-[#B6C948]" />
                          </button>
                          <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Oefeningen Bibliotheek */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
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
            </div>
            <div className="flex items-center gap-4">
              {/* Debug info */}
              <div className="text-[#B6C948] text-sm">
                {filteredExercises.length} van {mockExercises.length} oefeningen
                {searchTerm && ` (gefilterd op: "${searchTerm}")`}
                {filterMuscle !== 'Alle Spiergroepen' && ` (spiergroep: ${filterMuscle})`}
              </div>
              <button
                onClick={() => setShowNewExerciseModal(true)}
                className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nieuwe Oefening
              </button>
            </div>
          </div>

          {/* Exercises Grid */}
          {loadingExercises ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-[#B6C948]">Oefeningen laden...</p>
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <PlayIcon className="w-12 h-12 text-[#8BAE5A]/50 mx-auto mb-4" />
              <p className="text-[#B6C948] text-lg mb-2">Geen oefeningen gevonden</p>
              <p className="text-[#B6C948]/70 text-sm">
                {searchTerm || filterMuscle !== 'Alle Spiergroepen' 
                  ? 'Probeer je zoekcriteria aan te passen.' 
                  : 'Er zijn nog geen oefeningen toegevoegd.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
                  {/* Video Preview */}
                  {exercise.video_url && (
                    <div className="mb-4 relative">
                      <video 
                        src={exercise.video_url} 
                        className="w-full h-32 object-cover rounded-xl border border-[#3A4D23] bg-[#181F17]"
                        controls
                      />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <PlayIcon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingExercise(exercise);
                          setShowEditModal(true);
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
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948] text-sm">Niveau</span>
                      <span className="text-[#8BAE5A] font-semibold">{exercise.difficulty}</span>
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
                  <button className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    Bekijk
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockSchemas.length}</h3>
              <p className="text-[#B6C948] text-sm">Trainingsschema's</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <PlayIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">{exercises.length}</h3>
              <p className="text-[#B6C948] text-sm">Oefeningen</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockChallenges.length}</h3>
              <p className="text-[#B6C948] text-sm">Challenges</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <CogIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">2,139</h3>
              <p className="text-[#B6C948] text-sm">Actieve Gebruikers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Builder Modal */}
      <SchemaBuilder 
        isOpen={showNewSchemaModal}
        onClose={() => {
          console.log('Close SchemaBuilder modal');
          setShowNewSchemaModal(false);
        }}
      />

      {/* Exercise Modal */}
      <ExerciseModal
        isOpen={showNewExerciseModal || showEditModal}
        onClose={() => {
          setShowNewExerciseModal(false);
          setShowEditModal(false);
          setEditingExercise(null);
        }}
        onSave={(exerciseData) => {
          if (editingExercise) {
            handleUpdateExercise(editingExercise.id, exerciseData);
          } else {
            handleAddExercise(exerciseData);
          }
        }}
        exercise={editingExercise}
      />
    </div>
  );
} 