'use client';
import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useDebug } from '@/contexts/DebugContext';
import { AdminCard, AdminStatsCard, AdminTable, AdminButton } from '@/components/admin';

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  due_date: string;
  estimated_hours: number;
  actual_hours?: number;
  category: string;
  created_at: string;
}

const priorities = ['Alle Prioriteiten', 'critical', 'high', 'medium', 'low'];
const statuses = ['Alle Statussen', 'pending', 'in_progress', 'completed', 'blocked'];
const categories = ['Alle Categorieën', 'development', 'content', 'video', 'nutrition', 'design', 'testing', 'api', 'ui', 'database'];
const assignees = ['Alle Personen', 'Rick', 'Chiel'];

export default function TakenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('Alle Prioriteiten');
  const [selectedStatus, setSelectedStatus] = useState('Alle Statussen');
  const [selectedCategory, setSelectedCategory] = useState('Alle Categorieën');
  const [selectedAssignee, setSelectedAssignee] = useState('Alle Personen');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    assigned_to: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    due_date: string;
    estimated_hours: number;
    category: string;
  }>({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    estimated_hours: 0,
    category: 'development'
  });

  // Fetch tasks function
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      console.log('🔄 Fetching tasks from API...');
      
      const response = await fetch('/api/admin/todo-tasks');
      const data = await response.json();
      
      if (data.success) {
        setAllTasks(data.tasks);
        console.log('✅ Tasks loaded:', data.tasks.length);
      } else {
        console.error('Error fetching tasks:', data.error);
        toast.error('Fout bij het laden van taken', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Fout bij het laden van taken', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'Alle Prioriteiten' || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'Alle Statussen' || task.status === selectedStatus;
    const matchesCategory = selectedCategory === 'Alle Categorieën' || task.category === selectedCategory;
    const matchesAssignee = selectedAssignee === 'Alle Personen' || task.assigned_to === selectedAssignee;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesAssignee;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Voltooid';
      case 'in_progress': return 'Bezig';
      case 'blocked': return 'Geblokkeerd';
      case 'pending': return 'Open';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress': return <PlayIcon className="w-4 h-4" />;
      case 'blocked': return <XCircleIcon className="w-4 h-4" />;
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      priority: task.priority as 'low' | 'medium' | 'high' | 'critical',
      status: task.status as 'pending' | 'in_progress' | 'completed' | 'blocked',
      due_date: task.due_date,
      estimated_hours: task.estimated_hours,
      category: task.category
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingTask) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/todo-tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: editingTask.id })
      });

      if (response.ok) {
        toast.success('Taak succesvol bijgewerkt', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setShowEditModal(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Fout bij het bijwerken van taak', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Weet je zeker dat je deze taak wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/todo-tasks?id=${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Taak succesvol verwijderd', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        fetchTasks();
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Fout bij het verwijderen van taak', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  const handleAddNewTask = async () => {
    if (!formData.title || !formData.description || !formData.assigned_to || !formData.due_date) {
      toast.error('Vul alle verplichte velden in', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    setAddingTask(true);
    try {
      const response = await fetch('/api/admin/todo-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, created_at: new Date().toISOString() })
      });

      if (response.ok) {
        toast.success('Taak succesvol toegevoegd', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setShowAddTaskModal(false);
        setFormData({
          title: '',
          description: '',
          assigned_to: '',
          priority: 'medium',
          status: 'pending',
          due_date: '',
          estimated_hours: 0,
          category: 'development'
        });
        fetchTasks();
      } else {
        throw new Error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Fout bij het toevoegen van taak', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setAddingTask(false);
    }
  };

  const renderActions = (task: Task) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEditTask(task)}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
        title="Bewerken"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(task.id)}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
        title="Verwijderen"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );

                  const tableHeaders = [
    'Titel',
    'Toegewezen aan',
    'Prioriteit',
    'Status',
    'Categorie',
    'Deadline',
    'Acties'
  ];

  const tableData = currentTasks.map(task => [
    (
      <div className="max-w-xs">
        <div className="font-medium text-white truncate">{task.title}</div>
        <div className="text-sm text-gray-500 truncate">{task.description}</div>
      </div>
    ),
    (
      <div className="flex items-center gap-2">
        <UserIcon className="w-4 h-4 text-gray-400" />
        <span>{task.assigned_to}</span>
      </div>
    ),
    (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
        {task.priority}
      </span>
    ),
    (
      <div className="flex items-center gap-2">
        {task.status === 'completed' ? (
          <div className="flex items-center gap-2 completed-status-indicator">
            <div className="w-5 h-5 rounded-full bg-[#8BAE5A] flex items-center justify-center completed-status-circle">
              <CheckCircleIcon className="w-3 h-3 text-[#181F17]" />
            </div>
            <span className="text-[#8BAE5A] font-medium completed-status-text">Voltooid</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
          </div>
        )}
      </div>
    ),
    (
      <div className="flex items-center gap-2">
        <TagIcon className="w-4 h-4 text-gray-400" />
        <span className="capitalize">{task.category}</span>
      </div>
    ),
    (
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <span>{new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
      </div>
    ),
    renderActions(task)
  ]);

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Taken Beheer</h1>
            <p className="text-[#B6C948]">Beheer alle taken en toewijzingen</p>
          </div>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            Taak Toevoegen
          </button>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B6C948] text-sm font-medium">Totaal Taken</p>
              <p className="text-[#8BAE5A] text-2xl font-bold">{allTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
              <FlagIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B6C948] text-sm font-medium">Voltooid</p>
              <p className="text-[#8BAE5A] text-2xl font-bold">{allTasks.filter(t => t.status === 'completed').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B6C948] text-sm font-medium">In Progress</p>
              <p className="text-[#8BAE5A] text-2xl font-bold">{allTasks.filter(t => t.status === 'in_progress').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          </div>
        </div>
        
        <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B6C948] text-sm font-medium">Open</p>
              <p className="text-[#8BAE5A] text-2xl font-bold">{allTasks.filter(t => t.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B6C948] text-sm font-medium">Open Taken Rick</p>
              <p className="text-[#8BAE5A] text-2xl font-bold">{allTasks.filter(t => t.assigned_to === 'Rick' && t.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          </div>
        </div>

        <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#B6C948] text-sm font-medium">Open Taken Chiel</p>
              <p className="text-[#8BAE5A] text-2xl font-bold">{allTasks.filter(t => t.assigned_to === 'Chiel' && t.status === 'pending').length}</p>
            </div>
            <div className="w-12 h-12 bg-[#3A4D23] rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-[#8BAE5A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
              <input
                type="text"
                placeholder="Zoeken in taken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
              />
            </div>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority} className="bg-[#181F17] text-[#8BAE5A]">{priority}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            {statuses.map(status => (
              <option key={status} value={status} className="bg-[#181F17] text-[#8BAE5A]">{status}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            {categories.map(category => (
              <option key={category} value={category} className="bg-[#181F17] text-[#8BAE5A]">{category}</option>
            ))}
          </select>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            {assignees.map(assignee => (
              <option key={assignee} value={assignee} className="bg-[#181F17] text-[#8BAE5A]">{assignee}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23]">
        <AdminTable
          headers={tableHeaders}
          data={tableData}
          loading={loadingTasks}
          emptyMessage="Geen taken gevonden"
        />
      </div>

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3A4D23]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Taak Bewerken</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
                className="text-[#B6C948] hover:text-[#8BAE5A]"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Toegewezen aan *</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecteer persoon</option>
                    <option value="Rick">Rick (Content & Video's)</option>
                    <option value="Chiel">Chiel (Design & Development)</option>
                    <option value="Development Team">Development Team</option>
                    <option value="Frontend Team">Frontend Team</option>
                    <option value="Backend Team">Backend Team</option>
                    <option value="QA Team">QA Team</option>
                    <option value="Content Team">Content Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="development">Development</option>
                    <option value="content">Content</option>
                    <option value="video">Video's</option>
                    <option value="nutrition">Voedingsplannen</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Laag</option>
                    <option value="medium">Medium</option>
                    <option value="high">Hoog</option>
                    <option value="critical">Kritiek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Open</option>
                    <option value="in_progress">Bezig</option>
                    <option value="completed">Voltooid</option>
                    <option value="blocked">Geblokkeerd</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-[#B6C948] border border-[#3A4D23] rounded-lg hover:bg-[#181F17]"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] disabled:opacity-50 font-semibold"
                >
                  {isLoading ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#3A4D23]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Nieuwe Taak Toevoegen</h2>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-[#B6C948] hover:text-[#8BAE5A]"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Toegewezen aan *</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecteer persoon</option>
                    <option value="Rick">Rick (Content & Video's)</option>
                    <option value="Chiel">Chiel (Design & Development)</option>
                    <option value="Development Team">Development Team</option>
                    <option value="Frontend Team">Frontend Team</option>
                    <option value="Backend Team">Backend Team</option>
                    <option value="QA Team">QA Team</option>
                    <option value="Content Team">Content Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="development">Development</option>
                    <option value="content">Content</option>
                    <option value="video">Video's</option>
                    <option value="nutrition">Voedingsplannen</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Laag</option>
                    <option value="medium">Medium</option>
                    <option value="high">Hoog</option>
                    <option value="critical">Kritiek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Open</option>
                    <option value="in_progress">Bezig</option>
                    <option value="completed">Voltooid</option>
                    <option value="blocked">Geblokkeerd</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B6C948] mb-1">Deadline *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-[#B6C948] border border-[#3A4D23] rounded-lg hover:bg-[#181F17]"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAddNewTask}
                  disabled={addingTask}
                  className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] disabled:opacity-50 font-semibold"
                >
                  {addingTask ? 'Toevoegen...' : 'Toevoegen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 