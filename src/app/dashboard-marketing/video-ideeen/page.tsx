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
    title: 'Toptiermen Platform Introductie',
    description: 'Een korte, krachtige introductie van het Toptiermen platform - wat het is, voor wie het is, en wat de voordelen zijn.',
    category: 'promotie',
    priority: 'hoog',
    status: 'concept',
    location: 'Ibiza Beach',
    estimatedDuration: '2-3 minuten',
    targetAudience: 'Potentiële leden (25-45 jaar)',
    keyMessages: ['Exclusieve community', 'Persoonlijke groei', 'Top performers'],
    requiredProps: ['Laptop met platform demo', 'Toptiermen merchandise'],
    notes: 'Opname tijdens zonsondergang voor mooie sfeer. Focus op de exclusiviteit en community aspect.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '2',
    title: 'Dag in het Leven van een Toptiermen',
    description: 'Toon hoe een typische dag eruit ziet voor iemand die het Toptiermen platform gebruikt.',
    category: 'lifestyle',
    priority: 'hoog',
    status: 'concept',
    location: 'Ibiza Villa',
    estimatedDuration: '5-7 minuten',
    targetAudience: 'Lifestyle geïnteresseerden',
    keyMessages: ['Discipline', 'Routine', 'Balans', 'Succes'],
    requiredProps: ['Ochtend routine items', 'Workout equipment', 'Laptop'],
    notes: 'Begin met ochtend routine, toon workout, werk sessie, en eindig met reflectie. Authentiek en natuurlijk.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '3',
    title: 'Academy Module Preview',
    description: 'Een sneak peek van een van de academy modules om de kwaliteit en waarde te tonen.',
    category: 'tutorial',
    priority: 'medium',
    status: 'concept',
    location: 'Ibiza Studio',
    estimatedDuration: '3-4 minuten',
    targetAudience: 'Leren geïnteresseerden',
    keyMessages: ['Kwaliteit content', 'Praktische kennis', 'Expertise'],
    requiredProps: ['Laptop', 'Microfoon', 'Goede belichting'],
    notes: 'Kies de meest aansprekende module. Toon zowel theorie als praktische toepassing.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '4',
    title: 'Community Testimonial',
    description: 'Een interview-stijl video met een fictieve maar realistische testimonial van een succesvol lid.',
    category: 'testimonial',
    priority: 'medium',
    status: 'concept',
    location: 'Ibiza Sunset Point',
    estimatedDuration: '4-5 minuten',
    targetAudience: 'Social proof zoekers',
    keyMessages: ['Transformatie', 'Resultaten', 'Community support'],
    requiredProps: ['Interview setup', 'Backdrop met Ibiza uitzicht'],
    notes: 'Script voorbereiden met specifieke resultaten en verhalen. Authentiek en geloofwaardig.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '5',
    title: 'Behind-the-Scenes: Platform Ontwikkeling',
    description: 'Een kijkje achter de schermen van hoe het platform wordt ontwikkeld en onderhouden.',
    category: 'behind-the-scenes',
    priority: 'laag',
    status: 'concept',
    location: 'Ibiza Workspace',
    estimatedDuration: '6-8 minuten',
    targetAudience: 'Tech geïnteresseerden',
    keyMessages: ['Innovatie', 'Kwaliteit', 'Toewijding'],
    requiredProps: ['Development setup', 'Code screenshots', 'Team shots'],
    notes: 'Toon de technische kant maar houd het toegankelijk. Focus op de passie en expertise.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '6',
    title: 'Quick Tips: Discipline in 60 Seconden',
    description: 'Een snelle, krachtige tip over discipline die direct toepasbaar is.',
    category: 'tutorial',
    priority: 'medium',
    status: 'concept',
    location: 'Ibiza Rooftop',
    estimatedDuration: '1 minuut',
    targetAudience: 'Social media volgers',
    keyMessages: ['Snelle winst', 'Praktisch', 'Direct toepasbaar'],
    requiredProps: ['Timer', 'Eenvoudige props'],
    notes: 'Perfect voor social media. Korte, krachtige boodschap die mensen willen delen.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '7',
    title: 'Ibiza Lifestyle Meets Toptiermen',
    description: 'Combineer de Ibiza lifestyle met Toptiermen waarden - balans tussen werk en plezier.',
    category: 'lifestyle',
    priority: 'hoog',
    status: 'concept',
    location: 'Verschillende Ibiza locaties',
    estimatedDuration: '8-10 minuten',
    targetAudience: 'Lifestyle aspiranten',
    keyMessages: ['Balans', 'Luxury lifestyle', 'Succes', 'Genieten'],
    requiredProps: ['Verschillende outfits', 'Luxury locaties', 'Transport'],
    notes: 'Toon hoe succesvolle mensen leven en werken. Authentiek maar aspirational.',
    createdAt: '2024-12-19',
    assignedTo: 'Rick'
  },
  {
    id: '8',
    title: 'FAQ Video: Veelgestelde Vragen',
    description: 'Beantwoord de meest voorkomende vragen over Toptiermen in een natuurlijke setting.',
    category: 'promotie',
    priority: 'medium',
    status: 'concept',
    location: 'Ibiza Beach Club',
    estimatedDuration: '5-6 minuten',
    targetAudience: 'Geïnteresseerden met vragen',
    keyMessages: ['Transparantie', 'Klariteit', 'Vertrouwen'],
    requiredProps: ['FAQ lijst', 'Relaxed setting'],
    notes: 'Natuurlijke conversatie stijl. Beantwoord echte vragen die mensen hebben.',
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