'use client';
import { useState } from 'react';
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
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import SchemaBuilder from './SchemaBuilder';

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
    name: 'Squat',
    primaryMuscle: 'Benen',
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: 'Barbell',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Plaats de stang op je schouders, zak door je knieën tot je dijen parallel zijn aan de grond.',
    difficulty: 'Beginner'
  },
  {
    id: 3,
    name: 'Pull-up',
    primaryMuscle: 'Rug',
    secondaryMuscles: ['Biceps', 'Onderarmen'],
    equipment: 'Bodyweight',
    videoUrl: '/video-placeholder.jpg',
    instructions: 'Hang aan de pull-up bar, trek jezelf omhoog tot je kin over de stang is.',
    difficulty: 'Advanced'
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

  const filteredExercises = mockExercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterMuscle === 'Alle Spiergroepen' || exercise.primaryMuscle === filterMuscle)
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
              onClick={() => setShowNewSchemaModal(true)}
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
            <button
              onClick={() => setShowNewExerciseModal(true)}
              className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Nieuwe Oefening
            </button>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                    <PlayIcon className="w-6 h-6 text-[#8BAE5A]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                      <PencilIcon className="w-4 h-4 text-[#B6C948]" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-[#8BAE5A] mb-2">{exercise.name}</h3>
                <p className="text-[#B6C948] text-sm mb-4">{exercise.instructions.substring(0, 100)}...</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C948] text-sm">Primaire Spiergroep</span>
                    <span className="text-[#8BAE5A] font-semibold">{exercise.primaryMuscle}</span>
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
                    {exercise.secondaryMuscles.map((muscle, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-[#181F17] text-[#B6C948]">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockExercises.length}</h3>
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
        onClose={() => setShowNewSchemaModal(false)}
      />
    </div>
  );
} 