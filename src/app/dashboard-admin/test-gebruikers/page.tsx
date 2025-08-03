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
import { supabase } from '@/lib/supabase';

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

  // Fetch data from database
  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    setLoading(true);
    try {
      // Fetch test users
      const { data: users, error: usersError } = await supabase
        .from('test_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching test users:', usersError);
        setError('Fout bij ophalen van test gebruikers');
        return;
      }

      // Fetch test notes
      const { data: notes, error: notesError } = await supabase
        .from('test_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching test notes:', notesError);
        setError('Fout bij ophalen van test notities');
        return;
      }

      setTestUsers(users || []);
      setTestNotes(notes || []);
      setError(null);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Onverwachte fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = testUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'inactive': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
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
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
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

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    try {
      const { error } = await supabase
        .from('test_users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        toast.error('Fout bij bijwerken van status');
        return;
      }

      setTestUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success('Status succesvol bijgewerkt');
    } catch (error) {
      toast.error('Fout bij bijwerken van status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Weet je zeker dat je deze test gebruiker wilt verwijderen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('test_users')
        .delete()
        .eq('id', userId);

      if (error) {
        toast.error('Fout bij verwijderen van test gebruiker');
        return;
      }

      setTestUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Test gebruiker succesvol verwijderd');
    } catch (error) {
      toast.error('Fout bij verwijderen van test gebruiker');
    }
  };

  const handleNoteStatusChange = async (noteId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('test_notes')
        .update({ status: newStatus })
        .eq('id', noteId);

      if (error) {
        toast.error('Fout bij bijwerken van notitie status');
        return;
      }

      setTestNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, status: newStatus } : note
      ));
      toast.success('Notitie status succesvol bijgewerkt');
    } catch (error) {
      toast.error('Fout bij bijwerken van notitie status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#B6C948]">Laden van test gebruikers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <AdminButton onClick={fetchTestData} icon={<ArrowPathIcon className="w-4 h-4" />}>
            Opnieuw Proberen
          </AdminButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Test Gebruikers</h1>
          <p className="text-[#B6C948]">Beheer test gebruikers en hun feedback</p>
        </div>
        
        <div className="flex gap-3">
          <AdminButton
            onClick={fetchTestData}
            icon={<ArrowPathIcon className="w-4 h-4" />}
            variant="secondary"
          >
            Vernieuwen
          </AdminButton>
          
          <AdminButton
            onClick={handleAddTestUser}
            icon={<PlusIcon className="w-4 h-4" />}
            variant="primary"
          >
            Test Gebruiker Toevoegen
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Totaal Test Gebruikers</p>
              <p className="text-2xl font-bold text-white">{testUsers.length}</p>
            </div>
            <UserIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Actieve Testers</p>
              <p className="text-2xl font-bold text-white">
                {testUsers.filter(u => u.status === 'active').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Totaal Notities</p>
              <p className="text-2xl font-bold text-white">{testNotes.length}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Open Issues</p>
              <p className="text-2xl font-bold text-white">
                {testNotes.filter(n => n.status === 'open').length}
              </p>
            </div>
            <BugAntIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op naam of email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:border-[#8BAE5A] focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
          >
            <option value="all">Alle Statussen</option>
            <option value="active">Actief</option>
            <option value="inactive">Inactief</option>
            <option value="completed">Voltooid</option>
          </select>
        </div>
      </div>

      {/* Test Users List */}
      <AdminCard title="Test Gebruikers" icon={<UserIcon className="w-6 h-6" />}>
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Geen test gebruikers gevonden</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8BAE5A] rounded-full flex items-center justify-center text-black font-bold">
                    {user.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusText(user.status)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-[#B6C948] mb-2">
                      {user.email}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Modules: {user.assigned_modules.join(', ')}</span>
                      <span>Bugs: {user.bugs_reported}</span>
                      <span>Verbeteringen: {user.improvements_suggested}</span>
                      <span>Notities: {user.total_notes}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewNotes(user)}
                    icon={<EyeIcon className="w-4 h-4" />}
                  >
                    Notities
                  </AdminButton>
                  
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value as any)}
                    className="px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-xs focus:border-[#8BAE5A] focus:outline-none"
                  >
                    <option value="active">Actief</option>
                    <option value="inactive">Inactief</option>
                    <option value="completed">Voltooid</option>
                  </select>
                  
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    icon={<TrashIcon className="w-4 h-4" />}
                    className="text-red-400 hover:text-red-300"
                  >
                    Verwijderen
                  </AdminButton>
                </div>
              </div>
            ))
          )}
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
                <select
                  value={note.status}
                  onChange={(e) => handleNoteStatusChange(note.id, e.target.value as any)}
                  className="px-2 py-1 bg-[#181F17] border border-[#3A4D23] rounded text-white text-xs focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
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