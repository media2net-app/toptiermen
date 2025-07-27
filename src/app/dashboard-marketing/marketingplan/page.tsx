'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  TagIcon,
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  HashtagIcon,
  VideoCameraIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface MarketingPhase {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  tasks: MarketingTask[];
  budget: number;
  expectedROI: number;
}

interface MarketingTask {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  budget: number;
  channel: string;
}

export default function MarketingPlanPage() {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'timeline'>('overview');

  // Marketing Plan Data
  const marketingPhases: MarketingPhase[] = [
    {
      id: 'phase-1',
      title: 'Fase 1: Onderzoek & Strategie',
      description: 'Marktonderzoek, doelgroepanalyse en strategieontwikkeling',
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      status: 'planned',
      budget: 5000,
      expectedROI: 150,
      tasks: [
        {
          id: 'task-1-1',
          title: 'Marktonderzoek uitvoeren',
          description: 'Analyse van concurrentie, trends en kansen in de markt',
          status: 'planned',
          priority: 'high',
          assignedTo: 'Marketing Team',
          dueDate: '2025-09-15',
          estimatedHours: 40,
          budget: 2000,
          channel: 'Research'
        },
        {
          id: 'task-1-2',
          title: 'Doelgroepanalyse',
          description: 'Gedetailleerde analyse van primaire en secundaire doelgroepen',
          status: 'planned',
          priority: 'high',
          assignedTo: 'Marketing Team',
          dueDate: '2025-09-20',
          estimatedHours: 32,
          budget: 1500,
          channel: 'Research'
        },
        {
          id: 'task-1-3',
          title: 'Strategieontwikkeling',
          description: 'Ontwikkeling van de marketingstrategie en positionering',
          status: 'planned',
          priority: 'critical',
          assignedTo: 'Marketing Manager',
          dueDate: '2025-09-30',
          estimatedHours: 48,
          budget: 1500,
          channel: 'Strategy'
        }
      ]
    },
    {
      id: 'phase-2',
      title: 'Fase 2: Content & Creatie',
      description: 'Content creatie, branding en asset ontwikkeling',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      status: 'planned',
      budget: 8000,
      expectedROI: 200,
      tasks: [
        {
          id: 'task-2-1',
          title: 'Brand Identity Ontwikkeling',
          description: 'Ontwikkeling van visuele identiteit en brand guidelines',
          status: 'planned',
          priority: 'high',
          assignedTo: 'Design Team',
          dueDate: '2025-10-10',
          estimatedHours: 60,
          budget: 3000,
          channel: 'Branding'
        },
        {
          id: 'task-2-2',
          title: 'Content Calender Opstellen',
          description: 'Planning van content voor alle kanalen',
          status: 'planned',
          priority: 'medium',
          assignedTo: 'Content Team',
          dueDate: '2025-10-15',
          estimatedHours: 24,
          budget: 1000,
          channel: 'Content'
        },
        {
          id: 'task-2-3',
          title: 'Video & Foto Productie',
          description: 'Productie van professionele video en foto content',
          status: 'planned',
          priority: 'high',
          assignedTo: 'Production Team',
          dueDate: '2025-10-31',
          estimatedHours: 80,
          budget: 4000,
          channel: 'Production'
        }
      ]
    },
    {
      id: 'phase-3',
      title: 'Fase 3: Implementatie & Optimalisatie',
      description: 'Campagne lancering, monitoring en optimalisatie',
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      status: 'planned',
      budget: 12000,
      expectedROI: 300,
      tasks: [
        {
          id: 'task-3-1',
          title: 'Campagne Lancering',
          description: 'Lancering van alle marketing campagnes',
          status: 'planned',
          priority: 'critical',
          assignedTo: 'Marketing Team',
          dueDate: '2025-11-05',
          estimatedHours: 40,
          budget: 5000,
          channel: 'Campaigns'
        },
        {
          id: 'task-3-2',
          title: 'Performance Monitoring',
          description: 'Continue monitoring en analyse van campagne prestaties',
          status: 'planned',
          priority: 'high',
          assignedTo: 'Analytics Team',
          dueDate: '2025-11-30',
          estimatedHours: 60,
          budget: 3000,
          channel: 'Analytics'
        },
        {
          id: 'task-3-3',
          title: 'Optimalisatie & A/B Testing',
          description: 'Optimalisatie van campagnes op basis van data',
          status: 'planned',
          priority: 'medium',
          assignedTo: 'Marketing Team',
          dueDate: '2025-11-30',
          estimatedHours: 40,
          budget: 4000,
          channel: 'Optimization'
        }
      ]
    }
  ];

  const totalBudget = marketingPhases.reduce((sum, phase) => sum + phase.budget, 0);
  const totalExpectedROI = marketingPhases.reduce((sum, phase) => sum + phase.expectedROI, 0);
  const totalTasks = marketingPhases.reduce((sum, phase) => sum + phase.tasks.length, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'delayed': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Social Media': return <HashtagIcon className="w-4 h-4" />;
      case 'Email': return <EnvelopeIcon className="w-4 h-4" />;
      case 'Video': return <VideoCameraIcon className="w-4 h-4" />;
      case 'Photo': return <PhotoIcon className="w-4 h-4" />;
      case 'Content': return <DocumentTextIcon className="w-4 h-4" />;
      case 'Analytics': return <ChartBarIcon className="w-4 h-4" />;
      case 'Campaigns': return <MegaphoneIcon className="w-4 h-4" />;
      case 'Branding': return <GlobeAltIcon className="w-4 h-4" />;
      case 'Production': return <VideoCameraIcon className="w-4 h-4" />;
      case 'Strategy': return <PresentationChartLineIcon className="w-4 h-4" />;
      case 'Research': return <DocumentTextIcon className="w-4 h-4" />;
      case 'Optimization': return <ChartBarIcon className="w-4 h-4" />;
      default: return <TagIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing Plan</h1>
          <p className="text-gray-400 mt-1">3-maanden strategisch marketingplan (1 september - 30 november)</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              <span className="text-orange-500 font-medium">Onder Ontwikkeling</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#2D3748] text-gray-400 hover:text-white'
              }`}
            >
              Overzicht
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#2D3748] text-gray-400 hover:text-white'
              }`}
            >
              Gedetailleerd
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#2D3748] text-gray-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Totaal Budget</p>
              <p className="text-2xl font-bold text-white">€{totalBudget.toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Advertentie Tegoed</p>
              <p className="text-2xl font-bold text-white">€14.000</p>
            </div>
            <MegaphoneIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verwachte ROI</p>
              <p className="text-2xl font-bold text-white">{totalExpectedROI}%</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verwachte Omzet</p>
              <p className="text-2xl font-bold text-white">€187.500</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Looptijd</p>
              <p className="text-2xl font-bold text-white">3 Maanden</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </motion.div>
      </div>

      {/* Budget Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Budget Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-[#8BAE5A] mb-3">Advertentie Tegoed (€14.000)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Facebook/Instagram Ads</span>
                <span className="text-white">€8.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Google Ads</span>
                <span className="text-white">€4.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">LinkedIn Ads</span>
                <span className="text-white">€2.000</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-[#8BAE5A] mb-3">Overige Kosten (€11.000)</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Content Creatie</span>
                <span className="text-white">€4.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Design & Branding</span>
                <span className="text-white">€3.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tools & Software</span>
                <span className="text-white">€2.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Analytics & Monitoring</span>
                <span className="text-white">€2.000</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {marketingPhases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#3A4D23] rounded-lg flex items-center justify-center">
                      <span className="text-[#8BAE5A] font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                      <p className="text-gray-400 text-sm">{phase.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                      {phase.status === 'planned' ? 'Gepland' : 
                       phase.status === 'in-progress' ? 'Bezig' : 
                       phase.status === 'completed' ? 'Voltooid' : 'Vertraagd'}
                    </span>
                    <button
                      onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                      className="text-[#8BAE5A] hover:text-[#9BBE6A] transition-colors"
                    >
                      {selectedPhase === phase.id ? 'Verbergen' : 'Details'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {new Date(phase.startDate).toLocaleDateString('nl-NL')} - {new Date(phase.endDate).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Budget: €{phase.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">ROI: {phase.expectedROI}%</span>
                  </div>
                </div>

                {/* Tasks */}
                {selectedPhase === phase.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-[#2D3748] pt-4"
                  >
                    <h4 className="text-md font-semibold text-white mb-4">Taken</h4>
                    <div className="space-y-3">
                      {phase.tasks.map((task) => (
                        <div key={task.id} className="bg-[#2D3748] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getChannelIcon(task.channel)}
                              <h5 className="font-medium text-white">{task.title}</h5>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'critical' ? 'Kritiek' :
                                 task.priority === 'high' ? 'Hoog' :
                                 task.priority === 'medium' ? 'Medium' : 'Laag'}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status === 'planned' ? 'Gepland' : 
                                 task.status === 'in-progress' ? 'Bezig' : 
                                 task.status === 'completed' ? 'Voltooid' : 'Vertraagd'}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Toegewezen:</span>
                              <p className="text-white">{task.assignedTo}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Deadline:</span>
                              <p className="text-white">{new Date(task.dueDate).toLocaleDateString('nl-NL')}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Uren:</span>
                              <p className="text-white">{task.estimatedHours}h</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Budget:</span>
                              <p className="text-white">€{task.budget.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* Detailed Task View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Gedetailleerde Taak Overzicht</h2>
            <div className="space-y-4">
              {marketingPhases.flatMap((phase, phaseIndex) =>
                phase.tasks.map((task, taskIndex) => (
                  <div key={task.id} className="bg-[#2D3748] rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-[#3A4D23] rounded-lg flex items-center justify-center">
                            <span className="text-[#8BAE5A] font-bold text-sm">{phaseIndex + 1}.{taskIndex + 1}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        </div>
                        <p className="text-gray-400 mb-3">{task.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Fase:</span>
                            <p className="text-white">{phase.title}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Toegewezen:</span>
                            <p className="text-white">{task.assignedTo}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Deadline:</span>
                            <p className="text-white">{new Date(task.dueDate).toLocaleDateString('nl-NL')}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Kanaal:</span>
                            <p className="text-white">{task.channel}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'critical' ? 'Kritiek' :
                           task.priority === 'high' ? 'Hoog' :
                           task.priority === 'medium' ? 'Medium' : 'Laag'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status === 'planned' ? 'Gepland' : 
                           task.status === 'in-progress' ? 'Bezig' : 
                           task.status === 'completed' ? 'Voltooid' : 'Vertraagd'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#1A1F2E]">
                      <div className="bg-[#1A1F2E] rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Tijdsinvestering</span>
                        </div>
                        <p className="text-white font-semibold">{task.estimatedHours} uur</p>
                      </div>
                      <div className="bg-[#1A1F2E] rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Budget</span>
                        </div>
                        <p className="text-white font-semibold">€{task.budget.toLocaleString()}</p>
                      </div>
                      <div className="bg-[#1A1F2E] rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <ChartBarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Verwachte Impact</span>
                        </div>
                        <p className="text-white font-semibold">Hoog</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Marketing Timeline</h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#2D3748]"></div>
              
              <div className="space-y-8">
                {marketingPhases.map((phase, phaseIndex) => (
                  <div key={phase.id} className="relative">
                    {/* Phase Marker */}
                    <div className="absolute left-6 w-4 h-4 bg-[#8BAE5A] rounded-full border-4 border-[#1A1F2E]"></div>
                    
                    <div className="ml-16">
                      <div className="bg-[#2D3748] rounded-lg p-6 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                            {phase.status === 'planned' ? 'Gepland' : 
                             phase.status === 'in-progress' ? 'Bezig' : 
                             phase.status === 'completed' ? 'Voltooid' : 'Vertraagd'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{phase.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              {new Date(phase.startDate).toLocaleDateString('nl-NL')} - {new Date(phase.endDate).toLocaleDateString('nl-NL')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">€{phase.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{phase.expectedROI}% ROI</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tasks Timeline */}
                      <div className="space-y-4 ml-8">
                        {phase.tasks.map((task, taskIndex) => (
                          <div key={task.id} className="relative">
                            <div className="absolute left-4 w-2 h-2 bg-[#3B82F6] rounded-full"></div>
                            <div className="ml-8 bg-[#2D3748] rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-white">{task.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                    {task.priority === 'critical' ? 'Kritiek' :
                                     task.priority === 'high' ? 'Hoog' :
                                     task.priority === 'medium' ? 'Medium' : 'Laag'}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                                    {task.status === 'planned' ? 'Gepland' : 
                                     task.status === 'in-progress' ? 'Bezig' : 
                                     task.status === 'completed' ? 'Voltooid' : 'Vertraagd'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-400">Toegewezen: <span className="text-white">{task.assignedTo}</span></span>
                                  <span className="text-gray-400">Deadline: <span className="text-white">{new Date(task.dueDate).toLocaleDateString('nl-NL')}</span></span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-400">{task.estimatedHours}h</span>
                                  <span className="text-gray-400">€{task.budget.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Development Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6"
      >
        <div className="flex items-start space-x-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-orange-500 mb-2">🔄 Pagina Onder Ontwikkeling</h3>
            <p className="text-gray-300 mb-4">
              Deze marketingplan pagina is momenteel onder actieve ontwikkeling. De functionaliteit wordt 
              continu verbeterd en nieuwe features worden toegevoegd. De huidige content is een prototype 
              en kan nog wijzigingen ondergaan.
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
                <RocketLaunchIcon className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300">Volgende: Meer features</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 