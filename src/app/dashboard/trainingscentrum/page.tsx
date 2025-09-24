'use client';
import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  PlayIcon, 
  ClockIcon, 
  FireIcon, 
  ChartBarIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty_level: string;
  estimated_duration_minutes: number;
  equipment_needed: string[];
  target_audience: string;
  created_at: string;
  workout_categories?: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    color: string;
  };
  workout_template_exercises?: Array<{
    id: string;
    order_index: number;
    sets: number;
    reps: string;
    rest_seconds: number;
    notes?: string;
    exercises: {
      id: string;
      name: string;
      description: string;
      instructions: string[];
      video_url?: string;
      image_url?: string;
      muscle_groups: string[];
      equipment_type: string;
      difficulty_level: string;
    };
  }>;
}

interface UserWorkoutSession {
  id: string;
  session_name: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  status: string;
  notes?: string;
  workout_templates?: {
    id: string;
    name: string;
    description: string;
    difficulty_level: string;
    estimated_duration_minutes: number;
  };
}

export default function TrainingscentrumPage() {
  const { user } = useSupabaseAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [sessions, setSessions] = useState<UserWorkoutSession[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'sessions'>('templates');

  // Load workout data from database
  useEffect(() => {
    if (!user?.id) return;

    const loadWorkoutData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load templates
        const templatesResponse = await fetch('/api/workouts/templates');
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData.templates || []);
          setCategories(templatesData.categories || []);
        }

        // Load user sessions
        const sessionsResponse = await fetch(`/api/workouts/sessions?userId=${user.id}`);
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
        }
      } catch (err) {
        console.error('Error loading workout data:', err);
        setError('Er is een fout opgetreden bij het laden van de workout data.');
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutData();
  }, [user?.id]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Gemiddeld';
      case 'advanced': return 'Gevorderd';
      default: return 'Onbekend';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}u ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.workout_categories?.id === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty_level === selectedDifficulty;
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-white text-lg">Workout data laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#8BAE5A] text-white px-4 py-2 rounded-lg hover:bg-[#7A9E4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#B6C948] mb-2">Trainingscentrum</h1>
          <p className="text-gray-300">Ontdek workouts, start sessies en track je progressie</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-[#2A3A1A] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <PlayIcon className="w-4 h-4 inline mr-2" />
            Workout Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <ChartBarIcon className="w-4 h-4 inline mr-2" />
            Mijn Sessies ({sessions.length})
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#2A3A1A] border border-[#3A4A2A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-[#2A3A1A] border border-[#3A4A2A] rounded-lg text-white hover:bg-[#3A4A2A] transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-[#2A3A1A] border border-[#3A4A2A] rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Categorie</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="all">Alle categorieën</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Moeilijkheidsgraad</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="all">Alle niveaus</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Gemiddeld</option>
                      <option value="advanced">Gevorderd</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <PlayIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Geen workouts gevonden</h3>
                <p className="text-gray-500">Probeer andere zoektermen of filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-[#2A3A1A] rounded-lg p-6 border border-[#3A4A2A] hover:border-[#8BAE5A] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{template.name}</h3>
                        <p className="text-gray-400 text-sm">{template.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getDifficultyColor(template.difficulty_level)}`}>
                        {getDifficultyText(template.difficulty_level)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {formatDuration(template.estimated_duration_minutes)}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <FireIcon className="w-4 h-4 mr-2" />
                        {template.workout_template_exercises?.length || 0} oefeningen
                      </div>
                      {template.workout_categories && (
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-2"></span>
                          {template.workout_categories.name}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-[#8BAE5A] text-[#181F17] text-center py-2 px-4 rounded-lg hover:bg-[#7A9E4A] transition-colors font-medium">
                        <PlayIcon className="w-4 h-4 inline mr-2" />
                        Start Workout
                      </button>
                      <button className="p-2 bg-[#3A4A2A] text-gray-400 rounded-lg hover:bg-[#4A5A3A] hover:text-white transition-colors">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Geen workout sessies</h3>
                <p className="text-gray-500 mb-6">Start je eerste workout om je progressie te tracken</p>
                <button className="bg-[#8BAE5A] text-white px-6 py-3 rounded-lg hover:bg-[#7A9E4A] transition-colors">
                  <PlayIcon className="w-4 h-4 inline mr-2" />
                  Start Workout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-[#2A3A1A] rounded-lg p-6 border border-[#3A4A2A]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{session.session_name}</h3>
                        {session.workout_templates && (
                          <p className="text-gray-400 text-sm">{session.workout_templates.name}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : session.status === 'in_progress'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {session.status === 'completed' ? 'Voltooid' : 
                         session.status === 'in_progress' ? 'Bezig' : 'Gestopt'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        {formatDate(session.started_at)}
                      </div>
                      {session.duration_minutes && (
                        <div className="flex items-center text-sm text-gray-400">
                          <FireIcon className="w-4 h-4 mr-2" />
                          {formatDuration(session.duration_minutes)}
                        </div>
                      )}
                      {session.workout_templates && (
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="w-2 h-2 bg-[#8BAE5A] rounded-full mr-2"></span>
                          {getDifficultyText(session.workout_templates.difficulty_level)}
                        </div>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-gray-400 text-sm mb-4">{session.notes}</p>
                    )}

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-[#8BAE5A] text-[#181F17] text-center py-2 px-4 rounded-lg hover:bg-[#7A9E4A] transition-colors font-medium">
                        {session.status === 'completed' ? 'Bekijk Details' : 'Verder met Workout'}
                      </button>
                      {session.status === 'in_progress' && (
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
