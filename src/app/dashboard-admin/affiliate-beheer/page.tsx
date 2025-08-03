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
import { toast } from 'react-hot-toast';
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
  const [isLive, setIsLive] = useState(false);

  // Check if affiliate system is live
  useEffect(() => {
    checkAffiliateSystemStatus();
  }, []);

  const checkAffiliateSystemStatus = async () => {
    try {
      // Check if affiliates table exists and has data
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('id')
        .limit(1);

      if (!affiliatesError && affiliatesData) {
        setIsLive(true);
        console.log('✅ Affiliate system is LIVE - using dedicated tables');
      } else {
        setIsLive(false);
        console.log('⚠️ Affiliate system using profiles table fallback');
      }
    } catch (error) {
      console.error('Error checking affiliate system status:', error);
      setIsLive(false);
    }
  };

  const initializeAffiliateTables = async () => {
    try {
      console.log('🚀 Initializing affiliate database system...');
      
      const response = await fetch('/api/admin/setup-affiliate-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Affiliate database system initialized successfully');
        toast.success('Affiliate database systeem succesvol geïnitialiseerd!');
        setIsLive(true);
        fetchAffiliateData();
        return true;
      } else {
        console.error('Error initializing affiliate database:', result.error);
        toast.error(`Fout bij het initialiseren: ${result.error}`);
        return false;
      }

    } catch (error) {
      console.error('Error initializing affiliate database:', error);
      toast.error('Fout bij het initialiseren van affiliate database');
      return false;
    }
  };

  // Fetch real affiliate data from database
  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching affiliate data from database...');

      // Try to setup database first if not already done
      if (!isLive) {
        console.log('🔄 Checking affiliate database...');
        const setupResponse = await fetch('/api/admin/setup-affiliate-database', {
          method: 'POST'
        });
        
        if (setupResponse.ok) {
          const result = await setupResponse.json();
          if (result.success) {
            console.log('✅ Affiliate database setup completed');
            setIsLive(true);
          } else {
            console.log('⚠️ Database setup failed:', result.error);
            toast.error('Database setup failed. Please run the SQL script manually.');
          }
        } else {
          console.log('⚠️ Database setup failed, using profiles fallback');
        }
      }

      // Fetch from dedicated affiliate tables using the dashboard view
      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from('affiliate_dashboard')
        .select('*')
        .order('created_at', { ascending: false });

      if (!affiliatesError && affiliatesData) {
        console.log('✅ Using dedicated affiliate tables');
        setIsLive(true);
        
        const formattedAffiliates: Affiliate[] = affiliatesData.map((affiliate: any) => ({
          id: affiliate.id,
          user_id: affiliate.user_id,
          user_name: affiliate.user_name || 'Onbekend',
          user_email: affiliate.user_email || 'Geen e-mail',
          affiliate_code: affiliate.affiliate_code,
          total_referrals: affiliate.total_referrals || 0,
          active_referrals: affiliate.active_referrals || 0,
          total_earned: affiliate.total_earned || 0,
          monthly_earnings: affiliate.monthly_earnings || 0,
          status: affiliate.status || 'active',
          created_at: affiliate.created_at,
          last_referral: affiliate.last_referral_date
        }));

        setAffiliates(formattedAffiliates);

        // Fetch referrals for this affiliate
        const { data: referralsData, error: referralsError } = await supabase
          .from('affiliate_referrals')
          .select(`
            *,
            affiliates!inner(
              id,
              affiliate_code,
              user_id,
              profiles!inner(
                full_name,
                email
              )
            ),
            referred_user:profiles!affiliate_referrals_referred_user_id_fkey(
              full_name,
              email
            )
          `)
          .order('referral_date', { ascending: false });

        if (!referralsError && referralsData) {
          const formattedReferrals: Referral[] = referralsData.map((referral: any) => ({
            id: referral.id,
            affiliate_id: referral.affiliate_id,
            affiliate_name: referral.affiliates.profiles.full_name,
            affiliate_email: referral.affiliates.profiles.email,
            affiliate_code: referral.affiliates.affiliate_code,
            referred_user_id: referral.referred_user_id,
            referred_user_name: referral.referred_user.full_name,
            referred_user_email: referral.referred_user.email,
            status: referral.status,
            commission_earned: referral.commission_earned,
            monthly_commission: referral.monthly_commission,
            referral_date: referral.referral_date,
            activation_date: referral.activation_date,
            last_payment: referral.last_payment_date,
            notes: referral.notes,
            created_at: referral.created_at
          }));
          setReferrals(formattedReferrals);
        }

        return;
      }

      // Fallback to profiles table if no dedicated tables
      console.log('⚠️ No dedicated affiliate tables found, using profiles fallback');
      setIsLive(false);
      await fetchAffiliateDataFromProfiles();

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Failed to load affiliate data');
      // Fallback to profiles table
      await fetchAffiliateDataFromProfiles();
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateDataFromProfiles = async () => {
    try {
      console.log('🔄 Fetching affiliate data from profiles table...');

      // Fetch profiles with affiliate data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          affiliate_code,
          affiliate_status,
          total_referrals,
          active_referrals,
          total_earned,
          monthly_earnings,
          last_referral,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Fout bij het laden van affiliate data');
        return;
      }

      console.log('📊 Fetched profiles with affiliate data:', profiles?.length || 0);

      // Convert profiles to affiliate format
      const realAffiliates: Affiliate[] = (profiles || []).map(profile => {
        return {
          id: profile.id,
          user_id: profile.id,
          user_name: profile.full_name || profile.email?.split('@')[0] || 'Onbekende gebruiker',
          user_email: profile.email || '',
          affiliate_code: profile.affiliate_code || `${profile.full_name?.toUpperCase().replace(/\s+/g, '') || 'USER'}${profile.id.slice(-6)}`,
          total_referrals: profile.total_referrals || 0,
          active_referrals: profile.active_referrals || 0,
          total_earned: profile.total_earned || 0,
          monthly_earnings: profile.monthly_earnings || 0,
          status: profile.affiliate_status || 'inactive',
          created_at: profile.created_at,
          last_referral: profile.last_referral
        };
      });

      // Generate referral data based on affiliate stats
      const realReferrals: Referral[] = [];
      realAffiliates.forEach(affiliate => {
        if (affiliate.total_referrals > 0) {
          for (let i = 0; i < affiliate.total_referrals; i++) {
            const isActive = i < affiliate.active_referrals;
            realReferrals.push({
              id: `${affiliate.id}-${i}`,
              affiliate_id: affiliate.id,
              affiliate_name: affiliate.user_name,
              referred_user_id: `referred-${i}`,
              referred_user_name: `Referred User ${i + 1}`,
              referred_user_email: `user${i + 1}@example.com`,
              status: isActive ? 'active' : 'inactive',
              commission_earned: 25,
              monthly_commission: isActive ? 5 : 0,
              created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
              last_payment: isActive ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
            });
          }
        }
      });

      setAffiliates(realAffiliates);
      setReferrals(realReferrals);
      console.log('✅ Profile-based affiliate data loaded:', realAffiliates.length, 'affiliates,', realReferrals.length, 'referrals');

    } catch (error) {
      console.error('Error fetching profile affiliate data:', error);
      toast.error('Fout bij het laden van affiliate data');
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

      // Update affiliate in database - try affiliates table first, fallback to profiles
      let updateError = null;
      
      // Try to update in affiliates table
      const { error: affiliatesUpdateError } = await supabase
        .from('affiliates')
        .update({
          affiliate_code: editFormData.affiliate_code.toUpperCase(),
          status: editFormData.status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedAffiliate.user_id);

      if (affiliatesUpdateError) {
        console.log('⚠️ Affiliates table update failed, trying profiles table...');
        // Fallback to profiles table
        const { error: profilesUpdateError } = await supabase
          .from('profiles')
          .update({
            affiliate_code: editFormData.affiliate_code.toUpperCase(),
            affiliate_status: editFormData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedAffiliate.user_id);
        
        updateError = profilesUpdateError;
      }

      if (updateError) {
        console.error('Error updating affiliate in database:', updateError);
        toast.error('Fout bij het opslaan in database');
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#8BAE5A]">Affiliate Beheer</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isLive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {isLive ? 'LIVE' : 'DUMMY'}
            </span>
          </div>
          <p className="text-[#B6C948] mt-2">
            {isLive 
              ? 'Beheer affiliate programma met volledige database integratie' 
              : 'Beheer affiliate programma (profiles table fallback)'
            }
          </p>
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
            onClick={() => {
              fetchAffiliateData();
              checkAffiliateSystemStatus();
            }}
            loading={loading}
          >
            Verversen
          </AdminButton>
          {!isLive && (
            <AdminButton 
              variant="secondary" 
              icon={<TrophyIcon className="w-5 h-5" />}
              onClick={initializeAffiliateTables}
            >
              Initialiseer Database
            </AdminButton>
          )}
          {isLive && (
            <AdminButton 
              variant="secondary" 
              icon={<PlusIcon className="w-5 h-5" />}
              onClick={async () => {
                try {
                  const response = await fetch('/api/admin/create-sample-affiliates', {
                    method: 'POST'
                  });
                  if (response.ok) {
                    const result = await response.json();
                    toast.success(`Sample data gemaakt: ${result.data.affiliates} affiliates, ${result.data.referrals} referrals`);
                    fetchAffiliateData();
                  } else {
                    toast.error('Fout bij maken van sample data');
                  }
                } catch (error) {
                  toast.error('Fout bij maken van sample data');
                }
              }}
            >
              Sample Data
            </AdminButton>
          )}
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
          data={filteredAffiliates.map(affiliate => [
            (
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
            (
              <span className="text-sm text-white font-mono">{affiliate.affiliate_code}</span>
            ),
            (
              <div>
                <div className="text-sm text-white">{affiliate.total_referrals}</div>
                <div className="text-xs text-[#8BAE5A]">{affiliate.active_referrals} actief</div>
              </div>
            ),
            (
              <div>
                <div className="text-sm font-medium text-white">€{affiliate.total_earned}</div>
                <div className="text-xs text-[#8BAE5A]">€{affiliate.monthly_earnings}/maand</div>
              </div>
            ),
            (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(affiliate.status)}`}>
                {getStatusText(affiliate.status)}
              </span>
            )
          ])}
          actions={(item) => (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const affiliate = filteredAffiliates.find(a => a.user_name === item[0].props.children[1].props.children[0].props.children);
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
                  const affiliate = filteredAffiliates.find(a => a.user_name === item[0].props.children[1].props.children[0].props.children);
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