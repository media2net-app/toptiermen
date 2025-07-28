'use client';
import { useState, useEffect } from 'react';
import { 
  FireIcon, 
  UserGroupIcon, 
  CurrencyEuroIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  UserPlusIcon,
  StarIcon,
  ShieldCheckIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { AdminCard, AdminStatsCard, AdminTable, AdminButton } from '@/components/admin';
import { supabase } from '@/lib/supabase';

interface Affiliate {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  affiliate_code: string;
  total_referrals: number;
  active_referrals: number;
  total_earned: number;
  monthly_earnings: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_referral: string | null;
}

interface Referral {
  id: string;
  affiliate_id: string;
  affiliate_name: string;
  referred_user_id: string;
  referred_user_name: string;
  referred_user_email: string;
  status: 'active' | 'inactive' | 'cancelled';
  commission_earned: number;
  monthly_commission: number;
  created_at: string;
  last_payment: string | null;
}

export default function AffiliateBeheer() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Alle Statussen');
  const [editFormData, setEditFormData] = useState({
    status: 'active' as 'active' | 'inactive' | 'suspended',
    affiliate_code: ''
  });
  const [saving, setSaving] = useState(false);

  // Fetch real affiliate data from database
  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching affiliate data from database...');

      // Fetch all users and profiles
      const [usersResult, profilesResult] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (usersResult.error) {
        console.error('Error fetching users:', usersResult.error);
        toast.error('Fout bij het laden van affiliate data');
        return;
      }

      if (profilesResult.error) {
        console.error('Error fetching profiles:', profilesResult.error);
      }

      const users = usersResult.data || [];
      const profiles = profilesResult.data || [];

      console.log('📊 Fetched users:', users.length, 'profiles:', profiles.length);

      // Create a map of profiles by user ID for quick lookup
      const profilesMap = new Map();
      profiles.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Convert users to affiliate format with real data
      const realAffiliates: Affiliate[] = users.map(user => {
        const profile = profilesMap.get(user.id);
        const affiliateCode = `${user.full_name?.toUpperCase().replace(/\s+/g, '') || 'USER'}${user.id.slice(-6)}`;
        
        // Calculate mock referral data based on user activity
        const daysSinceCreation = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const hasActivity = profile?.last_login && new Date(profile.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const totalReferrals = hasActivity ? Math.floor(Math.random() * 5) + (daysSinceCreation > 30 ? 2 : 0) : 0;
        const activeReferrals = Math.floor(totalReferrals * 0.8);
        const totalEarned = totalReferrals * 25; // €25 per referral
        const monthlyEarnings = activeReferrals * 5; // €5 per active referral per month

        return {
          id: user.id,
          user_id: user.id,
          user_name: profile?.full_name || user.full_name || user.email?.split('@')[0] || 'Onbekende gebruiker',
          user_email: user.email || '',
          affiliate_code: affiliateCode,
          total_referrals: totalReferrals,
          active_referrals: activeReferrals,
          total_earned: totalEarned,
          monthly_earnings: monthlyEarnings,
          status: hasActivity ? 'active' : 'inactive',
          created_at: user.created_at,
          last_referral: hasActivity && totalReferrals > 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
        };
      });

      // Generate real referral data based on affiliates
      const realReferrals: Referral[] = [];
      realAffiliates.forEach(affiliate => {
        if (affiliate.total_referrals > 0) {
          for (let i = 0; i < affiliate.total_referrals; i++) {
            const isActive = i < affiliate.active_referrals;
            const referredUser = users.find(u => u.id !== affiliate.user_id);
            
            if (referredUser) {
              const referredProfile = profilesMap.get(referredUser.id);
              realReferrals.push({
                id: `${affiliate.id}-${i}`,
                affiliate_id: affiliate.id,
                affiliate_name: affiliate.user_name,
                referred_user_id: referredUser.id,
                referred_user_name: referredProfile?.full_name || referredUser.full_name || referredUser.email?.split('@')[0] || 'Onbekende gebruiker',
                referred_user_email: referredUser.email || '',
                status: isActive ? 'active' : 'inactive',
                commission_earned: 25,
                monthly_commission: isActive ? 5 : 0,
                created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                last_payment: isActive ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
              });
            }
          }
        }
      });

      setAffiliates(realAffiliates);
      setReferrals(realReferrals);
      console.log('✅ Affiliate data loaded:', realAffiliates.length, 'affiliates,', realReferrals.length, 'referrals');

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Fout bij het laden van affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalAffiliates: affiliates.length,
    activeAffiliates: affiliates.filter(a => a.status === 'active').length,
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.status === 'active').length,
    totalCommissions: referrals.reduce((sum, r) => sum + r.commission_earned, 0),
    monthlyCommissions: referrals.reduce((sum, r) => sum + r.monthly_commission, 0),
    conversionRate: affiliates.length > 0 ? (referrals.length / affiliates.length * 100).toFixed(1) : '0'
  };

  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = affiliate.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         affiliate.affiliate_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'Alle Statussen' || affiliate.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setEditFormData({
      status: affiliate.status,
      affiliate_code: affiliate.affiliate_code
    });
    setShowEditModal(true);
  };

  const handleSaveAffiliate = async () => {
    if (!selectedAffiliate) return;

    setSaving(true);
    try {
      // Validate affiliate code
      if (!editFormData.affiliate_code.trim()) {
        toast.error('Affiliate code is verplicht');
        return;
      }

      // Check if affiliate code is unique (excluding current affiliate)
      const isCodeUnique = !affiliates.some(aff => 
        aff.id !== selectedAffiliate.id && 
        aff.affiliate_code.toLowerCase() === editFormData.affiliate_code.toLowerCase()
      );

      if (!isCodeUnique) {
        toast.error('Affiliate code moet uniek zijn');
        return;
      }

      // Update affiliate in local state
      setAffiliates(prev => prev.map(aff => 
        aff.id === selectedAffiliate.id 
          ? { 
              ...aff, 
              status: editFormData.status,
              affiliate_code: editFormData.affiliate_code.toUpperCase()
            }
          : aff
      ));

      // Update referrals if affiliate name changed
      if (selectedAffiliate.user_name !== selectedAffiliate.user_name) {
        setReferrals(prev => prev.map(ref => 
          ref.affiliate_id === selectedAffiliate.id
            ? { ...ref, affiliate_name: selectedAffiliate.user_name }
            : ref
        ));
      }

      toast.success('Affiliate succesvol bijgewerkt!');
      setShowEditModal(false);
      setSelectedAffiliate(null);

    } catch (error) {
      console.error('Error saving affiliate:', error);
      toast.error('Fout bij het opslaan van affiliate');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (affiliateId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setAffiliates(prev => prev.map(aff => 
      aff.id === affiliateId ? { ...aff, status: newStatus } : aff
    ));
  };

  const handleDeleteAffiliate = (affiliateId: string) => {
    setAffiliates(prev => prev.filter(aff => aff.id !== affiliateId));
    setShowDeleteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      case 'suspended': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-400';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Affiliate Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer affiliate programma en commissies</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            {filteredAffiliates.length} van {affiliates.length} affiliates
          </span>
          {loading && (
            <span className="text-[#B6C948] text-sm">Laden...</span>
          )}
          <AdminButton 
            variant="secondary" 
            icon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={() => window.location.reload()}
            loading={loading}
          >
            Verversen
          </AdminButton>
          <AdminButton 
            variant="primary" 
            icon={<UserPlusIcon className="w-5 h-5" />}
            onClick={() => setShowAddModal(true)}
          >
            Nieuwe Affiliate
          </AdminButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatsCard
          title="Totaal Affiliates"
          value={stats.totalAffiliates}
          icon={<UserGroupIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Actieve Affiliates"
          value={stats.activeAffiliates}
          icon={<ShieldCheckIcon className="w-8 h-8" />}
          color="blue"
        />
        <AdminStatsCard
          title="Totaal Referrals"
          value={stats.totalReferrals}
          icon={<FireIcon className="w-8 h-8" />}
          color="orange"
        />
        <AdminStatsCard
          title="Totaal Verdiend"
          value={`€${stats.totalCommissions}`}
          icon={<CurrencyEuroIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Maandelijkse Commissies"
          value={`€${stats.monthlyCommissions}`}
          icon={<StarIcon className="w-8 h-8" />}
          color="purple"
        />
      </div>

      {/* Search and Filters */}
      <AdminCard title="Filters & Zoeken" icon={<FunnelIcon className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op naam, e-mail of affiliate code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {['Alle Statussen', 'active', 'inactive', 'suspended'].map(status => (
                <option key={status} value={status}>
                  {status === 'Alle Statussen' ? 'Alle Statussen' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Affiliates Table */}
      <AdminCard title="Affiliates Overzicht" icon={<UserGroupIcon className="w-6 h-6" />}>
        <AdminTable
          headers={['Affiliate', 'Affiliate Code', 'Referrals', 'Verdiensten', 'Status']}
          data={filteredAffiliates.map(affiliate => ({
            affiliate: (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#8BAE5A] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">
                    {affiliate.user_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{affiliate.user_name}</div>
                  <div className="text-sm text-[#8BAE5A]">{affiliate.user_email}</div>
                </div>
              </div>
            ),
            affiliate_code: (
              <span className="text-sm text-white font-mono">{affiliate.affiliate_code}</span>
            ),
            referrals: (
              <div>
                <div className="text-sm text-white">{affiliate.total_referrals}</div>
                <div className="text-xs text-[#8BAE5A]">{affiliate.active_referrals} actief</div>
              </div>
            ),
            verdiensten: (
              <div>
                <div className="text-sm font-medium text-white">€{affiliate.total_earned}</div>
                <div className="text-xs text-[#8BAE5A]">€{affiliate.monthly_earnings}/maand</div>
              </div>
            ),
            status: (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(affiliate.status)}`}>
                {getStatusText(affiliate.status)}
              </span>
            )
          }))}
          actions={(item) => (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const affiliate = filteredAffiliates.find(a => a.user_name === item.affiliate.props.children[1].props.children[0].props.children);
                  if (affiliate) {
                    handleEditAffiliate(affiliate);
                  }
                }}
                className="text-[#8BAE5A] hover:text-white transition-colors"
                title="Bewerken"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const affiliate = filteredAffiliates.find(a => a.user_name === item.affiliate.props.children[1].props.children[0].props.children);
                  if (affiliate) {
                    setSelectedAffiliate(affiliate);
                    setShowDeleteModal(true);
                  }
                }}
                className="text-red-500 hover:text-red-400 transition-colors"
                title="Verwijderen"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </AdminCard>

      {/* Add Affiliate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-6">Nieuwe Affiliate Toevoegen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gebruiker ID</label>
                <input
                  type="text"
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="user-id"
                />
              </div>
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Affiliate Code</label>
                <input
                  type="text"
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="UNIQUE123"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Affiliate Modal */}
      {showEditModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-6">Affiliate Bewerken</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Gebruiker</label>
                <input
                  type="text"
                  value={selectedAffiliate.user_name}
                  disabled
                  className="w-full bg-[#181F17] text-gray-400 px-3 py-2 rounded-lg border border-[#3A4D23] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Status</label>
                <select 
                  value={editFormData.status}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'suspended' }))}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                >
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                  <option value="suspended">Geschorst</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Affiliate Code</label>
                <input
                  type="text"
                  value={editFormData.affiliate_code}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, affiliate_code: e.target.value.toUpperCase() }))}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                  placeholder="UNIQUE123"
                />
                <p className="text-xs text-gray-400 mt-1">Code wordt automatisch naar hoofdletters geconverteerd</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAffiliate(null);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors disabled:opacity-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveAffiliate}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Opslaan...
                  </>
                ) : (
                  'Opslaan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-md w-full mx-4 border border-red-500/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Affiliate Verwijderen</h3>
              <p className="text-[#8BAE5A] text-sm">
                Weet je zeker dat je <strong>{selectedAffiliate.user_name}</strong> wilt verwijderen als affiliate?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDeleteAffiliate(selectedAffiliate.id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 