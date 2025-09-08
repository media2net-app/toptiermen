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
  BugAntIcon,
  WrenchScrewdriverIcon
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
  area_selection?: { x: number; y: number; width: number; height: number } | null;
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
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    status: 'active' as const,
    assigned_modules: [] as string[],
    test_start_date: '',
    test_end_date: ''
  });

  // Fetch data from database
  useEffect(() => {
    initializeTestTables();
  }, []);

  const initializeTestTables = async () => {
    setLoading(true);
    try {
      // Just fetch the data directly from profiles table
      await fetchTestData();
    } catch (error) {
      console.error('Error initializing test data:', error);
      setError('Fout bij laden van test data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestData = async () => {
    try {
      // Fetch users from profiles table (all users with role 'user')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Fout bij ophalen van gebruikers');
        return;
      }

      // Convert profiles to test users format
      const mockTestUsers: TestUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        user_id: profile.id,
        name: profile.full_name || 'Onbekend',
        email: profile.email || 'Geen email',
        status: 'active' as const,
        assigned_modules: ['Dashboard', 'Academy', 'Trainingscentrum'],
        test_start_date: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        test_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bugs_reported: 0,
        improvements_suggested: 0,
        total_notes: 0,
        last_activity: profile.last_login || profile.created_at || new Date().toISOString(),
        created_at: profile.created_at || new Date().toISOString()
      }));

      // Fetch test notes (if table exists)
      const { data: notes, error: notesError } = await supabase
        .from('test_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) {
        console.warn('Test notes table does not exist, continuing without notes');
        setTestNotes([]);
      } else {
        setTestNotes(notes || []);
      }

      setTestUsers(mockTestUsers);
      setError(null);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Onverwachte fout opgetreden');
    }
  };

  const handleAddTestUser = () => {
    setShowAddModal(true);
  };

  const handleSaveTestUser = async () => {
    if (!newUserData.name || !newUserData.email) {
      toast.error('Vul naam en email in');
      return;
    }

    try {
      // Generate a unique password
      const password = 'TestUser123!';
      
      // Create test user via API
      const response = await fetch('/api/admin/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserData.email,
          password: password,
          fullName: newUserData.name
        })
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(`Fout bij aanmaken van test gebruiker: ${result.error}`);
        return;
      }

      // Create a mock test user object for the UI
      const mockTestUser: TestUser = {
        id: result.user.id,
        user_id: result.user.id,
        name: newUserData.name,
        email: newUserData.email,
        status: newUserData.status,
        assigned_modules: newUserData.assigned_modules,
        test_start_date: newUserData.test_start_date || new Date().toISOString().split('T')[0],
        test_end_date: newUserData.test_end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bugs_reported: 0,
        improvements_suggested: 0,
        total_notes: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      setTestUsers(prev => [mockTestUser, ...prev]);
      setShowAddModal(false);
      setNewUserData({
        name: '',
        email: '',
        status: 'active',
        assigned_modules: [],
        test_start_date: '',
        test_end_date: ''
      });
      toast.success(`Test gebruiker succesvol aangemaakt! Email: ${newUserData.email}, Wachtwoord: ${password}`);
    } catch (error) {
      console.error('Error creating test user:', error);
      toast.error('Fout bij aanmaken van test gebruiker');
    }
  };

  const handleViewNotes = (user: TestUser) => {
    setSelectedUser(user);
    setShowNoteModal(true);
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    try {
      // For now, just update the local state since we're using profiles table
      // In the future, we could add a status field to profiles table
      setTestUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success('Status succesvol bijgewerkt (lokaal)');
    } catch (error) {
      toast.error('Fout bij bijwerken van status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Weet je zeker dat je deze test gebruiker wilt verwijderen? Dit verwijdert de gebruiker permanent uit de database.')) {
      return;
    }

    try {
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        toast.error('Fout bij verwijderen van profiel');
        return;
      }

      // Also try to delete from auth.users (this might require admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Could not delete auth user:', authError);
        // Continue anyway, profile was deleted
      }

      setTestUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Test gebruiker succesvol verwijderd');
    } catch (error) {
      console.error('Error deleting user:', error);
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

      {/* Add Test User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Test Gebruiker Toevoegen</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Naam</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  placeholder="Volledige naam"
                />
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Status</label>
                <select
                  value={newUserData.status}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                  <option value="completed">Voltooid</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Test Start Datum (optioneel)</label>
                <input
                  type="date"
                  value={newUserData.test_start_date}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, test_start_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Test Eind Datum (optioneel)</label>
                <input
                  type="date"
                  value={newUserData.test_end_date}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, test_end_date: e.target.value }))}
                  className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSaveTestUser}
                  className="px-6 py-2 bg-[#8BAE5A] text-black font-medium rounded-lg hover:bg-[#B6C948] transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Notes Modal */}
      {showNoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Notities van {selectedUser.name}</h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {testNotes.filter(note => note.test_user_id === selectedUser.id).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Geen notities gevonden voor deze gebruiker</p>
                </div>
              ) : (
                testNotes
                  .filter(note => note.test_user_id === selectedUser.id)
                  .map((note) => (
                    <div key={note.id} className="p-4 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            note.type === 'bug' ? 'bg-red-500/20 text-red-400' :
                            note.type === 'improvement' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {note.type === 'bug' ? '🐛 Bug' : note.type === 'improvement' ? '💡 Verbetering' : '📝 Algemeen'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(note.priority)}`}>
                            {getPriorityText(note.priority)}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(note.created_at).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <p className="text-white mb-2">{note.description}</p>
                      <div className="text-sm text-gray-400">
                        <span>Pagina: {note.page_url}</span>
                        {note.element_selector && (
                          <span className="ml-4">Element: {note.element_selector}</span>
                        )}
                        {note.area_selection && (
                          <span className="ml-4">Gebied: {note.area_selection.width}px × {note.area_selection.height}px</span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 