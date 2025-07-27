'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  CodeBracketIcon,
  CircleStackIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ListBulletIcon,
  FlagIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  XMarkIcon,
  PlusIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Types
interface TodoTask {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'api' | 'testing' | 'deployment' | 'documentation' | 'ui' | 'integration' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  actual_hours: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  assigned_to: string;
  due_date: string;
  start_date: string;
  completion_date: string | null;
  dependencies: string[];
  tags: string[];
  progress_percentage: number;
  created_at: string;
}

interface TodoSubtask {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  estimated_hours: number;
  actual_hours: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  assigned_to: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  order_index: number;
  created_at: string;
}

interface TodoMilestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  tags: string[];
}

interface TodoStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  average_completion_time: number;
  tasks_by_priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  tasks_by_category: {
    frontend: number;
    backend: number;
    database: number;
    api: number;
    testing: number;
    deployment: number;
    documentation: number;
    ui: number;
    integration: number;
    optimization: number;
  };
}

export default function PlanningTodo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'statistics'>('overview');
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [subtasks, setSubtasks] = useState<TodoSubtask[]>([]);
  const [milestones, setMilestones] = useState<TodoMilestone[]>([]);
  const [statistics, setStatistics] = useState<TodoStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  // Fetch todo data
  const fetchTodoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks
      const tasksResponse = await fetch('/api/admin/todo-tasks');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData.tasks || []);

      // Fetch subtasks
      const subtasksResponse = await fetch('/api/admin/todo-subtasks');
      const subtasksData = await subtasksResponse.json();
      setSubtasks(subtasksData.subtasks || []);

      // Fetch milestones
      const milestonesResponse = await fetch('/api/admin/todo-milestones');
      const milestonesData = await milestonesResponse.json();
      setMilestones(milestonesData.milestones || []);

      // Fetch statistics
      const statsResponse = await fetch('/api/admin/todo-statistics');
      const statsData = await statsResponse.json();
      setStatistics(statsData.statistics || null);

    } catch (err) {
      console.error('Error fetching todo data:', err);
      setError('Failed to load todo data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodoData();
  }, []);

  // Get subtasks for a specific task
  const getSubtasksForTask = (taskId: string) => {
    return subtasks.filter(subtask => subtask.task_id === taskId);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend': return CodeBracketIcon;
      case 'backend': return CpuChipIcon;
      case 'database': return CircleStackIcon;
      case 'api': return Cog6ToothIcon;
      case 'testing': return MagnifyingGlassIcon;
      case 'deployment': return WrenchScrewdriverIcon;
      case 'documentation': return DocumentTextIcon;
      case 'ui': return UserGroupIcon;
      case 'integration': return ArrowTrendingUpIcon;
      case 'optimization': return BoltIcon;
      default: return ListBulletIcon;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'low': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get milestone status color
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'planned': return 'text-gray-600 bg-gray-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency indicator
  const getUrgencyIndicator = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return 'text-red-500'; // Overdue
    if (daysUntilDue <= 3) return 'text-orange-500'; // Urgent
    if (daysUntilDue <= 7) return 'text-yellow-500'; // Soon
    return 'text-green-500'; // Plenty of time
  };

  // Open subtask modal
  const openSubtaskModal = (task: TodoTask) => {
    setSelectedTask(task);
    setShowSubtaskModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400 text-center py-8">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] to-[#1A1F2E] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Planning & To-Do</h1>
          <p className="text-[#B6C948]">Overzicht van openstaande taken tot 1 September 2025</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm font-medium">Totaal Taken</p>
                <p className="text-white text-2xl font-bold">{statistics?.total_tasks || 0}</p>
              </div>
              <ListBulletIcon className="h-8 w-8 text-[#8BAE5A]" />
            </div>
          </div>

          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm font-medium">Voltooid</p>
                <p className="text-white text-2xl font-bold">{statistics?.completed_tasks || 0}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm font-medium">In Progress</p>
                <p className="text-white text-2xl font-bold">{statistics?.in_progress_tasks || 0}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm font-medium">Geschatte Uren</p>
                <p className="text-white text-2xl font-bold">{statistics?.total_estimated_hours || 0}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-[#8BAE5A]" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#232D1A] rounded-lg border border-[#3A4D23] mb-6">
          <div className="flex border-b border-[#3A4D23]">
            {[
              { id: 'overview', label: 'Overzicht', icon: ChartBarIcon },
              { id: 'tasks', label: 'Taken', icon: ListBulletIcon },
              { id: 'milestones', label: 'Milestones', icon: FlagIcon },
              { id: 'statistics', label: 'Statistieken', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#8BAE5A] text-[#8BAE5A]'
                    : 'border-transparent text-[#B6C948] hover:text-[#8BAE5A]'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#232D1A] rounded-lg border border-[#3A4D23] p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Priority Overview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Prioriteiten Overzicht</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 font-medium">Kritiek</span>
                      <span className="text-red-400 text-2xl font-bold">{statistics?.tasks_by_priority.critical || 0}</span>
                    </div>
                    <p className="text-red-300 text-sm">Moet voor 1 Sept</p>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-400 font-medium">Hoog</span>
                      <span className="text-orange-400 text-2xl font-bold">{statistics?.tasks_by_priority.high || 0}</span>
                    </div>
                    <p className="text-orange-300 text-sm">Belangrijk voor launch</p>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-yellow-400 font-medium">Medium</span>
                      <span className="text-yellow-400 text-2xl font-bold">{statistics?.tasks_by_priority.medium || 0}</span>
                    </div>
                    <p className="text-yellow-300 text-sm">Nice to have</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 font-medium">Laag</span>
                      <span className="text-green-400 text-2xl font-bold">{statistics?.tasks_by_priority.low || 0}</span>
                    </div>
                    <p className="text-green-300 text-sm">Toekomstige features</p>
                  </div>
                </div>
              </div>

              {/* Category Overview */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Categorieën Overzicht</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(statistics?.tasks_by_category || {}).map(([category, count]) => (
                    <div key={category} className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#8BAE5A] font-medium capitalize">{category}</span>
                        <span className="text-white text-xl font-bold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Recente Taken</h3>
                <div className="space-y-3">
                  {filteredTasks.slice(0, 5).map((task) => {
                    const CategoryIcon = getCategoryIcon(task.category);
                    const daysUntilDue = getDaysUntilDue(task.due_date);
                    const urgencyClass = getUrgencyIndicator(task.due_date);
                    const taskSubtasks = getSubtasksForTask(task.id);
                    
                    return (
                      <div key={task.id} className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              task.status === 'blocked' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                            <div>
                              <h4 className="text-white font-medium">{task.title}</h4>
                              <p className="text-[#B6C948] text-sm">{task.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-[#8BAE5A] text-sm">{task.estimated_hours}h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <MagnifyingGlassIcon className="h-5 w-5 text-[#8BAE5A]" />
                  <input
                    type="text"
                    placeholder="Zoek taken..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg px-3 py-2 text-white placeholder-[#B6C948] focus:outline-none focus:border-[#8BAE5A]"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                >
                  <option value="all">Alle Statussen</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                >
                  <option value="all">Alle Prioriteiten</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8BAE5A]"
                >
                  <option value="all">Alle Categorieën</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="api">API</option>
                  <option value="testing">Testing</option>
                  <option value="deployment">Deployment</option>
                </select>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const CategoryIcon = getCategoryIcon(task.category);
                  const daysUntilDue = getDaysUntilDue(task.due_date);
                  const urgencyClass = getUrgencyIndicator(task.due_date);
                  const taskSubtasks = getSubtasksForTask(task.id);
                  
                  return (
                    <div key={task.id} className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <CategoryIcon className="h-6 w-6 text-[#8BAE5A] mt-1" />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{task.title}</h3>
                            <p className="text-[#B6C948] mb-3">{task.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {task.tags.map((tag) => (
                                <span key={tag} className="bg-[#232D1A] text-[#8BAE5A] px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-[#8BAE5A]" />
                            <span className={`text-sm ${urgencyClass}`}>
                              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} dagen te laat` :
                               daysUntilDue === 0 ? 'Vandaag' :
                               `${daysUntilDue} dagen`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-4 w-4 text-[#8BAE5A]" />
                            <span className="text-[#B6C948] text-sm">
                              {task.actual_hours || 0}/{task.estimated_hours}h
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserGroupIcon className="h-4 w-4 text-[#8BAE5A]" />
                            <span className="text-[#B6C948] text-sm">{task.assigned_to}</span>
                          </div>
                          {taskSubtasks.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <ListBulletIcon className="h-4 w-4 text-[#8BAE5A]" />
                              <span className="text-[#B6C948] text-sm">{taskSubtasks.length} subtaken</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-[#232D1A] rounded-full h-2">
                            <div 
                              className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress_percentage}%` }}
                            />
                          </div>
                          <span className="text-[#8BAE5A] text-sm font-medium">
                            {task.progress_percentage}%
                          </span>
                          <button
                            onClick={() => openSubtaskModal(task)}
                            className="ml-2 p-2 bg-[#8BAE5A] text-white rounded-lg hover:bg-[#7A9D4A] transition-colors"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">{milestone.title}</h3>
                      <p className="text-[#B6C948] mb-3">{milestone.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {milestone.tags.map((tag) => (
                          <span key={tag} className="bg-[#232D1A] text-[#8BAE5A] px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-[#8BAE5A]" />
                        <span className="text-[#B6C948] text-sm">
                          Target: {formatDate(milestone.target_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckBadgeIcon className="h-4 w-4 text-[#8BAE5A]" />
                        <span className="text-[#B6C948] text-sm">
                          {milestone.completed_tasks}/{milestone.total_tasks} taken
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-[#232D1A] rounded-full h-2">
                        <div 
                          className="bg-[#8BAE5A] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${milestone.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-[#8BAE5A] text-sm font-medium">
                        {milestone.progress_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Taak Status Verdeling</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Completed</span>
                      <span className="text-white font-bold">{statistics?.completed_tasks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">In Progress</span>
                      <span className="text-white font-bold">{statistics?.in_progress_tasks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Pending</span>
                      <span className="text-white font-bold">{statistics?.pending_tasks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Blocked</span>
                      <span className="text-white font-bold">{statistics?.blocked_tasks || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Uren Overzicht</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Geschatte Uren</span>
                      <span className="text-white font-bold">{statistics?.total_estimated_hours || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Werkelijke Uren</span>
                      <span className="text-white font-bold">{statistics?.total_actual_hours || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Gemiddelde Tijd</span>
                      <span className="text-white font-bold">{statistics?.average_completion_time || 0}d</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtask Modal */}
        {showSubtaskModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#232D1A] rounded-lg border border-[#3A4D23] p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Subtaken: {selectedTask.title}</h2>
                <button
                  onClick={() => setShowSubtaskModal(false)}
                  className="text-[#8BAE5A] hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {getSubtasksForTask(selectedTask.id).map((subtask) => (
                  <div key={subtask.id} className="bg-[#3A4D23]/40 border border-[#3A4D23] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">{subtask.title}</h4>
                        {subtask.description && (
                          <p className="text-[#B6C948] text-sm mb-2">{subtask.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subtask.status)}`}>
                          {subtask.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                          {subtask.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-[#8BAE5A]" />
                          <span className="text-[#B6C948]">
                            {subtask.actual_hours || 0}/{subtask.estimated_hours}h
                          </span>
                        </div>
                        {subtask.assigned_to && (
                          <div className="flex items-center space-x-2">
                            <UserGroupIcon className="h-4 w-4 text-[#8BAE5A]" />
                            <span className="text-[#B6C948]">{subtask.assigned_to}</span>
                          </div>
                        )}
                        {subtask.due_date && (
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-[#8BAE5A]" />
                            <span className="text-[#B6C948]">{formatDate(subtask.due_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getSubtasksForTask(selectedTask.id).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#B6C948]">Geen subtaken gevonden voor deze taak.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 