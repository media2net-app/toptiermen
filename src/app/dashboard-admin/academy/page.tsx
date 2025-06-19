'use client';
import { useState } from 'react';
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
  UsersIcon
} from '@heroicons/react/24/outline';

// Mock data - in real app this would come from API
const mockModules = [
  {
    id: 1,
    title: 'Discipline & Identiteit',
    description: 'Bouw een onwrikbare discipline en ontdek je ware identiteit',
    lessons: 8,
    totalDuration: '2u 45m',
    enrolledStudents: 1247,
    completionRate: 78,
    status: 'published',
    image: '/images/mind/1.png'
  },
  {
    id: 2,
    title: 'Fysieke Dominantie',
    description: 'Transformeer je lichaam en word fysiek dominant',
    lessons: 12,
    totalDuration: '4u 20m',
    enrolledStudents: 892,
    completionRate: 65,
    status: 'published',
    image: '/images/mind/2.png'
  },
  {
    id: 3,
    title: 'Mentale Kracht',
    description: 'Ontwikkel een ijzersterke mindset en mentale weerbaarheid',
    lessons: 6,
    totalDuration: '1u 55m',
    enrolledStudents: 1103,
    completionRate: 82,
    status: 'draft',
    image: '/images/mind/3.png'
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
    completionRate: 89
  },
  {
    id: 2,
    title: 'Je Identiteit Definiëren',
    moduleId: 1,
    duration: '30m',
    type: 'video',
    status: 'published',
    order: 2,
    views: 1102,
    completionRate: 76
  },
  {
    id: 3,
    title: 'Dagelijkse Routines',
    moduleId: 1,
    duration: '20m',
    type: 'video',
    status: 'published',
    order: 3,
    views: 987,
    completionRate: 71
  }
];

export default function AcademyManagement() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showNewModuleModal, setShowNewModuleModal] = useState(false);
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);

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

  const selectedModuleData = mockModules.find(m => m.id === selectedModule);
  const moduleLessons = mockLessons.filter(l => l.moduleId === selectedModule);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Academy Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle Academy modules en lessen</p>
        </div>
        <button
          onClick={() => setShowNewModuleModal(true)}
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
            <p className="text-[#B6C948] text-sm mb-4">{module.description}</p>
            
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

      {/* Selected Module Details */}
      {selectedModule && selectedModuleData && (
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#8BAE5A]">{selectedModuleData.title}</h2>
              <p className="text-[#B6C948] mt-1">{selectedModuleData.description}</p>
            </div>
            <button
              onClick={() => setShowNewLessonModal(true)}
              className="px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nieuwe Les
            </button>
          </div>

          {/* Lessons Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Volgorde</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Les</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Duur</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Views</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Voltooiing</th>
                  <th className="px-4 py-3 text-center text-[#8BAE5A] font-semibold">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {moduleLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-[#181F17] transition-colors duration-200">
                    <td className="px-4 py-3">
                      <span className="text-[#8BAE5A] font-semibold">{lesson.order}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#8BAE5A]/20">
                          <PlayIcon className="w-4 h-4 text-[#8BAE5A]" />
                        </div>
                        <span className="text-[#8BAE5A] font-medium">{lesson.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#B6C948] text-sm capitalize">{lesson.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-[#B6C948]" />
                        <span className="text-[#B6C948]">{lesson.duration}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lesson.status)} bg-[#181F17]`}>
                        {getStatusText(lesson.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#8BAE5A] font-semibold">{lesson.views}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#181F17] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full" 
                            style={{ width: `${lesson.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-[#B6C948] text-xs">{lesson.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                          <PencilIcon className="w-4 h-4 text-[#B6C948]" />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200">
                          <EyeIcon className="w-4 h-4 text-[#B6C948]" />
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
    </div>
  );
} 