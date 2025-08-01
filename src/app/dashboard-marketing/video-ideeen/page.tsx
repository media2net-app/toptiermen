'use client';

import { useState } from 'react';
import { 
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  LightBulbIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ShareIcon,
  MegaphoneIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface VideoIdea {
  id: string;
  title: string;
  description: string;
  category: 'promotie' | 'tutorial' | 'testimonial' | 'lifestyle' | 'behind-the-scenes';
  priority: 'hoog' | 'medium' | 'laag';
  status: 'concept' | 'in-opname' | 'bewerking' | 'klaar' | 'gepubliceerd';
  location: string;
  estimatedDuration: string;
  targetAudience: string;
  keyMessages: string[];
  requiredProps: string[];
  notes: string;
  createdAt: string;
  assignedTo: string;
}

const initialVideoIdeas: VideoIdea[] = [
  {
    id: '1',
    title: 'Become a Top Tier Man - Ibiza Sunrise Motivation',
    description: 'Rick op een Ibiza klif tijdens zonsopgang, sprekend over wat het betekent om een Top Tier Man te zijn. Motiverende voice-over over discipline en mindset.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Cala Comte Klif (Zonsopgang)',
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Ambitieuze mannen (25-45 jaar)',
    keyMessages: ['Become a Top Tier Man', 'Discipline', 'Mindset', 'Launch 1 September', 'Pre-register now'],
    requiredProps: ['Camera setup', 'Microfoon', 'Zonsopgang timing', 'Countdown overlay'],
    notes: 'Opname tijdens zonsopgang (6:30 AM). Rick spreekt direct in camera over Top Tier Man concept. Voice-over: "Discipline is the bridge between goals and accomplishment. Are you ready to become a Top Tier Man? Launch September 1st. Pre-register now."',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '2',
    title: 'Boxing Training Session - Discipline in Action',
    description: 'Rick tijdens zijn boks PT sessie op zaterdag. Toont discipline en fysieke uitdaging. Voice-over over doorzettingsvermogen.',
    category: 'lifestyle',
    priority: 'hoog',
    status: 'concept',
    location: 'Ibiza Boxing Gym',
    estimatedDuration: '3-4 minuten',
    targetAudience: 'Fitness geïnteresseerden',
    keyMessages: ['Discipline in Action', 'Physical Challenge', 'Mental Strength', 'Top Tier Performance'],
    requiredProps: ['Boxing gloves', 'Training gear', 'Camera setup', 'Gym access'],
    notes: 'Opname tijdens zaterdag boks sessie. Rick toont intense training. Voice-over: "Discipline is doing what needs to be done, even when you don\'t want to. This is what separates Top Tier Men from the rest. Are you ready to push your limits?"',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '3',
    title: 'Ibiza Beach Meditation - Mindset Mastery',
    description: 'Rick op een rustige Ibiza beach, mediterend en sprekend over mindset en mentale kracht.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Cala Salada Beach',
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Mindfulness geïnteresseerden',
    keyMessages: ['Mindset Mastery', 'Mental Clarity', 'Inner Strength', 'Top Tier Mindset'],
    requiredProps: ['Meditation setup', 'Beach access', 'Quiet location', 'Natural sound'],
    notes: 'Vroege ochtend op rustige beach. Rick in meditatie pose, sprekend over mindset. Voice-over: "Your mindset determines your reality. Top Tier Men master their thoughts before they master their actions. Launch September 1st."',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '4',
    title: 'Sunset Countdown - 1 September Launch',
    description: 'Rick op Ibiza sunset point met countdown naar 1 september. Krachtige call-to-action voor pre-registratie.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Es Vedrà Sunset Point',
    estimatedDuration: '1-2 minuten',
    targetAudience: 'Alle potentiële leden',
    keyMessages: ['Countdown to Launch', 'Pre-register now', 'Exclusive Access', '1 September'],
    requiredProps: ['Countdown timer overlay', 'Sunset timing', 'Camera setup', 'Dramatic lighting'],
    notes: 'Opname tijdens zonsondergang. Rick spreekt over de countdown. Voice-over: "The countdown has begun. September 1st, 2025. Become a Top Tier Man. Pre-register now for exclusive early access. Don\'t miss your chance to join the elite."',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '5',
    title: 'Ibiza Villa Lifestyle - Success Mindset',
    description: 'Rick in een Ibiza villa, sprekend over succes mindset en hoe Top Tier Men leven en denken.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Luxury Ibiza Villa',
    estimatedDuration: '4-5 minuten',
    targetAudience: 'Lifestyle aspiranten',
    keyMessages: ['Success Mindset', 'Luxury Lifestyle', 'Top Tier Living', 'Elite Community'],
    requiredProps: ['Villa access', 'Luxury setting', 'Professional lighting', 'Lifestyle props'],
    notes: 'Rick in villa setting, sprekend over succes mindset. Voice-over: "Success is not accidental. Top Tier Men think differently, act differently, live differently. Join the elite. Launch September 1st."',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '6',
    title: 'Beach Workout - Physical Discipline',
    description: 'Rick doet een beach workout op Ibiza, toont fysieke discipline en motivatie.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Playa d\'en Bossa Beach',
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Fitness community',
    keyMessages: ['Physical Discipline', 'Beach Training', 'Consistency', 'Top Tier Fitness'],
    requiredProps: ['Workout equipment', 'Beach access', 'Training gear', 'Camera setup'],
    notes: 'Rick doet intense beach workout. Voice-over: "Discipline is consistency in action. Every rep, every set, every day. This is how Top Tier Men build their bodies and their character. Are you ready to commit?"',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '7',
    title: 'Rooftop Motivation - Become Elite',
    description: 'Rick op een Ibiza rooftop, sprekend over wat het betekent om elite te worden en deel te zijn van Top Tier Men.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Ibiza Rooftop Terrace',
    estimatedDuration: '3-4 minuten',
    targetAudience: 'Ambitieuze professionals',
    keyMessages: ['Become Elite', 'Top Tier Community', 'Exclusive Access', 'Pre-register'],
    requiredProps: ['Rooftop access', 'City view', 'Professional audio', 'Dramatic backdrop'],
    notes: 'Rick op rooftop met Ibiza uitzicht. Voice-over: "Elite is not a title, it\'s a choice. Top Tier Men choose excellence every day. Join the most exclusive community of high performers. Launch September 1st. Pre-register now."',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '8',
    title: 'Night Club Energy - Success Mindset',
    description: 'Rick in Ibiza nightclub setting, sprekend over succes mindset en de energie van Top Tier Men.',
    category: 'lifestyle',
    priority: 'medium',
    status: 'concept',
    location: 'Ibiza Nightclub',
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Young professionals',
    keyMessages: ['Success Energy', 'Nightlife Balance', 'Top Tier Lifestyle', 'Work Hard, Play Hard'],
    requiredProps: ['Club access', 'Night lighting', 'Audio setup', 'Lifestyle props'],
    notes: 'Rick in club setting, sprekend over balans. Voice-over: "Top Tier Men know how to work hard and play hard. Success is not just about business, it\'s about living life to the fullest. Join the elite. Launch September 1st."',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  }
];

export default function VideoIdeeenPage() {
  const [videoIdeas, setVideoIdeas] = useState<VideoIdea[]>(initialVideoIdeas);
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  const [selectedPriority, setSelectedPriority] = useState<string>('alle');
  const [selectedStatus, setSelectedStatus] = useState<string>('alle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<VideoIdea | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept': return 'bg-gray-500 text-white';
      case 'in-opname': return 'bg-blue-500 text-white';
      case 'bewerking': return 'bg-yellow-500 text-black';
      case 'klaar': return 'bg-green-500 text-white';
      case 'gepubliceerd': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hoog': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'laag': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'promotie': return <MegaphoneIcon className="w-4 h-4" />;
      case 'tutorial': return <AcademicCapIcon className="w-4 h-4" />;
      case 'testimonial': return <UserIcon className="w-4 h-4" />;
      case 'lifestyle': return <StarIcon className="w-4 h-4" />;
      case 'behind-the-scenes': return <EyeIcon className="w-4 h-4" />;
      default: return <VideoCameraIcon className="w-4 h-4" />;
    }
  };

  const filteredIdeas = videoIdeas.filter(idea => {
    const categoryMatch = selectedCategory === 'alle' || idea.category === selectedCategory;
    const priorityMatch = selectedPriority === 'alle' || idea.priority === selectedPriority;
    const statusMatch = selectedStatus === 'alle' || idea.status === selectedStatus;
    return categoryMatch && priorityMatch && statusMatch;
  });

  const addNewIdea = (idea: Omit<VideoIdea, 'id' | 'createdAt'>) => {
    const newIdea: VideoIdea = {
      ...idea,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setVideoIdeas([...videoIdeas, newIdea]);
    setShowAddModal(false);
  };

  const updateIdea = (updatedIdea: VideoIdea) => {
    setVideoIdeas(videoIdeas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
    setEditingIdea(null);
  };

  const deleteIdea = (id: string) => {
    setVideoIdeas(videoIdeas.filter(idea => idea.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Video Ideeën</h1>
            <p className="text-gray-400">Marketing video concepten voor Rick in Ibiza</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nieuw Video Idee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-black border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Ideeën</p>
              <p className="text-2xl font-bold text-white">{videoIdeas.length}</p>
            </div>
            <VideoCameraIcon className="w-8 h-8 text-[#3B82F6]" />
          </div>
        </div>
        
        <div className="bg-black border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Opname</p>
              <p className="text-2xl font-bold text-white">
                {videoIdeas.filter(idea => idea.status === 'in-opname').length}
              </p>
            </div>
            <PlayIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-black border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Klaar</p>
              <p className="text-2xl font-bold text-white">
                {videoIdeas.filter(idea => idea.status === 'klaar').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-black border border-gray-800 p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Hoog Prioriteit</p>
              <p className="text-2xl font-bold text-white">
                {videoIdeas.filter(idea => idea.priority === 'hoog').length}
              </p>
            </div>
            <StarIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black border border-gray-800 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Categorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="alle">Alle Categorieën</option>
              <option value="promotie">Promotie</option>
              <option value="tutorial">Tutorial</option>
              <option value="testimonial">Testimonial</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="behind-the-scenes">Behind-the-Scenes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Prioriteit</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="alle">Alle Prioriteiten</option>
              <option value="hoog">Hoog</option>
              <option value="medium">Medium</option>
              <option value="laag">Laag</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="alle">Alle Statussen</option>
              <option value="concept">Concept</option>
              <option value="in-opname">In Opname</option>
              <option value="bewerking">Bewerking</option>
              <option value="klaar">Klaar</option>
              <option value="gepubliceerd">Gepubliceerd</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="bg-black border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getCategoryIcon(idea.category)}
                <h3 className="text-xl font-semibold text-white">{idea.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                  {idea.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(idea.priority)}`}>
                  {idea.priority}
                </span>
              </div>
            </div>
            
            <p className="text-gray-400 mb-4">{idea.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPinIcon className="w-4 h-4" />
                <span>{idea.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ClockIcon className="w-4 h-4" />
                <span>{idea.estimatedDuration}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Kernboodschappen:</h4>
              <div className="flex flex-wrap gap-2">
                {idea.keyMessages.map((message, index) => (
                  <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                    {message}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Benodigde Props:</h4>
              <div className="flex flex-wrap gap-2">
                {idea.requiredProps.map((prop, index) => (
                  <span key={index} className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs">
                    {prop}
                  </span>
                ))}
              </div>
            </div>
            
            {idea.notes && (
              <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-1">Notities:</h4>
                <p className="text-sm text-gray-400">{idea.notes}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Toegewezen aan: {idea.assignedTo}</span>
                <span>Gemaakt: {idea.createdAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingIdea(idea)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingIdea) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingIdea ? 'Bewerk Video Idee' : 'Nieuw Video Idee'}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newIdea = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: formData.get('category') as VideoIdea['category'],
                priority: formData.get('priority') as VideoIdea['priority'],
                status: formData.get('status') as VideoIdea['status'],
                location: formData.get('location') as string,
                estimatedDuration: formData.get('estimatedDuration') as string,
                targetAudience: formData.get('targetAudience') as string,
                keyMessages: (formData.get('keyMessages') as string).split(',').map(s => s.trim()),
                requiredProps: (formData.get('requiredProps') as string).split(',').map(s => s.trim()),
                notes: formData.get('notes') as string,
                assignedTo: formData.get('assignedTo') as string,
              };
              
              if (editingIdea) {
                updateIdea({ ...editingIdea, ...newIdea });
              } else {
                addNewIdea(newIdea);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Titel</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingIdea?.title}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Categorie</label>
                  <select
                    name="category"
                    defaultValue={editingIdea?.category}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="promotie">Promotie</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="behind-the-scenes">Behind-the-Scenes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Prioriteit</label>
                  <select
                    name="priority"
                    defaultValue={editingIdea?.priority}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="hoog">Hoog</option>
                    <option value="medium">Medium</option>
                    <option value="laag">Laag</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={editingIdea?.status}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="concept">Concept</option>
                    <option value="in-opname">In Opname</option>
                    <option value="bewerking">Bewerking</option>
                    <option value="klaar">Klaar</option>
                    <option value="gepubliceerd">Gepubliceerd</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Locatie</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingIdea?.location}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Geschatte Duur</label>
                  <input
                    type="text"
                    name="estimatedDuration"
                    defaultValue={editingIdea?.estimatedDuration}
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Beschrijving</label>
                <textarea
                  name="description"
                  defaultValue={editingIdea?.description}
                  required
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Doelgroep</label>
                <input
                  type="text"
                  name="targetAudience"
                  defaultValue={editingIdea?.targetAudience}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Kernboodschappen (komma-gescheiden)</label>
                <input
                  type="text"
                  name="keyMessages"
                  defaultValue={editingIdea?.keyMessages.join(', ')}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Benodigde Props (komma-gescheiden)</label>
                <input
                  type="text"
                  name="requiredProps"
                  defaultValue={editingIdea?.requiredProps.join(', ')}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Notities</label>
                <textarea
                  name="notes"
                  defaultValue={editingIdea?.notes}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Toegewezen aan</label>
                <input
                  type="text"
                  name="assignedTo"
                  defaultValue={editingIdea?.assignedTo || 'Rick'}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingIdea(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingIdea ? 'Bijwerken' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 