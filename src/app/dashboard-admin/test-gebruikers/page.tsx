'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import { AdminCard, AdminButton } from '@/components/admin';
import { toast } from 'react-hot-toast';

interface TestUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'completed';
  assigned_modules: string[];
  test_start_date: string;
  test_end_date: string;
  bugs_reported: number;
  improvements_suggested: number;
  total_notes: number;
  last_activity: string;
  created_at: string;
}

interface TestNote {
  id: string;
  test_user_id: string;
  type: 'bug' | 'improvement' | 'general';
  page_url: string;
  element_selector: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
}

export default function TestGebruikers() {
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [testNotes, setTestNotes] = useState<TestNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null);
  const [selectedNote, setSelectedNote] = useState<TestNote | null>(null);

  // Mock data for now
  useEffect(() => {
    const mockTestUsers: TestUser[] = [
      {
        id: '1',
        user_id: 'user_1',
        name: 'Jan Jansen',
        email: 'jan.jansen@test.com',
        status: 'active',
        assigned_modules: ['Academy', 'Trainingscentrum', 'Social Feed'],
        test_start_date: '2024-08-22',
        test_end_date: '2024-08-29',
        bugs_reported: 3,
        improvements_suggested: 2,
        total_notes: 5,
        last_activity: '2024-08-22T14:30:00Z',
        created_at: '2024-08-20T10:00:00Z'
      },
      {
        id: '2',
        user_id: 'user_2',
        name: 'Piet Peters',
        email: 'piet.peters@test.com',
        status: 'active',
        assigned_modules: ['Boekenkamer', 'Badges & Rangen'],
        test_start_date: '2024-08-22',
        test_end_date: '2024-08-29',
        bugs_reported: 1,
        improvements_suggested: 4,
        total_notes: 5,
        last_activity: '2024-08-22T16:45:00Z',
        created_at: '2024-08-20T11:00:00Z'
      },
      {
        id: '3',
        user_id: 'user_3',
        name: 'Klaas Klaassen',
        email: 'klaas.klaassen@test.com',
        status: 'inactive',
        assigned_modules: ['Voedingsplannen', 'Evenementenbeheer'],
        test_start_date: '2024-08-22',
        test_end_date: '2024-08-29',
        bugs_reported: 0,
        improvements_suggested: 0,
        total_notes: 0,
        last_activity: '2024-08-21T09:15:00Z',
        created_at: '2024-08-20T12:00:00Z'
      }
    ];

    const mockTestNotes: TestNote[] = [
      {
        id: '1',
        test_user_id: '1',
        type: 'bug',
        page_url: '/dashboard/academy',
        element_selector: '.lesson-card',
        description: 'Video player laadt niet correct op mobiele apparaten',
        priority: 'high',
        status: 'open',
        created_at: '2024-08-22T14:30:00Z',
        updated_at: '2024-08-22T14:30:00Z'
      },
      {
        id: '2',
        test_user_id: '1',
        type: 'improvement',
        page_url: '/dashboard/trainingscentrum',
        element_selector: '.exercise-list',
        description: 'Filter opties zouden handig zijn voor oefeningen',
        priority: 'medium',
        status: 'open',
        created_at: '2024-08-22T15:20:00Z',
        updated_at: '2024-08-22T15:20:00Z'
      },
      {
        id: '3',
        test_user_id: '2',
        type: 'bug',
        page_url: '/dashboard/boekenkamer',
        element_selector: '.book-card',
        description: 'Boek covers worden niet geladen',
        priority: 'critical',
        status: 'in_progress',
        created_at: '2024-08-22T16:45:00Z',
        updated_at: '2024-08-22T16:45:00Z'
      }
    ];

    setTestUsers(mockTestUsers);
    setTestNotes(mockTestNotes);
    setLoading(false);
  }, []);

  const filteredUsers = testUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalUsers: testUsers.length,
    activeUsers: testUsers.filter(u => u.status === 'active').length,
    inactiveUsers: testUsers.filter(u => u.status === 'inactive').length,
    completedUsers: testUsers.filter(u => u.status === 'completed').length,
    totalBugs: testNotes.filter(n => n.type === 'bug').length,
    totalImprovements: testNotes.filter(n => n.type === 'improvement').length,
    openIssues: testNotes.filter(n => n.status === 'open').length,
    criticalIssues: testNotes.filter(n => n.priority === 'critical').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'inactive': return 'Inactief';
      case 'completed': return 'Voltooid';
      default: return 'Onbekend';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Kritiek';
      case 'high': return 'Hoog';
      case 'medium': return 'Medium';
      case 'low': return 'Laag';
      default: return 'Onbekend';
    }
  };

  const handleAddTestUser = () => {
    setShowAddModal(true);
  };

  const handleViewNotes = (user: TestUser) => {
    setSelectedUser(user);
    setShowNoteModal(true);
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    setTestUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`Status van ${testUsers.find(u => u.id === userId)?.name} gewijzigd naar ${getStatusText(newStatus)}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Test Gebruikers</h1>
          <p className="text-[#B6C948] mt-2">
            Beheer test gebruikers voor platform testing vanaf 22 Augustus 2024
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AdminButton 
            variant="primary" 
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={handleAddTestUser}
          >
            Nieuwe Test Gebruiker
          </AdminButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard title="Totaal Test Gebruikers" icon={<UserIcon className="w-6 h-6" />}>
          <div className="text-2xl font-bold text-[#8BAE5A]">{stats.totalUsers}</div>
          <div className="text-sm text-gray-400">Geregistreerd voor testing</div>
        </AdminCard>
        <AdminCard title="Actieve Testers" icon={<CheckCircleIcon className="w-6 h-6" />}>
          <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
          <div className="text-sm text-gray-400">Momenteel actief</div>
        </AdminCard>
        <AdminCard title="Bugs Gerapporteerd" icon={<BugAntIcon className="w-6 h-6" />}>
          <div className="text-2xl font-bold text-red-400">{stats.totalBugs}</div>
          <div className="text-sm text-gray-400">{stats.criticalIssues} kritiek</div>
        </AdminCard>
        <AdminCard title="Verbeteringen" icon={<DocumentTextIcon className="w-6 h-6" />}>
          <div className="text-2xl font-bold text-blue-400">{stats.totalImprovements}</div>
          <div className="text-sm text-gray-400">Suggesties ontvangen</div>
        </AdminCard>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek test gebruikers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
        >
          <option value="all">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="inactive">Inactief</option>
          <option value="completed">Voltooid</option>
        </select>
        <AdminButton 
          variant="secondary" 
          icon={<ArrowPathIcon className="w-4 h-4" />}
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
        >
          Reset
        </AdminButton>
      </div>

      {/* Test Users Table */}
      <AdminCard title="Test Gebruikers Overzicht" icon={<UserIcon className="w-6 h-6" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#3A4D23]">
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Naam</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Modules</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Bugs</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Verbeteringen</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Laatste Activiteit</th>
                <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#3A4D23]/50 hover:bg-[#232D1A]/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{user.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {user.assigned_modules.slice(0, 2).map((module, index) => (
                        <span key={index} className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded">
                          {module}
                        </span>
                      ))}
                      {user.assigned_modules.length > 2 && (
                        <span className="px-2 py-1 bg-[#3A4D23] text-[#8BAE5A] text-xs rounded">
                          +{user.assigned_modules.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-red-400 font-medium">{user.bugs_reported}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-blue-400 font-medium">{user.improvements_suggested}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">
                    {new Date(user.last_activity).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        icon={<EyeIcon className="w-4 h-4" />}
                        onClick={() => handleViewNotes(user)}
                      >
                        Notities
                      </AdminButton>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                        className="px-2 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-xs text-white focus:outline-none"
                      >
                        <option value="active">Actief</option>
                        <option value="inactive">Inactief</option>
                        <option value="completed">Voltooid</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Test Notes Overview */}
      <AdminCard title="Recente Test Notities" icon={<DocumentTextIcon className="w-6 h-6" />}>
        <div className="space-y-4">
          {testNotes.slice(0, 5).map((note) => (
            <div key={note.id} className="flex items-center justify-between p-4 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  note.type === 'bug' ? 'bg-red-400' : 'bg-blue-400'
                }`}></div>
                <div>
                  <div className="font-medium text-white">
                    {note.type === 'bug' ? '🐛 Bug' : '💡 Verbetering'} - {note.description.substring(0, 50)}...
                  </div>
                  <div className="text-sm text-gray-400">
                    {testUsers.find(u => u.id === note.test_user_id)?.name} • {note.page_url}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(note.priority)}`}>
                  {getPriorityText(note.priority)}
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(note.created_at).toLocaleDateString('nl-NL')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
} 