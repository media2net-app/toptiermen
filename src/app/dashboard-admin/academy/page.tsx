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
  ChevronDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useDebug } from '@/contexts/DebugContext';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import dynamic from 'next/dynamic';
import VideoUpload from '@/components/VideoUpload';
import AcademyVideoUpload from '@/components/AcademyVideoUpload';
import PDFUpload from '@/components/PDFUpload';
import ImageUpload from '@/components/ImageUpload';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function AcademyManagement() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const { showDebug } = useDebug();
  const { user } = useSupabaseAuth();

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    coverImage: '',
    status: 'published',
    unlockRequirement: '' as string | null,
    positie: 1 as number
  });

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'video',
    videoUrl: '',
    content: '',
    status: 'published',
    attachments: [] as any[],
    examQuestions: [] as any[],
    duration: '',
    worksheetUrl: '' as string | null
  });

  const [moduleCompletion, setModuleCompletion] = useState<{ [moduleId: string]: number }>({});
  const [lessonCompletion, setLessonCompletion] = useState<{ [lessonId: string]: number }>({});
  const [studentCount, setStudentCount] = useState(0);
  const [avgCompletion, setAvgCompletion] = useState(0);

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

  const selectedModuleData = modules.find(m => m.id === selectedModule);
  const moduleLessons = lessons.filter(l => l.module_id === selectedModule).sort((a, b) => a.order_index - b.order_index);

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from('academy_modules')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) {
      toast.error('Fout bij ophalen modules: ' + error.message);
    } else {
      setModules(data || []);
    }
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('academy_lessons')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) {
      toast.error('Fout bij ophalen lessen: ' + error.message);
    } else {
      setLessons(data || []);
    }
  };

  useEffect(() => {
    fetchModules();
    fetchLessons();
  }, []);

  // Ensure lessonForm arrays are always initialized
  useEffect(() => {
    if (showLessonModal && (!lessonForm.attachments || !lessonForm.examQuestions)) {
      setLessonForm(prev => ({
        ...prev,
        attachments: prev.attachments || [],
        examQuestions: prev.examQuestions || []
      }));
    }
  }, [showLessonModal, lessonForm.attachments, lessonForm.examQuestions]);

  // Haal live completion rates op
  useEffect(() => {
    async function fetchCompletionRates() {
      // MODULE completion
      const { data: moduleProgress } = await supabase
        .from('user_module_progress')
        .select('module_id, completed, user_id');
      if (moduleProgress) {
        const grouped = moduleProgress.reduce((acc, row) => {
          if (!acc[row.module_id]) acc[row.module_id] = { total: 0, completed: 0, users: new Set() };
          acc[row.module_id].users.add(row.user_id);
          acc[row.module_id].total++;
          if (row.completed) acc[row.module_id].completed++;
          return acc;
        }, {} as any);
        const rates: { [moduleId: string]: number } = {};
        Object.entries(grouped).forEach(([moduleId, obj]: any) => {
          rates[moduleId] = obj.total > 0 ? Math.round((obj.completed / obj.total) * 1000) / 10 : 0;
        });
        setModuleCompletion(rates);
      }
      // LESSON completion
      const { data: lessonProgress } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed, user_id');
      if (lessonProgress) {
        const grouped = lessonProgress.reduce((acc, row) => {
          if (!acc[row.lesson_id]) acc[row.lesson_id] = { total: 0, completed: 0, users: new Set() };
          acc[row.lesson_id].users.add(row.user_id);
          acc[row.lesson_id].total++;
          if (row.completed) acc[row.lesson_id].completed++;
          return acc;
        }, {} as any);
        const rates: { [lessonId: string]: number } = {};
        Object.entries(grouped).forEach(([lessonId, obj]: any) => {
          rates[lessonId] = obj.total > 0 ? Math.round((obj.completed / obj.total) * 1000) / 10 : 0;
        });
        setLessonCompletion(rates);
      }
    }
    fetchCompletionRates();
  }, [modules, lessons]);

  useEffect(() => {
    async function fetchStats() {
      // Haal unieke studenten op
      const { data: moduleProgress, error: studentError } = await supabase
        .from('user_module_progress')
        .select('user_id', { count: 'exact' });
      if (!studentError && moduleProgress) {
        // Unieke user_id's tellen
        const uniqueUsers = Array.from(new Set(moduleProgress.map((row: any) => row.user_id)));
        setStudentCount(uniqueUsers.length);
      }

      // Bereken gemiddelde voltooiing
      const completionValues = Object.values(moduleCompletion);
      const avg = completionValues.length
        ? Math.round(completionValues.reduce((a, b) => a + b, 0) / completionValues.length)
        : 0;
      setAvgCompletion(avg);
    }
    fetchStats();
  }, [moduleCompletion]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchModules();
        fetchLessons();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Helper om het eerstvolgende vrije positie-nummer te bepalen
  function getNextModulePositie() {
    const posities = modules.map(m => Number(m.positie)).filter(n => !isNaN(n));
    let n = 1;
    while (posities.includes(n)) n++;
    return n;
  }

  // Module Modal Functions
  const openModuleModal = (module?: any) => {
    if (module) {
      setEditingModule(module.id);
      setModuleForm({
        title: module.title,
        description: module.description,
        shortDescription: module.short_description || '',
        coverImage: module.cover_image || '',
        status: module.status,
        unlockRequirement: module.unlock_requirement || '',
        positie: module.positie ?? getNextModulePositie()
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        description: '',
        shortDescription: '',
        coverImage: '',
        status: 'published',
        unlockRequirement: '',
        positie: getNextModulePositie()
      });
    }
    setShowModuleModal(true);
  };

  // Functie om de module-modal te sluiten en de form te resetten
  const closeModuleModal = () => {
    setShowModuleModal(false);
    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      shortDescription: '',
      coverImage: '',
      status: 'published',
      unlockRequirement: '',
      positie: 1
    });
  };

  const handleModuleSave = async () => {
    setIsLoading(true);
    try {
      if (editingModule) {
        // Update bestaande module
        const { error } = await supabase
          .from('academy_modules')
          .update({
            title: moduleForm.title,
            description: moduleForm.description,
            short_description: moduleForm.shortDescription,
            cover_image: moduleForm.coverImage,
            status: moduleForm.status,
            updated_at: new Date().toISOString(),
            positie: moduleForm.positie !== 0 ? Number(moduleForm.positie) : null
          })
          .eq('id', editingModule);
        if (error) throw error;
        
        toast.success(`Module "${moduleForm.title}" succesvol bijgewerkt`);
      } else {
        // Nieuwe module aanmaken
        const { data, error } = await supabase
          .from('academy_modules')
          .insert({
            title: moduleForm.title,
            description: moduleForm.description,
            short_description: moduleForm.shortDescription,
            cover_image: moduleForm.coverImage,
            status: moduleForm.status,
            positie: moduleForm.positie !== 0 ? Number(moduleForm.positie) : null
          })
          .select()
          .single();
        if (error) throw error;
        
        toast.success(`Module "${moduleForm.title}" succesvol aangemaakt`);
      }
      await fetchModules();
      closeModuleModal();
    } catch (error: any) {
      toast.error('Fout bij opslaan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Module verwijderen
  const handleModuleDelete = async (id: string) => {
    if (!window.confirm('Weet je zeker dat je deze module wilt verwijderen?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('academy_modules')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      toast.success('Module succesvol verwijderd');
      await fetchModules();
    } catch (error: any) {
      toast.error('Fout bij verwijderen: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Lesson Modal Functions
  const openLessonModal = (lesson?: any) => {
    if (lesson) {
      setEditingLesson(lesson.id);
      setLessonForm({
        title: lesson.title || '',
        type: lesson.type || 'video',
        videoUrl: lesson.video_url || '',
        content: lesson.content || '',
        status: lesson.status || 'published',
        attachments: lesson.attachments || [],
        examQuestions: lesson.exam_questions || [],
        duration: lesson.duration || '',
        worksheetUrl: lesson.worksheet_url || null
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        type: 'video',
        videoUrl: '',
        content: '',
        status: 'published',
        attachments: [],
        examQuestions: [],
        duration: '',
        worksheetUrl: null
      });
    }
    setShowLessonModal(true);
  };

  const handleLessonSave = async () => {
    setIsLoading(true);
    try {
      if (editingLesson) {
        // Update bestaande les
        const { error } = await supabase
          .from('academy_lessons')
          .update({
            title: lessonForm.title,
            type: lessonForm.type,
            video_url: lessonForm.videoUrl,
            content: lessonForm.content,
            status: lessonForm.status,
            attachments: lessonForm.attachments,
            exam_questions: lessonForm.examQuestions,
            duration: lessonForm.duration,
            worksheet_url: lessonForm.worksheetUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLesson);
        if (error) throw error;
        
        toast.success(`Les "${lessonForm.title}" succesvol bijgewerkt`);
      } else {
        // Nieuwe les aanmaken
        const { data, error } = await supabase
          .from('academy_lessons')
          .insert({
            title: lessonForm.title,
            type: lessonForm.type,
            video_url: lessonForm.videoUrl,
            content: lessonForm.content,
            status: lessonForm.status,
            attachments: lessonForm.attachments,
            exam_questions: lessonForm.examQuestions,
            duration: lessonForm.duration,
            worksheet_url: lessonForm.worksheetUrl,
            module_id: selectedModule,
          })
          .select()
          .single();
        if (error) throw error;
        
        toast.success(`Les "${lessonForm.title}" succesvol aangemaakt`);
      }
      await fetchLessons();
      closeLessonModal();
    } catch (error: any) {
      toast.error('Fout bij opslaan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Functie om de les-modal te sluiten en de form te resetten
  const closeLessonModal = () => {
    setShowLessonModal(false);
    setEditingLesson(null);
    setLessonForm({
      title: '',
      type: 'video',
      videoUrl: '',
      content: '',
      status: 'published',
      attachments: [],
      examQuestions: [],
      duration: '',
      worksheetUrl: null
    });
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
        duration: 2000
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Les verwijderen
  const handleLessonDelete = async (id: string) => {
    if (!window.confirm('Weet je zeker dat je deze les wilt verwijderen?')) return;
    setIsLoading(true);
    try {
      // Haal les info op voor logging
      const lessonToDelete = lessons.find(l => l.id === id);
      
      const { error } = await supabase
        .from('academy_lessons')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      toast.success('Les succesvol verwijderd');
      await fetchLessons();
    } catch (error: any) {
      toast.error('Fout bij verwijderen: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalModuleDuration = () => {
    // Som van alle durations van lessen in deze module
    const moduleLessons = lessons.filter(l => l.module_id === selectedModule);
    // Parseer alle durations naar minuten en tel op
    let totalMinutes = 0;
    for (const lesson of moduleLessons) {
      if (lesson.duration) {
        // Ondersteun formaten als '10m', '1u 15m', '45m', '2u'
        const match = lesson.duration.match(/(?:(\d+)u)?\s*(\d+)?m?/);
        if (match) {
          const uren = parseInt(match[1] || '0', 10);
          const minuten = parseInt(match[2] || '0', 10);
          totalMinutes += uren * 60 + minuten;
        }
      }
    }
    // Format naar 'X u Ym' of 'Xm'
    if (totalMinutes >= 60) {
      const uren = Math.floor(totalMinutes / 60);
      const minuten = totalMinutes % 60;
      return minuten > 0 ? `${uren}u ${minuten}m` : `${uren}u`;
    } else {
      return `${totalMinutes}m`;
    }
  };

  const getTotalModuleDurationForModule = (moduleId: string) => {
    const moduleLessons = lessons.filter(l => l.module_id === moduleId);
    let totalMinutes = 0;
    for (const lesson of moduleLessons) {
      if (lesson.duration) {
        const match = lesson.duration.match(/(?:(\d+)u)?\s*(\d+)?m?/);
        if (match) {
          const uren = parseInt(match[1] || '0', 10);
          const minuten = parseInt(match[2] || '0', 10);
          totalMinutes += uren * 60 + minuten;
        }
      }
    }
    if (totalMinutes >= 60) {
      const uren = Math.floor(totalMinutes / 60);
      const minuten = totalMinutes % 60;
      return minuten > 0 ? `${uren}u ${minuten}m` : `${uren}u`;
    } else {
      return `${totalMinutes}m`;
    }
  };

  const getAverageCompletionRate = () => {
    if (!modules.length) return 0;
    const validRates = modules.map(m => typeof m.completion_rate === 'number' ? m.completion_rate : 0);
    const sum = validRates.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / modules.length);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Academy Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle Academy modules en lessen</p>
        </div>
        <AdminButton
          onClick={() => openModuleModal()}
          variant="primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nieuwe Module
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          icon={<AcademicCapIcon className="w-6 h-6" />}
          value={modules.length}
          title="Modules"
          color="blue"
        />
        <AdminStatsCard
          icon={<BookOpenIcon className="w-6 h-6" />}
          value={lessons.length}
          title="Lessen"
          color="green"
        />
        <AdminStatsCard
          icon={<UsersIcon className="w-6 h-6" />}
          value={studentCount.toLocaleString()}
          title="Studenten"
          color="purple"
        />
        <AdminStatsCard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          value={`${avgCompletion}%`}
          title="Gem. Voltooiing"
          color="orange"
        />
      </div>

      {/* Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <AdminCard key={module.id}>
            <div 
              className={`transition-all duration-300 cursor-pointer ${
                selectedModule === module.id 
                  ? 'border-[#8BAE5A] shadow-lg' 
                  : 'hover:border-[#8BAE5A]'
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
                <AdminButton
                  onClick={() => { handleModuleDelete(module.id); }}
                  variant="danger"
                  size="sm"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Verwijder
                </AdminButton>
              </div>
              
              <h3 className="text-xl font-bold text-[#8BAE5A] mb-2">{module.title}</h3>
              <p className="text-[#B6C948] text-sm mb-4">{module.shortDescription}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#B6C948] text-sm">Lessen</span>
                  <span className="text-[#8BAE5A] font-semibold">{(lessons.filter(l => l.module_id === module.id).length) || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B6C948] text-sm">Duur</span>
                  <span className="text-[#8BAE5A] font-semibold">{getTotalModuleDurationForModule(module.id) || '0m'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B6C948] text-sm">Studenten</span>
                  <span className="text-[#8BAE5A] font-semibold">{module.students_count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B6C948] text-sm">Voltooiing</span>
                  <span className="text-[#8BAE5A] font-semibold">{moduleCompletion[module.id] != null ? `${moduleCompletion[module.id]}%` : '0%'}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <AdminButton 
                  onClick={() => {
                    openModuleModal(module);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Bewerk
                </AdminButton>
                <AdminButton 
                  onClick={() => {
                    setSelectedModule(module.id);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Bekijk Lessen
                </AdminButton>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Selected Module Details */}
      {selectedModule && selectedModuleData && (
        <AdminCard>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <AdminButton
                onClick={() => setSelectedModule(null)}
                variant="secondary"
                size="sm"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Terug
              </AdminButton>
              <div>
                <h2 className="text-2xl font-bold text-[#8BAE5A]">Lessen voor Module: {selectedModuleData.title}</h2>
                <p className="text-[#B6C948] mt-1">{selectedModuleData.description}</p>
              </div>
            </div>
            <AdminButton
              onClick={() => openLessonModal()}
              variant="primary"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nieuwe Les Toevoegen
            </AdminButton>
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
                          <span className="text-[#8BAE5A] font-semibold text-sm">Les {lesson.order_index}</span>
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
                      <AdminButton 
                        onClick={() => openLessonModal(lesson)}
                        variant="secondary"
                        size="sm"
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Bewerk
                      </AdminButton>
                      <AdminButton 
                        onClick={() => handleLessonDelete(lesson.id)}
                        variant="danger"
                        size="sm"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Verwijder
                      </AdminButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}

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
                <ImageUpload
                  currentImageUrl={moduleForm.coverImage}
                  onImageUploaded={(url) => setModuleForm({...moduleForm, coverImage: url || ''})}
                  bucketName="module-covers"
                  folder="covers"
                  maxSize={50} // Updated from 5 to 50MB
                />
              </div>

              {/* Publication Status */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Publicatiestatus</label>
                <select
                  value={moduleForm.status}
                  onChange={(e) => setModuleForm({...moduleForm, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="published">Gepubliceerd</option>
                  <option value="draft">Concept (niet zichtbaar voor gebruikers)</option>
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
                  {modules.filter(m => m.id !== editingModule).map(module => (
                    <option key={module.id} value={String(module.id)}>
                      Deze module wordt ontgrendeld na het voltooien van: {module.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Module Positie */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Module Positie (volgorde)</label>
                <input
                  type="number"
                  min="1"
                  value={moduleForm.positie}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (!isNaN(val) && val > 0) setModuleForm({ ...moduleForm, positie: val });
                  }}
                  placeholder="bijv. 1 voor eerste module"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <AdminButton
                  onClick={() => setShowModuleModal(false)}
                  variant="secondary"
                >
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Annuleren
                </AdminButton>
                <AdminButton
                  onClick={handleModuleSave}
                  disabled={isLoading || !moduleForm.title}
                  variant="primary"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin mr-2"></div>
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Opslaan
                    </>
                  )}
                </AdminButton>
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
                onClick={closeLessonModal}
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
                  <label className="block text-[#8BAE5A] font-semibold mb-2">Academy Video</label>
                  <AcademyVideoUpload
                    currentVideoUrl={lessonForm.videoUrl}
                    onVideoUploaded={(url) => setLessonForm({...lessonForm, videoUrl: url})}
                    moduleId={selectedModule?.toString()}
                    lessonId={editingLesson?.toString()}
                  />
                </div>
              )}

              {/* Lesson Content - Only show for text type */}
              {lessonForm.type === 'text' && (
                <div>
                  <label className="block text-[#8BAE5A] font-semibold mb-2">Lesinhoud</label>
                  <div className="bg-[#181F17] rounded-xl border border-[#3A4D23]">
                    <ReactQuill
                      theme="snow"
                      value={lessonForm.content}
                      onChange={val => setLessonForm({...lessonForm, content: val})}
                      className="text-[#8BAE5A]"
                      style={{ minHeight: 200, color: '#8BAE5A' }}
                    />
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Werkblad (PDF)</label>
                <PDFUpload
                  currentPDFUrl={lessonForm.worksheetUrl || undefined}
                  onPDFUploaded={(url: string | null) => setLessonForm({...lessonForm, worksheetUrl: url})}
                />
              </div>

              {/* Les Duur */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Duur (bijv. 10m, 1u 15m) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({...lessonForm, duration: e.target.value})}
                  placeholder="bijv. 10m, 1u 15m"
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
                  required
                />
              </div>

              {/* Publication Status */}
              <div>
                <label className="block text-[#8BAE5A] font-semibold mb-2">Publicatiestatus</label>
                <select
                  value={lessonForm.status}
                  onChange={(e) => setLessonForm({...lessonForm, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="published">Gepubliceerd</option>
                  <option value="draft">Concept</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <AdminButton
                  onClick={closeLessonModal}
                  variant="secondary"
                >
                  <XMarkIcon className="w-5 h-5 mr-2" />
                  Annuleren
                </AdminButton>
                <AdminButton
                  onClick={handleLessonSave}
                  disabled={isLoading || !lessonForm.title || !lessonForm.duration}
                  variant="primary"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#181F17] border-t-transparent rounded-full animate-spin mr-2"></div>
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Opslaan
                    </>
                  )}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info - Conditionally shown at bottom */}
      {showDebug && (
        <AdminCard>
          <h3 className="text-[#8BAE5A] font-semibold mb-2">Debug Info:</h3>
          <p className="text-white">Aantal modules geladen: {modules.length}</p>
          <p className="text-white">Modules: {JSON.stringify(modules.map(m => ({ id: m.id, title: m.title, lessons_count: m.lessons_count })))}</p>
          <p className="text-white">Aantal lessen geladen: {lessons.length}</p>
          <p className="text-white">Lessen: {JSON.stringify(lessons.map(l => ({ 
            id: l.id, 
            title: l.title, 
            module_id: l.module_id, 
            status: l.status,
            order_index: l.order_index 
          })))}</p>
          
          {/* Module-Lesson Mapping */}
          <div className="mt-4">
            <h4 className="text-[#B6C948] font-semibold mb-2">Module-Lesson Mapping:</h4>
            {modules.map(module => {
              const moduleLessons = lessons.filter(l => l.module_id === module.id);
              return (
                <div key={module.id} className="text-white text-sm mb-2">
                  <span className="text-[#8BAE5A] font-medium">{module.title}:</span> {moduleLessons.length} lessen
                  {moduleLessons.length > 0 && (
                    <ul className="ml-4 text-[#B6C948]">
                      {moduleLessons.map(lesson => (
                        <li key={lesson.id}>• {lesson.title} (ID: {lesson.id})</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </AdminCard>
      )}
    </div>
  );
} 