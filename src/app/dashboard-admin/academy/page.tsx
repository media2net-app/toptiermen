'use client';
import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
  TrashIcon,
  AcademicCapIcon,
  BookOpenIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  XMarkIcon,
  ArrowLeftIcon,
  Bars3Icon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  CloudArrowUpIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Enhanced mock data with all required fields
const mockModules = [
  {
    id: 1,
    title: 'Discipline & Identiteit',
    description: 'Bouw een onwrikbare discipline en ontdek je ware identiteit',
    shortDescription: 'De basis van persoonlijke groei',
    coverImage: '/images/mind/1.png',
    lessons: 8,
    totalDuration: '2u 45m',
    enrolledStudents: 1247,
    completionRate: 78,
    status: 'published',
    unlockRequirement: null,
    order: 1
  },
  {
    id: 2,
    title: 'Fysieke Dominantie',
    description: 'Transformeer je lichaam en word fysiek dominant',
    shortDescription: 'Fysieke transformatie en kracht',
    coverImage: '/images/mind/2.png',
    lessons: 12,
    totalDuration: '4u 20m',
    enrolledStudents: 892,
    completionRate: 65,
    status: 'published',
    unlockRequirement: 1, // Requires completion of module 1
    order: 2
  },
  {
    id: 3,
    title: 'Mentale Kracht',
    description: 'Ontwikkel een ijzersterke mindset en mentale weerbaarheid',
    shortDescription: 'Mindset en mentale weerbaarheid',
    coverImage: '/images/mind/3.png',
    lessons: 6,
    totalDuration: '1u 55m',
    enrolledStudents: 1103,
    completionRate: 82,
    status: 'draft',
    unlockRequirement: 2, // Requires completion of module 2
    order: 3
  }
];

const mockLessons = [
  {
    id: 1,
    title: 'De Basis van Discipline',
    moduleId: 1,
    duration: '25m',
    type: 'video',
    status: 'published',
    order: 1,
    views: 1247,
    completionRate: 89,
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    content: '',
    attachments: [],
    examQuestions: []
  },
  {
    id: 2,
    title: 'Je Identiteit Definiëren',
    moduleId: 1,
    duration: '30m',
    type: 'text',
    status: 'published',
    order: 2,
    views: 1102,
    completionRate: 76,
    videoUrl: '',
    content: 'Dit is een uitgebreide tekst over het definiëren van je identiteit...',
    attachments: [
      { name: 'Identiteit Werkblad.pdf', url: '/attachments/identiteit-werkblad.pdf' }
    ],
    examQuestions: []
  },
  {
    id: 3,
    title: 'Dagelijkse Routines',
    moduleId: 1,
    duration: '20m',
    type: 'exam',
    status: 'published',
    order: 3,
    views: 987,
    completionRate: 71,
    videoUrl: '',
    content: '',
    attachments: [],
    examQuestions: [
      {
        question: 'Wat is de eerste stap in het opbouwen van discipline?',
        type: 'multiple_choice',
        options: ['Doelen stellen', 'Direct beginnen', 'Plannen maken', 'Motivatie zoeken'],
        correctAnswer: 1
      },
      {
        question: 'Hoeveel tijd moet je minimaal besteden aan je ochtendroutine?',
        type: 'text',
        options: [],
        correctAnswer: null
      }
    ]
  }
];

export default function AcademyManagement() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    coverImage: '',
    status: 'draft',
    unlockRequirement: '' as string | null
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    videoUrl: '',
    content: '',
    status: 'draft',
    attachments: [] as any[],
    examQuestions: [] as any[]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400';
      case 'draft': return 'text-yellow-400';
      case 'archived': return 'text-red-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Gepubliceerd';
      case 'draft': return 'Concept';
      case 'archived': return 'Gearchiveerd';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return VideoCameraIcon;
      case 'text': return DocumentTextIcon;
      case 'exam': return QuestionMarkCircleIcon;
      default: return DocumentTextIcon;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return 'Video';
      case 'text': return 'Tekst/Artikel';
      case 'exam': return 'Examen/Reflectie';
      default: return type;
    }
  };

  const selectedModuleData = mockModules.find(m => m.id === selectedModule);
  const moduleLessons = mockLessons.filter(l => l.moduleId === selectedModule).sort((a, b) => a.order - b.order);

  // Module Modal Functions
  const openModuleModal = (module?: any) => {
    if (module) {
      setEditingModule(module.id);
      setModuleForm({
        title: module.title,
        description: module.description,
        shortDescription: module.shortDescription,
        coverImage: module.coverImage,
        status: module.status,
        unlockRequirement: module.unlockRequirement
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        description: '',
        shortDescription: '',
        coverImage: '',
        status: 'draft',
        unlockRequirement: '' as string | null
      });
    }
    setShowModuleModal(true);
  };

  const handleModuleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (editingModule) {
        toast.success(`Module "${moduleForm.title}" succesvol bijgewerkt`, {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.success(`Module "${moduleForm.title}" succesvol aangemaakt`, {
          position: "top-right",
          autoClose: 3000
        });
      }
      
      setShowModuleModal(false);
      setEditingModule(null);
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het opslaan', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lesson Modal Functions
  const openLessonModal = (lesson?: any) => {
    if (lesson) {
      setEditingLesson(lesson.id);
      setLessonForm({
        title: lesson.title,
        type: lesson.type,
        videoUrl: lesson.videoUrl,
        content: lesson.content,
        status: lesson.status,
        attachments: lesson.attachments,
        examQuestions: lesson.examQuestions
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        type: 'video',
        videoUrl: '',
        content: '',
        status: 'draft',
        attachments: [],
        examQuestions: []
      });
    }
    setShowLessonModal(true);
  };

  const handleLessonSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (editingLesson) {
        toast.success(`Les "${lessonForm.title}" succesvol bijgewerkt`, {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.success(`Les "${lessonForm.title}" succesvol aangemaakt`, {
          position: "top-right",
          autoClose: 3000
        });
      }
      
      setShowLessonModal(false);
      setEditingLesson(null);
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het opslaan', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== dropIndex) {
      // Reorder lessons logic would go here
      toast.success('Volgorde van lessen bijgewerkt', {
        position: "top-right",
        autoClose: 2000
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Academy Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle Academy modules en lessen</p>
        </div>
        <button
          onClick={() => openModuleModal()}
          className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nieuwe Module
        </button>
      </div>

      {/* Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockModules.map((module) => (
          <div 
            key={module.id}
            className={`bg-[#232D1A] rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
              selectedModule === module.id 
                ? 'border-[#8BAE5A] shadow-lg' 
                : 'border-[#3A4D23] hover:border-[#8BAE5A]'
            }`}
            onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(module.status)} bg-[#181F17]`}>
                {getStatusText(module.status)}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-[#8BAE5A] mb-2">{module.title}</h3>
            <p className="text-[#B6C948] text-sm mb-4">{module.shortDescription}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#B6C948] text-sm">Lessen</span>
                <span className="text-[#8BAE5A] font-semibold">{module.lessons}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B6C948] text-sm">Duur</span>
                <span className="text-[#8BAE5A] font-semibold">{module.totalDuration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B6C948] text-sm">Studenten</span>
                <span className="text-[#8BAE5A] font-semibold">{module.enrolledStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B6C948] text-sm">Voltooiing</span>
                <span className="text-[#8BAE5A] font-semibold">{module.completionRate}%</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button 
                className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  openModuleModal(module);
                }}
              >
                <PencilIcon className="w-4 h-4" />
                Bewerk
              </button>
              <button 
                className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule(module.id);
                }}
              >
                <EyeIcon className="w-4 h-4" />
                Bekijk Lessen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Module Details */}
      {selectedModule && selectedModuleData && (
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 rounded-xl bg-[#181F17] text-[#8BAE5A] hover:bg-[#3A4D23] transition"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-[#8BAE5A]">Lessen voor Module: {selectedModuleData.title}</h2>
                <p className="text-[#B6C948] mt-1">{selectedModuleData.description}</p>
              </div>
            </div>
            <button
              onClick={() => openLessonModal()}
              className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nieuwe Les Toevoegen
            </button>
          </div>

          {/* Lessons List with Drag & Drop */}
          <div className="space-y-3">
            {moduleLessons.map((lesson, index) => {
              const TypeIcon = getTypeIcon(lesson.type);
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index;
              
              return (
                <div
                  key={lesson.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-[#181F17] rounded-xl p-4 border-2 transition-all duration-200 ${
                    isDragging 
                      ? 'border-[#8BAE5A] opacity-50' 
                      : isDragOver 
                        ? 'border-[#B6C948] bg-[#232D1A]' 
                        : 'border-[#3A4D23] hover:border-[#8BAE5A]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-move p-2 text-[#B6C948] hover:text-[#8BAE5A] transition">
                      <Bars3Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Lesson Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-[#8BAE5A]/20">
                          <TypeIcon className="w-4 h-4 text-[#8BAE5A]" />
                        </div>
                        <div>
                          <span className="text-[#8BAE5A] font-semibold text-sm">Les {lesson.order}</span>
                          <h3 className="text-[#8BAE5A] font-medium">{lesson.title}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-[#B6C948] capitalize">{getTypeText(lesson.type)}</span>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-[#B6C948]" />
                          <span className="text-[#B6C948]">{lesson.duration}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lesson.status)} bg-[#232D1A]`}>
                          {getStatusText(lesson.status)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openLessonModal(lesson)}
                        className="p-2 rounded-xl hover:bg-[#232D1A] transition-colors duration-200"
                        title="Bewerk les"
                      >
                        <PencilIcon className="w-4 h-4 text-[#B6C948]" />
                      </button>
                      <button 
                        className="p-2 rounded-xl hover:bg-[#232D1A] transition-colors duration-200"
                        title="Bekijk les"
                      >
                        <EyeIcon className="w-4 h-4 text-[#B6C948]" />
                      </button>
                      <button 
                        className="p-2 rounded-xl hover:bg-[#232D1A] transition-colors duration-200"
                        title="Verwijder les"
                      >
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <AcademicCapIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockModules.length}</h3>
              <p className="text-[#B6C948] text-sm">Modules</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <BookOpenIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">{mockLessons.length}</h3>
              <p className="text-[#B6C948] text-sm">Lessen</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <UsersIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">3,242</h3>
              <p className="text-[#B6C948] text-sm">Studenten</p>
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
              <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#8BAE5A]">75%</h3>
              <p className="text-[#B6C948] text-sm">Gem. Voltooiing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                {editingModule ? 'Module Bewerken' : 'Nieuwe Module Toevoegen'}
              </h2>
              <button
                onClick={() => setShowModuleModal(false)}
                className="p-2 rounded-xl hover:bg-[#181F17] transition"
              >
                <XMarkIcon className="w-6 h-6 text-[#B6C948]" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Module Title */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Module Titel</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                  placeholder="bijv. Discipline & Identiteit"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Korte Omschrijving</label>
                <input
                  type="text"
                  value={moduleForm.shortDescription}
                  onChange={(e) => setModuleForm({...moduleForm, shortDescription: e.target.value})}
                  placeholder="De subtitel die gebruikers zien"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Volledige Beschrijving</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                  placeholder="Uitgebreide beschrijving van de module"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948] resize-none"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Cover Afbeelding</label>
                <div className="flex items-center gap-4">
                  {moduleForm.coverImage && (
                    <img 
                      src={moduleForm.coverImage} 
                      alt="Cover" 
                      className="w-20 h-20 rounded-xl object-cover border border-[#3A4D23]"
                    />
                  )}
                  <button className="px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center gap-2">
                    <PhotoIcon className="w-5 h-5" />
                    {moduleForm.coverImage ? 'Afbeelding Wijzigen' : 'Afbeelding Uploaden'}
                  </button>
                </div>
              </div>

              {/* Publication Status */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Publicatiestatus</label>
                <select
                  value={moduleForm.status}
                  onChange={(e) => setModuleForm({...moduleForm, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="draft">Concept (niet zichtbaar voor gebruikers)</option>
                  <option value="published">Gepubliceerd</option>
                </select>
              </div>

              {/* Unlock Requirement */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Ontgrendel-voorwaarde (Geavanceerd)</label>
                <select
                  value={moduleForm.unlockRequirement ?? ''}
                  onChange={(e) => setModuleForm({...moduleForm, unlockRequirement: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="">Geen voorwaarde (direct beschikbaar)</option>
                  {mockModules.filter(m => m.id !== editingModule).map(module => (
                    <option key={module.id} value={String(module.id)}>
                      Deze module wordt ontgrendeld na het voltooien van: {module.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => setShowModuleModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleModuleSave}
                  disabled={isLoading || !moduleForm.title}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                      Opslaan...
                    </>
                  ) : (
                    'Opslaan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#3A4D23]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                {editingLesson ? 'Les Bewerken' : 'Nieuwe Les Toevoegen'}
              </h2>
              <button
                onClick={() => setShowLessonModal(false)}
                className="p-2 rounded-xl hover:bg-[#181F17] transition"
              >
                <XMarkIcon className="w-6 h-6 text-[#B6C948]" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Lesson Title */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Les Titel</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                  placeholder="bijv. Het Fundament van Zelfdiscipline"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>

              {/* Lesson Type */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Les Type</label>
                <select
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm({...lessonForm, type: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="video">Video</option>
                  <option value="text">Tekst/Artikel</option>
                  <option value="exam">Examen/Reflectie</option>
                </select>
              </div>

              {/* Video URL - Only show for video type */}
              {lessonForm.type === 'video' && (
                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">Video URL</label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                  />
                </div>
              )}

              {/* Lesson Content - Only show for text type */}
              {lessonForm.type === 'text' && (
                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">Lesinhoud</label>
                  <textarea
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                    placeholder="Schrijf hier de inhoud van de les..."
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948] resize-none"
                  />
                </div>
              )}

              {/* Attachments */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Hulpmiddelen & Downloads</label>
                <div className="space-y-3">
                  {lessonForm.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#181F17] rounded-xl">
                      <DocumentTextIcon className="w-5 h-5 text-[#B6C948]" />
                      <span className="text-[#8BAE5A] flex-1">{attachment.name}</span>
                      <button 
                        onClick={() => setLessonForm({
                          ...lessonForm, 
                          attachments: lessonForm.attachments.filter((_, i) => i !== index)
                        })}
                        className="p-1 rounded hover:bg-[#232D1A] transition"
                      >
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                  <button className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2">
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Bestand Toevoegen (PDF, werkbladen, etc.)
                  </button>
                </div>
              </div>

              {/* Exam Questions - Only show for exam type */}
              {lessonForm.type === 'exam' && (
                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">Examen/Reflectie Vragen</label>
                  <div className="space-y-4">
                    {lessonForm.examQuestions.map((question, index) => (
                      <div key={index} className="p-4 bg-[#181F17] rounded-xl border border-[#3A4D23]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[#8BAE5A] font-semibold">Vraag {index + 1}</span>
                          <button 
                            onClick={() => setLessonForm({
                              ...lessonForm, 
                              examQuestions: lessonForm.examQuestions.filter((_, i) => i !== index)
                            })}
                            className="p-1 rounded hover:bg-[#232D1A] transition"
                          >
                            <TrashIcon className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => {
                            const newQuestions = [...lessonForm.examQuestions];
                            newQuestions[index].question = e.target.value;
                            setLessonForm({...lessonForm, examQuestions: newQuestions});
                          }}
                          placeholder="Stel hier je vraag..."
                          className="w-full px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948] mb-3"
                        />
                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  checked={question.correctAnswer === optionIndex}
                                  onChange={() => {
                                    const newQuestions = [...lessonForm.examQuestions];
                                    newQuestions[index].correctAnswer = optionIndex;
                                    setLessonForm({...lessonForm, examQuestions: newQuestions});
                                  }}
                                  className="text-[#8BAE5A]"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newQuestions = [...lessonForm.examQuestions];
                                    newQuestions[index].options[optionIndex] = e.target.value;
                                    setLessonForm({...lessonForm, examQuestions: newQuestions});
                                  }}
                                  placeholder={`Optie ${optionIndex + 1}`}
                                  className="flex-1 px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => setLessonForm({
                        ...lessonForm, 
                        examQuestions: [...lessonForm.examQuestions, {
                          question: '',
                          type: 'multiple_choice',
                          options: ['', '', '', ''],
                          correctAnswer: 0
                        }]
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Vraag Toevoegen
                    </button>
                  </div>
                </div>
              )}

              {/* Publication Status */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Publicatiestatus</label>
                <select
                  value={lessonForm.status}
                  onChange={(e) => setLessonForm({...lessonForm, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="draft">Concept</option>
                  <option value="published">Gepubliceerd</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleLessonSave}
                  disabled={isLoading || !lessonForm.title}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin"></div>
                      Opslaan...
                    </>
                  ) : (
                    'Opslaan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 