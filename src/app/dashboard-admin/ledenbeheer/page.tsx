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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useDebug } from '@/contexts/DebugContext';
import DebugPanel from '@/components/DebugPanel';
import { supabase } from '@/lib/supabase';

const ranks = ['Rookie', 'Warrior', 'Elite', 'Legend'];
const statuses = ['active', 'inactive', 'suspended'];
const forumStatuses = ['active', 'muted', 'blocked'];

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
    forumStatus: '',
    status: '',
    adminNotes: ''
  });
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Haal leden op uit Supabase
  useEffect(() => {
    async function fetchMembers() {
      setLoadingMembers(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching members:', error);
          toast.error('Fout bij het laden van leden', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
        } else if (data) {
          console.log('Fetched members:', data.length, data);
          setAllMembers(data);
        }
      } catch (err) {
        console.error('Exception fetching members:', err);
        toast.error('Fout bij het laden van leden', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchMembers();
  }, []);

  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = (member.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRank = selectedRank === 'Alle Rangen' || member.rank === selectedRank;
    const matchesStatus = selectedStatus === 'Alle Statussen' || member.status === selectedStatus;
    return matchesSearch && matchesRank && matchesStatus;
  });

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
      forumStatus: member.forum_status || '',
      status: member.status || '',
      adminNotes: member.admin_notes || ''
    });
    setShowEditModal(true);
    setSelectedMember(null); // Close dropdown
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates: any = {
        full_name: formData.name,
        username: formData.username,
        bio: formData.bio,
        main_goal: formData.mainGoal,
        rank: formData.rank,
        forum_status: formData.forumStatus,
        status: formData.status,
        admin_notes: formData.adminNotes
      };
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', editingMember.id);
      if (error) throw error;
      toast.success(`Profiel van ${formData.name} succesvol bijgewerkt`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      setShowEditModal(false);
      setEditingMember(null);
      // Refresh members
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setAllMembers(data);
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het opslaan', {
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

  const handlePasswordReset = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Wachtwoord reset e-mail verzonden', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (error) {
      toast.error('Er is een fout opgetreden bij het verzenden van de e-mail', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
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
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
            <input
              type="text"
              placeholder="Zoek op naam of e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
            />
          </div>

          {/* Rank Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Rangen', ...ranks].map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Statussen', ...statuses].map(status => (
                <option key={status} value={status}>
                  {status === 'Alle Statussen' ? 'Alle Statussen' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200">
            Export CSV
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] overflow-hidden">
        {loadingMembers ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#B6C948]">Leden laden...</p>
          </div>
        ) : allMembers.length === 0 ? (
          <div className="p-8 text-center">
            <UserIcon className="w-12 h-12 text-[#8BAE5A]/50 mx-auto mb-4" />
            <p className="text-[#B6C948] text-lg mb-2">Geen leden gevonden</p>
            <p className="text-[#B6C948]/70 text-sm">Er zijn nog geen gebruikers geregistreerd in het systeem.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Lid</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">E-mail</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Rang</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Lid sinds</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Laatste activiteit</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Posts</th>
                  <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Badges</th>
                  <th className="px-6 py-4 text-center text-[#8BAE5A] font-semibold">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {currentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#181F17] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.full_name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#8BAE5A]/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center ${member.avatar_url ? 'hidden' : ''}`}>
                        <UserIcon className="w-5 h-5 text-[#8BAE5A]" />
                      </div>
                      <div>
                        <p className="text-[#8BAE5A] font-medium">{member.full_name}</p>
                        <p className="text-[#B6C948] text-sm">ID: {member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-[#B6C948]">{member.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRankColor(member.rank)} bg-[#181F17]`}>
                      {member.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)} bg-[#181F17]`}>
                      {getStatusText(member.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-[#B6C948]">
                        {new Date(member.created_at).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#B6C948] text-sm">
                      {member.last_login ? new Date(member.last_login).toLocaleDateString('nl-NL') : 'Niet beschikbaar'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#8BAE5A] font-semibold">{member.posts || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#8BAE5A] font-semibold">{member.badges || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                          className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
                        >
                          <EllipsisVerticalIcon className="w-5 h-5 text-[#B6C948]" />
                        </button>
                        
                        {selectedMember === member.id && (
                          <div className="fixed w-48 bg-[#181F17] rounded-xl border border-[#3A4D23] shadow-lg z-50" style={{right: '2rem', top: 'calc(50% + 40px)'}}>
                            <div className="py-2">
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <EyeIcon className="w-4 h-4" />
                                Bekijk Profiel
                              </button>
                              <button 
                                onClick={() => handleEditMember(member)}
                                className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2"
                              >
                                <PencilIcon className="w-4 h-4" />
                                Bewerk Gegevens
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <KeyIcon className="w-4 h-4" />
                                Reset Wachtwoord
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <StarIcon className="w-4 h-4" />
                                Promoveer/Degradeer
                              </button>
                              <button className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#232D1A] flex items-center gap-2">
                                <NoSymbolIcon className="w-4 h-4" />
                                Blokkeer Gebruiker
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Pagination */}
      {allMembers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-[#B6C948] text-sm">
            Toon {filteredMembers.length} van {allMembers.length} leden
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#181F17] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vorige
            </button>
            <span className="px-4 py-2 text-[#8BAE5A] font-semibold">
              {currentPage} van {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#181F17] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende
            </button>
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
                      Forum Status
                    </label>
                    <select
                      value={formData.forumStatus}
                      onChange={(e) => setFormData({ ...formData, forumStatus: e.target.value })}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      {forumStatuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'active' ? 'Actief' : status === 'muted' ? 'Gedempt (Muted)' : 'Geblokkeerd'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Admin Actie: Dit is de directe link naar de moderatie-tools. Hier kun je een gebruiker tijdelijk het zwijgen opleggen of volledig blokkeren van het forum.</p>
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

                  <div className="pt-4 border-t border-[#3A4D23]">
                    <button
                      onClick={handlePasswordReset}
                      className="px-4 py-2 bg-[#181F17] text-[#8BAE5A] rounded-lg border border-[#3A4D23] hover:bg-[#232D1A] transition-colors flex items-center gap-2"
                    >
                      <KeyIcon className="w-4 h-4" />
                      Verstuur Wachtwoord Reset E-mail
                    </button>
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
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg font-medium hover:bg-[#7A9D4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0A0F0A] border-t-transparent rounded-full animate-spin"></div>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Opslaan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      <DebugPanel 
        data={{
          'Totaal aantal leden': allMembers.length,
          'Actieve leden': allMembers.filter(m => m.status === 'active').length,
          'Inactieve leden': allMembers.filter(m => m.status === 'inactive').length,
          'Geschorste leden': allMembers.filter(m => m.status === 'suspended').length,
          'Leden met profielfoto': allMembers.filter(m => m.avatar_url).length,
          'Huidige pagina': currentPage,
          'Leden per pagina': itemsPerPage,
          'Zoekterm': searchTerm,
          'Gefilterde leden': filteredMembers.length,
          'Geselecteerde filters': {
            status: selectedStatus,
            rank: selectedRank,
            forumStatus: selectedRank
          },
          'Leden details': allMembers.map(m => ({
            id: m.id,
            name: m.full_name,
            email: m.email,
            status: m.status,
            rank: m.rank,
            hasAvatar: !!m.avatar_url,
            created: m.created_at
          })),
          'Bewerkte lid': editingMember ? {
            id: editingMember.id,
            name: editingMember.full_name,
            email: editingMember.email,
            status: editingMember.status,
            avatar_url: editingMember.avatar_url
          } : null
        }}
        title="Ledenbeheer Debug Info"
      />
    </div>
  );
} 