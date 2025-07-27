'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FireIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'copy' | 'video' | 'image' | 'research' | 'strategy';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'overdue';
  assignedTo: string;
  assignedBy: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  platform: string;
  campaign: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  notes?: string;
  attachments?: string[];
}

export default function TakenlijstPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdDate'>('dueDate');

  // Sample tasks for Rick
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Facebook Ad Copy - Top Tier Man Hoofdbericht',
      description: 'Schrijf een krachtige ad copy voor Facebook gericht op mannen die zich willen ontwikkelen. Focus op leiderschap en persoonlijke groei.',
      type: 'copy',
      priority: 'critical',
      status: 'pending',
      assignedTo: 'Rick',
      assignedBy: 'Marketing Team',
      createdDate: '2025-01-20',
      dueDate: '2025-01-25',
      platform: 'Facebook',
      campaign: 'Top Tier Man Development',
      estimatedHours: 4,
      tags: ['facebook', 'ad-copy', 'leiderschap'],
      notes: 'Gebruik krachtige call-to-actions en focus op transformationele resultaten'
    },
    {
      id: '2',
      title: 'YouTube Video Script - 5 Principes Serie',
      description: 'Schrijf een script voor de eerste video in de "5 Principes van een Top Tier Man" serie. Video duur: 8-10 minuten.',
      type: 'video',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Rick',
      assignedBy: 'Video Team',
      createdDate: '2025-01-18',
      dueDate: '2025-01-23',
      platform: 'YouTube',
      campaign: 'Top Tier Man Video Series',
      estimatedHours: 6,
      actualHours: 2,
      tags: ['youtube', 'script', 'video-serie'],
      notes: 'Eerste principe: Discipline. Maak het persoonlijk en praktisch toepasbaar'
    },
    {
      id: '3',
      title: 'LinkedIn Post Content - Executive Development',
      description: 'Maak 5 LinkedIn posts gericht op professionals die hun carrière willen ontwikkelen. Focus op Top Tier Man principes in de werkcontext.',
      type: 'copy',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Rick',
      assignedBy: 'Social Media Team',
      createdDate: '2025-01-19',
      dueDate: '2025-01-26',
      platform: 'LinkedIn',
      campaign: 'Executive Development',
      estimatedHours: 5,
      tags: ['linkedin', 'posts', 'carrière'],
      notes: 'Gebruik professionele toon, maar wel toegankelijk. Focus op concrete tips'
    },
    {
      id: '4',
      title: 'Instagram Stories Content Plan',
      description: 'Plan en schrijf content voor 7 dagen Instagram Stories met dagelijkse Top Tier Man tips.',
      type: 'strategy',
      priority: 'medium',
      status: 'review',
      assignedTo: 'Rick',
      assignedBy: 'Content Team',
      createdDate: '2025-01-15',
      dueDate: '2025-01-22',
      platform: 'Instagram',
      campaign: 'Daily Top Tier Tips',
      estimatedHours: 3,
      actualHours: 3,
      tags: ['instagram', 'stories', 'content-plan'],
      notes: 'Elke dag een andere focus: discipline, leiderschap, fitness, mindset, etc.'
    },
    {
      id: '5',
      title: 'TikTok Video Concepten',
      description: 'Ontwikkel 10 TikTok video concepten die de Top Tier Man lifestyle tonen. Focus op korte, krachtige content.',
      type: 'strategy',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Rick',
      assignedBy: 'Video Team',
      createdDate: '2025-01-20',
      dueDate: '2025-01-28',
      platform: 'TikTok',
      campaign: 'Top Tier Lifestyle',
      estimatedHours: 4,
      tags: ['tiktok', 'concepten', 'lifestyle'],
      notes: 'Maximaal 60 seconden per video. Gebruik trending audio en hashtags'
    },
    {
      id: '6',
      title: 'Google Ads Keyword Research',
      description: 'Doe onderzoek naar de beste keywords voor Google Ads campagnes gericht op persoonlijke ontwikkeling en leiderschap.',
      type: 'research',
      priority: 'critical',
      status: 'completed',
      assignedTo: 'Rick',
      assignedBy: 'Marketing Team',
      createdDate: '2025-01-10',
      dueDate: '2025-01-17',
      completedDate: '2025-01-16',
      platform: 'Google Ads',
      campaign: 'Top Tier Man Search',
      estimatedHours: 8,
      actualHours: 7,
      tags: ['google-ads', 'keywords', 'research'],
      notes: 'Focus op long-tail keywords met hoge intentie. Concurrentie analyse inbegrepen'
    },
    {
      id: '7',
      title: 'Landing Page Copy - Top Tier Academy',
      description: 'Schrijf copy voor de landing page van de Top Tier Academy. Focus op conversie en waarde propositie.',
      type: 'copy',
      priority: 'critical',
      status: 'overdue',
      assignedTo: 'Rick',
      assignedBy: 'Web Team',
      createdDate: '2025-01-12',
      dueDate: '2025-01-20',
      platform: 'Website',
      campaign: 'Top Tier Academy Launch',
      estimatedHours: 6,
      tags: ['landing-page', 'copy', 'conversie'],
      notes: 'Moet dringend af! Landing page is klaar, alleen copy ontbreekt nog'
    },
    {
      id: '8',
      title: 'Email Sequence - Welkomstreeks',
      description: 'Schrijf een 5-delige welkomstreeks voor nieuwe Top Tier Man leden.',
      type: 'copy',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Rick',
      assignedBy: 'Email Team',
      createdDate: '2025-01-21',
      dueDate: '2025-01-30',
      platform: 'Email',
      campaign: 'Welcome Sequence',
      estimatedHours: 5,
      tags: ['email', 'sequence', 'welkomstreeks'],
      notes: 'Dag 1: Welkom, Dag 2: Eerste principe, Dag 3: Community, Dag 4: Resultaten, Dag 5: Call-to-action'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'copy': return <DocumentTextIcon className="w-5 h-5" />;
      case 'video': return <VideoCameraIcon className="w-5 h-5" />;
      case 'image': return <PhotoIcon className="w-5 h-5" />;
      case 'research': return <GlobeAltIcon className="w-5 h-5" />;
      case 'strategy': return <ChartBarIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'review': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Kritiek';
      case 'high': return 'Hoog';
      case 'medium': return 'Medium';
      case 'low': return 'Laag';
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Wachtend';
      case 'in-progress': return 'Bezig';
      case 'review': return 'In Review';
      case 'completed': return 'Voltooid';
      case 'overdue': return 'Te Laat';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'copy': return 'Copy';
      case 'video': return 'Video';
      case 'image': return 'Afbeelding';
      case 'research': return 'Onderzoek';
      case 'strategy': return 'Strategie';
      default: return type;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const typeMatch = selectedType === 'all' || task.type === selectedType;
    const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
    const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
    return typeMatch && statusMatch && priorityMatch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case 'createdDate':
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      default:
        return 0;
    }
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'pending').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => task.status === 'overdue').length,
    critical: tasks.filter(task => task.priority === 'critical').length,
    totalEstimatedHours: tasks.reduce((sum, task) => sum + task.estimatedHours, 0),
    totalActualHours: tasks.filter(task => task.actualHours).reduce((sum, task) => sum + (task.actualHours || 0), 0)
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Takenlijst - Rick</h1>
          <p className="text-gray-400 mt-1">Content taken voor advertising campagnes</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500 font-medium">Onder Ontwikkeling</span>
            </div>
          </div>
          <button className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Nieuwe Taak</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
            <ClipboardDocumentListIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Wachtend</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
            <ClockIcon className="w-6 h-6 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Bezig</p>
              <p className="text-xl font-bold text-white">{stats.inProgress}</p>
            </div>
            <FireIcon className="w-6 h-6 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Voltooid</p>
              <p className="text-xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Te Laat</p>
              <p className="text-xl font-bold text-white">{stats.overdue}</p>
            </div>
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Kritiek</p>
              <p className="text-xl font-bold text-white">{stats.critical}</p>
            </div>
            <StarIcon className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Geschatte Uren</p>
              <p className="text-xl font-bold text-white">{stats.totalEstimatedHours}h</p>
            </div>
            <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Werkelijke Uren</p>
              <p className="text-xl font-bold text-white">{stats.totalActualHours}h</p>
            </div>
            <CurrencyDollarIcon className="w-6 h-6 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Types</option>
            <option value="copy">Copy</option>
            <option value="video">Video</option>
            <option value="image">Afbeelding</option>
            <option value="research">Onderzoek</option>
            <option value="strategy">Strategie</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Statussen</option>
            <option value="pending">Wachtend</option>
            <option value="in-progress">Bezig</option>
            <option value="review">In Review</option>
            <option value="completed">Voltooid</option>
            <option value="overdue">Te Laat</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Prioriteiten</option>
            <option value="critical">Kritiek</option>
            <option value="high">Hoog</option>
            <option value="medium">Medium</option>
            <option value="low">Laag</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="dueDate">Sorteer op Deadline</option>
            <option value="priority">Sorteer op Prioriteit</option>
            <option value="createdDate">Sorteer op Aanmaakdatum</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 bg-[#2D3748] rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lijst
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'kanban'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {sortedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`bg-[#1A1F2E] border rounded-lg p-6 hover:border-[#8BAE5A] transition-colors ${
                isOverdue(task.dueDate) && task.status !== 'completed' 
                  ? 'border-red-500/50 bg-red-500/5' 
                  : 'border-[#2D3748]'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(task.type)}
                    <span className="text-sm text-gray-400">{getTypeText(task.type)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">Platform: <span className="text-white">{task.platform}</span></span>
                      <span className="text-gray-400">Campagne: <span className="text-white">{task.campaign}</span></span>
                      <span className="text-gray-400">Geschatte uren: <span className="text-white">{task.estimatedHours}h</span></span>
                      {task.actualHours && (
                        <span className="text-gray-400">Werkelijke uren: <span className="text-white">{task.actualHours}h</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {getPriorityText(task.priority)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Toegewezen door: <span className="text-white">{task.assignedBy}</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className={`${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400' : 'text-gray-400'}`}>
                      Deadline: <span className="text-white">{new Date(task.dueDate).toLocaleDateString('nl-NL')}</span>
                    </span>
                  </div>
                  {task.completedDate && (
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Voltooid: <span className="text-white">{new Date(task.completedDate).toLocaleDateString('nl-NL')}</span></span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {task.notes && (
                <div className="mt-4 p-3 bg-[#2D3748] rounded-lg">
                  <p className="text-sm text-gray-300"><strong>Notities:</strong> {task.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {task.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 bg-[#2D3748] text-gray-300 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Development Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-start space-x-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-2">🔄 Takenlijst Onder Ontwikkeling</h3>
            <p className="text-gray-300 mb-4">
              Deze takenlijst pagina is momenteel onder actieve ontwikkeling. Functionaliteiten zoals taak beheer, 
              voortgang tracking en notificaties worden nog geïmplementeerd. De huidige weergave toont voorbeelddata 
              voor Rick's content taken.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Laatste update: Vandaag</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Status: In ontwikkeling</span>
              </div>
              <div className="flex items-center space-x-2">
                <FireIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Volgende: Taak beheer</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 