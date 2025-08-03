'use client';
import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  KeyIcon,
  StarIcon,
  NoSymbolIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UserPlusIcon,
  TrophyIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useDebug } from '@/contexts/DebugContext';
import { AdminCard, AdminStatsCard, AdminTable, AdminButton } from '@/components/admin';
import { supabase } from '@/lib/supabase';

const ranks = ['Rookie', 'Warrior', 'Elite', 'Legend'];
const statuses = ['active', 'inactive', 'suspended'];


export default function Ledenbeheer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('Alle Rangen');
  const [selectedStatus, setSelectedStatus] = useState('Alle Statussen');
  const [selectedMember, setSelectedMember] = useState<number | string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'activity'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    mainGoal: '',
    rank: '',
    status: '',
    adminNotes: ''
  });
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    full_name: '',
    username: '',
    rank: 'Rookie',
    status: 'active',
    password: '',
    confirmPassword: ''
  });

  // Fetch members function
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      console.log('🔄 Fetching members from database...');
      
      // Fetch users and profiles separately since there's no foreign key relationship
      const [usersResult, profilesResult] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);
      
      if (usersResult.error) {
        console.error('Error fetching users:', usersResult.error);
        toast.error('Fout bij het laden van leden', {
          position: "top-right",
          duration: 3000,
        });
        return;
      }
      
      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
        // Continue with just users data
      }
      
      const users = usersResult.data || [];
      const profiles = profilesResult.data || [];
      
      console.log('📊 Fetched users:', users.length, 'profiles:', profiles.length);
      
      // Create a map of profiles by user ID for quick lookup
      const profilesMap = new Map();
      profiles.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      // Combine user and profile data
      const combinedData = users.map(user => {
        const profile = profilesMap.get(user.id);
        const combined = {
          ...user,
          ...(profile || {}),
          // Use profile data as primary, fallback to user data
          full_name: profile?.full_name || user.full_name,
          username: profile?.display_name || user.username, // Use display_name from profile as username
          rank: profile?.rank || user.rank || 'Rookie',
          avatar_url: profile?.avatar_url,
          bio: profile?.bio,
          main_goal: profile?.main_goal,
          points: profile?.points || 0,
          missions_completed: profile?.missions_completed || 0,
          posts: profile?.posts || 0,
          badges: profile?.badges || 0
        };
        
        // Debug log for specific users
        if (user.email === 'henk@media2net.nl' || user.email === 'jeroen@media2net.nl') {
          console.log(`🔍 ${user.email} data in fetchMembers:`, {
            user: { full_name: user.full_name, username: user.username },
            profile: { full_name: profile?.full_name, display_name: profile?.display_name },
            combined: { full_name: combined.full_name, username: combined.username }
          });
        }
        
        return combined;
      });
      
      console.log('Combined member details:', combinedData.map(m => ({
        id: m.id,
        email: m.email,
        full_name: m.full_name,
        username: m.username,
        rank: m.rank,
        status: m.status,
        created_at: m.created_at,
        avatar_url: m.avatar_url
      })));
      
      console.log('📊 Setting allMembers with', combinedData.length, 'members');
      
      setAllMembers(combinedData);
    } catch (err) {
      console.error('Exception fetching members:', err);
      toast.error('Fout bij het laden van leden', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Haal leden op uit Supabase
  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = (member.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRank = selectedRank === 'Alle Rangen' || member.rank === selectedRank;
    const matchesStatus = selectedStatus === 'Alle Statussen' || member.status === selectedStatus;
    return matchesSearch && matchesRank && matchesStatus;
  });

  // Calculate statistics
  const totalMembers = allMembers.length;
  const activeMembers = allMembers.filter(m => m.status === 'active').length;
  const newMembersThisMonth = allMembers.filter(m => {
    const createdAt = new Date(m.created_at);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;
  const eliteMembers = allMembers.filter(m => m.rank === 'Elite' || m.rank === 'Legend').length;
  const membersWithBadges = allMembers.filter(m => (m.badges || 0) > 5).length;

  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRank, selectedStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'inactive': return 'Inactief';
      case 'suspended': return 'Geschorst';
      default: return status;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite': return 'text-[#C49C48]';
      case 'Legend': return 'text-purple-400';
      case 'Warrior': return 'text-[#8BAE5A]';
      case 'Rookie': return 'text-[#B6C948]';
      default: return 'text-[#B6C948]';
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.full_name || '',
      username: member.username || '',
      bio: member.bio || '',
      mainGoal: member.main_goal || '',
      rank: member.rank || '',
      status: member.status || '',
      adminNotes: member.admin_notes || ''
    });
    setShowEditModal(true);
    setSelectedMember(null); // Close dropdown
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Saving member updates...', { editingMember, formData });
      // Update users table
      const userUpdates: any = {
        full_name: formData.name,
        username: formData.username,
        status: formData.status,
        admin_notes: formData.adminNotes
      };
      
      // Update profiles table
      const profileUpdates: any = {
        full_name: formData.name,
        display_name: formData.username,
        bio: formData.bio,
        main_goal: formData.mainGoal,
        rank: formData.rank
      };
      
      // Update both tables
      const [userResult, profileResult] = await Promise.all([
        supabase.from('users').update(userUpdates).eq('id', editingMember.id),
        supabase.from('profiles').update(profileUpdates).eq('id', editingMember.id)
      ]);
      
      if (userResult.error) {
        console.error('❌ Error updating users table:', userResult.error);
        throw userResult.error;
      }
      if (profileResult.error) {
        console.error('❌ Error updating profiles table:', profileResult.error);
        throw profileResult.error;
      }
      
      console.log('✅ Database updates successful:', { userResult, profileResult });
      
      // Update the local state immediately
      setAllMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === editingMember.id 
            ? {
                ...member,
                full_name: formData.name,
                username: formData.username,
                display_name: formData.username, // Also update display_name for consistency
                status: formData.status,
                admin_notes: formData.adminNotes,
                bio: formData.bio,
                main_goal: formData.mainGoal,
                rank: formData.rank
              }
            : member
        )
      );
      
      toast.success(`Profiel van ${formData.name} succesvol bijgewerkt`, {
        position: "top-right",
        duration: 3000,
      });
      setShowEditModal(false);
      setEditingMember(null);
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het opslaan', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Wachtwoord reset e-mail verzonden', {
        position: "top-right",
        duration: 3000,
      });
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het verzenden van de e-mail', {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  const handleAddNewUser = async () => {
    // Validate form data
    if (!newUserData.email || !newUserData.full_name || !newUserData.password) {
      toast.error('Vul alle verplichte velden in', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    if (newUserData.password.length < 6) {
      toast.error('Wachtwoord moet minimaal 6 karakters bevatten', {
        position: "top-right",
        duration: 3000,
      });
      return;
    }

    setAddingUser(true);
    try {
      // Call the API route to create user
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserData.email,
          full_name: newUserData.full_name,
          username: newUserData.username,
          rank: newUserData.rank,
          status: newUserData.status,
          password: newUserData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Gebruiker ${newUserData.full_name} succesvol aangemaakt!`, {
          position: "top-right",
          duration: 3000,
        });

        // Reset form and close modal
        setNewUserData({
          email: '',
          full_name: '',
          username: '',
          rank: 'Rookie',
          status: 'active',
          password: '',
          confirmPassword: ''
        });
        setShowAddUserModal(false);

        // Refresh members list
        fetchMembers();
      } else {
        throw new Error(data.error || 'Er is een fout opgetreden bij het aanmaken van de gebruiker');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Er is een fout opgetreden bij het aanmaken van de gebruiker', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setAddingUser(false);
    }
  };

  const handleOnboardingReset = async () => {
    if (!editingMember?.id) return;

    if (!confirm(`⚠️ VOLLEDIGE RESET: Weet je zeker dat je gebruiker ${editingMember.name || editingMember.email} volledig wilt resetten?\n\nDit zal ALLE data wissen:\n• Onboarding voortgang (stap 0)\n• Missies (database + bestanden)\n• Training schemas & voortgang\n• Voedingsplannen & voortgang\n• Challenges & streaks\n• XP punten & achievements\n• Forum posts\n• Voorkeuren\n• Badges & rangen\n• Dagelijkse/weekelijkse voortgang\n• Doelen & gewoontes\n• Workout sessies\n• Gebruikersstatistieken\n\nDe gebruiker start weer vanaf stap 0 en kan de volledige onboarding opnieuw doorlopen.`)) {
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/reset-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingMember.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Gebruiker volledig gereset! Alle data gewist. Gebruiker kan nu vanaf stap 0 beginnen.', {
          position: "top-right",
          duration: 5000,
        });
        
        // Refresh members list
        fetchMembers();
        setShowEditModal(false);
      } else {
        toast.error(data.error || 'Er is een fout opgetreden bij het resetten', {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      toast.error('Er is een fout opgetreden bij het resetten', {
        position: "top-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return ClockIcon;
      case 'post': return ChatBubbleLeftRightIcon;
      case 'badge': return StarIcon;
      case 'training': return UserIcon;
      case 'goal': return CheckIcon;
      case 'suspension': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  // Prepare table data for AdminTable
  const tableData = currentMembers.map(member => [
    member.full_name || 'Onbekend',
    member.email || 'Geen e-mail',
    member.rank || 'Rookie',
    getStatusText(member.status),
    member.points || 0,
    member.missions_completed || 0,
    new Date(member.created_at).toLocaleDateString('nl-NL'),
    member.last_login ? new Date(member.last_login).toLocaleDateString('nl-NL') : 'Niet beschikbaar'
  ]);

  const tableHeaders = ['Lid', 'Email', 'Rang', 'Status', 'Punten', 'Missies', 'Lid sinds', 'Laatste activiteit'];

  const renderActions = (item: any) => {
    // Find member by email (item[1] is the email)
    const member = currentMembers.find(m => m.email === item[1]);
    if (!member) return null;

    return (
      <div className="flex gap-2">
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleEditMember(member)}
          icon={<EyeIcon className="w-4 h-4" />}
        >
          Bekijken
        </AdminButton>
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleEditMember(member)}
          icon={<PencilIcon className="w-4 h-4" />}
        >
          Bewerken
        </AdminButton>
        <AdminButton
          variant="danger"
          size="sm"
          onClick={async () => {
            if (confirm(`⚠️ VOLLEDIGE RESET: Weet je zeker dat je gebruiker ${member.full_name || member.email} volledig wilt resetten?`)) {
              try {
                const response = await fetch('/api/admin/reset-onboarding', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: member.id }),
                });
                if (response.ok) {
                  toast.success('✅ Gebruiker volledig gereset!');
                  fetchMembers();
                } else {
                  toast.error('Fout bij resetten');
                }
              } catch (error) {
                toast.error('Fout bij resetten');
              }
            }
          }}
          icon={<ExclamationTriangleIcon className="w-4 h-4" />}
        >
          Reset
        </AdminButton>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Ledenbeheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle leden van het Top Tier Men platform</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            {filteredMembers.length} van {allMembers.length} leden
          </span>
          {loadingMembers && (
            <span className="text-[#B6C948] text-sm">Laden...</span>
          )}
          <AdminButton 
            variant="secondary" 
            icon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={fetchMembers}
            loading={loadingMembers}
          >
            Verversen
          </AdminButton>
          <AdminButton 
            variant="primary" 
            icon={<UserPlusIcon className="w-5 h-5" />}
            onClick={() => setShowAddUserModal(true)}
          >
            Nieuwe Gebruiker Toevoegen
          </AdminButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatsCard
          title="Totaal aantal leden"
          value={totalMembers}
          icon={<UserGroupIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Nieuwe leden deze maand"
          value={newMembersThisMonth}
          icon={<UserPlusIcon className="w-8 h-8" />}
          color="blue"
        />
        <AdminStatsCard
          title="Actieve leden"
          value={activeMembers}
          icon={<ShieldCheckIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Elite leden"
          value={eliteMembers}
          icon={<TrophyIcon className="w-8 h-8" />}
          color="purple"
        />
        <AdminStatsCard
          title="Leden met badges"
          value={membersWithBadges}
          icon={<StarIcon className="w-8 h-8" />}
          color="orange"
        />
      </div>

      {/* Search and Filters */}
      <AdminCard title="Filters & Zoeken" icon={<FunnelIcon className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op naam of e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
            />
          </div>

          {/* Rank Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Rangen', ...ranks].map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Statussen', ...statuses].map(status => (
                <option key={status} value={status}>
                  {status === 'Alle Statussen' ? 'Alle Statussen' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <AdminButton variant="primary" icon={<DocumentTextIcon className="w-5 h-5" />}>
            Export CSV
          </AdminButton>
        </div>
      </AdminCard>

      {/* Members Table */}
      <AdminCard title="Leden Overzicht" icon={<UserGroupIcon className="w-6 h-6" />}>
        <AdminTable
          headers={tableHeaders}
          data={tableData}
          loading={loadingMembers}
          emptyMessage="Geen leden gevonden"
          actions={renderActions}
        />
      </AdminCard>

      {/* Pagination */}
      {allMembers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-[#B6C948] text-sm">
            Toon {filteredMembers.length} van {allMembers.length} leden
          </div>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Vorige
            </AdminButton>
            <span className="px-4 py-2 text-[#8BAE5A] font-semibold">
              {currentPage} van {totalPages}
            </span>
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Volgende
            </AdminButton>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#8BAE5A]">
                  Bewerk Profiel: {editingMember.full_name}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 pt-4">
              <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Profielgegevens
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'account'
                      ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Account & Rechten
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'activity'
                      ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Activiteit & Notities
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Tab 1: Profielgegevens */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Profile Photo Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profielfoto
                    </label>
                    <div className="flex items-center gap-4">
                      {editingMember.avatar_url ? (
                        <img 
                          src={editingMember.avatar_url} 
                          alt={editingMember.full_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#8BAE5A]/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center ${editingMember.avatar_url ? 'hidden' : ''}`}>
                        <UserIcon className="w-8 h-8 text-[#8BAE5A]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#B6C948] text-sm">
                          {editingMember.avatar_url ? 'Profielfoto geüpload' : 'Geen profielfoto'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {editingMember.avatar_url ? 'Foto wordt automatisch geladen van het profiel' : 'Gebruiker heeft nog geen profielfoto geüpload'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Volledige Naam
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio / Motto
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="Admin Actie: Hier kun je ongepaste taal corrigeren of de opmaak verbeteren."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      #1 Hoofddoel
                    </label>
                    <input
                      type="text"
                      value={formData.mainGoal}
                      onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Account & Rechten */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      value={editingMember.email}
                      disabled
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Dit veld is read-only om problemen te voorkomen.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rang
                    </label>
                    <select
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      {ranks.map(rank => (
                        <option key={rank} value={rank}>{rank}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin Actie: Hier kun je een gebruiker handmatig promoveren als beloning voor uitzonderlijke bijdragen.</p>
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {getStatusText(status)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin Actie: Deactiveer een account volledig als dat nodig is.</p>
                  </div>

                  <div className="pt-4 border-t border-[#3A4D23] space-y-3">
                    <AdminButton
                      variant="secondary"
                      onClick={handlePasswordReset}
                      icon={<KeyIcon className="w-4 h-4" />}
                    >
                      Verstuur Wachtwoord Reset E-mail
                    </AdminButton>
                    
                    <AdminButton
                      variant="danger"
                      onClick={handleOnboardingReset}
                      disabled={isLoading}
                      loading={isLoading}
                      icon={<ExclamationTriangleIcon className="w-4 h-4" />}
                    >
                      VOLLEDIGE RESET
                    </AdminButton>
                    <p className="text-xs text-red-400">
                      ⚠️ Dit wist ALLE data: missies, training, voeding, challenges, XP, badges, voortgang, etc. Gebruiker start vanaf stap 0.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Activiteit & Notities */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Recente Activiteit</h3>
                    <div className="space-y-3">
                      {editingMember.recent_activity && editingMember.recent_activity.length > 0 ? (
                        editingMember.recent_activity.map((activity: any, index: number) => {
                          const ActivityIcon = getActivityIcon(activity.type);
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-[#181F17] rounded-lg">
                              <ActivityIcon className="w-5 h-5 text-[#8BAE5A]" />
                              <div className="flex-1">
                                <p className="text-white text-sm">{activity.description}</p>
                                <p className="text-[#B6C948] text-xs">
                                  {new Date(activity.created_at).toLocaleString('nl-NL')}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 bg-[#181F17] rounded-lg text-center">
                          <ClockIcon className="w-8 h-8 text-[#8BAE5A]/50 mx-auto mb-2" />
                          <p className="text-[#B6C948] text-sm">Geen recente activiteit</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Admin Notities
                    </label>
                    <textarea
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      rows={4}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="Cruciale Functie: Hier kunnen admins interne notities over een gebruiker achterlaten die alleen voor andere admins zichtbaar zijn."
                    />
                    <p className="text-xs text-gray-500 mt-1">Voorbeeld: "Heeft op 15-06-2025 een waarschuwing ontvangen voor spam op het forum." of "Zeer waardevol lid, kandidaat voor 'Lid van de Maand'."</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#3A4D23] flex justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleSave}
                disabled={isLoading}
                loading={isLoading}
                icon={<CheckIcon className="w-4 h-4" />}
              >
                Opslaan
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#8BAE5A]">
                  Nieuwe Gebruiker Toevoegen
                </h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mailadres *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="gebruiker@voorbeeld.nl"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Volledige Naam *
                </label>
                <input
                  type="text"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Jan Jansen"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="@jan_jansen"
                />
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rang
                </label>
                <select
                  value={newUserData.rank}
                  onChange={(e) => setNewUserData({ ...newUserData, rank: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {ranks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newUserData.status}
                  onChange={(e) => setNewUserData({ ...newUserData, status: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {getStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wachtwoord *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Minimaal 6 karakters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bevestig Wachtwoord *
                </label>
                <input
                  type="password"
                  value={newUserData.confirmPassword}
                  onChange={(e) => setNewUserData({ ...newUserData, confirmPassword: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Herhaal wachtwoord"
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-[#8BAE5A] mt-0.5">
                    <InformationCircleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[#8BAE5A] font-medium mb-2">Wat gebeurt er na aanmaken?</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Gebruiker ontvangt een welkomst e-mail</li>
                      <li>• Account wordt automatisch geactiveerd</li>
                      <li>• Gebruiker start met onboarding stap 0</li>
                      <li>• Alle basis profielgegevens worden ingesteld</li>
                      <li>• Gebruiker kan direct inloggen met het wachtwoord</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#3A4D23] flex justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => setShowAddUserModal(false)}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={handleAddNewUser}
                disabled={addingUser}
                loading={addingUser}
                icon={<UserPlusIcon className="w-4 h-4" />}
              >
                Gebruiker Aanmaken
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 