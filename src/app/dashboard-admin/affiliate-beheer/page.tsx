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
  ArrowDownIcon
} from '@heroicons/react/24/outline';

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
  last_referral: string;
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
  last_payment: string;
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

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setAffiliates([
        {
          id: '1',
          user_id: 'user-1',
          user_name: 'John Doe',
          user_email: 'john@example.com',
          affiliate_code: 'JOHN123',
          total_referrals: 5,
          active_referrals: 4,
          total_earned: 125,
          monthly_earnings: 20,
          status: 'active',
          created_at: '2024-01-15',
          last_referral: '2024-07-20'
        },
        {
          id: '2',
          user_id: 'user-2',
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          affiliate_code: 'JANE456',
          total_referrals: 3,
          active_referrals: 2,
          total_earned: 75,
          monthly_earnings: 10,
          status: 'active',
          created_at: '2024-02-10',
          last_referral: '2024-07-15'
        },
        {
          id: '3',
          user_id: 'user-3',
          user_name: 'Mike Johnson',
          user_email: 'mike@example.com',
          affiliate_code: 'MIKE789',
          total_referrals: 0,
          active_referrals: 0,
          total_earned: 0,
          monthly_earnings: 0,
          status: 'inactive',
          created_at: '2024-03-05',
          last_referral: '2024-06-01'
        }
      ]);

      setReferrals([
        {
          id: '1',
          affiliate_id: '1',
          affiliate_name: 'John Doe',
          referred_user_id: 'ref-1',
          referred_user_name: 'Alice Brown',
          referred_user_email: 'alice@example.com',
          status: 'active',
          commission_earned: 25,
          monthly_commission: 5,
          created_at: '2024-07-01',
          last_payment: '2024-07-01'
        },
        {
          id: '2',
          affiliate_id: '1',
          affiliate_name: 'John Doe',
          referred_user_id: 'ref-2',
          referred_user_name: 'Bob Wilson',
          referred_user_email: 'bob@example.com',
          status: 'active',
          commission_earned: 25,
          monthly_commission: 5,
          created_at: '2024-07-05',
          last_payment: '2024-07-05'
        },
        {
          id: '3',
          affiliate_id: '2',
          affiliate_name: 'Jane Smith',
          referred_user_id: 'ref-3',
          referred_user_name: 'Carol Davis',
          referred_user_email: 'carol@example.com',
          status: 'active',
          commission_earned: 25,
          monthly_commission: 5,
          created_at: '2024-07-10',
          last_payment: '2024-07-10'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const stats = {
    totalAffiliates: affiliates.length,
    activeAffiliates: affiliates.filter(a => a.status === 'active').length,
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.status === 'active').length,
    totalCommissions: referrals.reduce((sum, r) => sum + r.commission_earned, 0),
    monthlyCommissions: referrals.reduce((sum, r) => sum + r.monthly_commission, 0),
    conversionRate: affiliates.length > 0 ? (referrals.length / affiliates.length * 100).toFixed(1) : '0'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1411] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1411] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Affiliate Beheer</h1>
              <p className="text-[#8BAE5A]">Beheer affiliate programma en commissies</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Nieuwe Affiliate
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#181F17] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Overzicht
          </button>
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
              activeTab === 'affiliates'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            Affiliates
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
              activeTab === 'referrals'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            <FireIcon className="w-5 h-5" />
            Referrals
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors ${
              activeTab === 'commissions'
                ? 'bg-[#8BAE5A] text-white'
                : 'text-[#8BAE5A] hover:text-white'
            }`}
          >
            <CurrencyEuroIcon className="w-5 h-5" />
            Commissies
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
                  </div>
                  <span className="text-[#8BAE5A] text-sm">Totaal</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalAffiliates}</div>
                <div className="text-[#8BAE5A] text-sm">Affiliates</div>
              </div>

              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-green-500 text-sm">Actief</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.activeAffiliates}</div>
                <div className="text-[#8BAE5A] text-sm">Actieve Affiliates</div>
              </div>

              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FireIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-blue-500 text-sm">+{stats.totalReferrals}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalReferrals}</div>
                <div className="text-[#8BAE5A] text-sm">Totaal Referrals</div>
              </div>

              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <span className="text-yellow-500 text-sm">€{stats.totalCommissions}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">€{stats.totalCommissions}</div>
                <div className="text-[#8BAE5A] text-sm">Totaal Verdiend</div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-[#181F17] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Affiliate Performance</h3>
              <div className="space-y-4">
                {affiliates.map(affiliate => (
                  <div key={affiliate.id} className="flex items-center justify-between p-4 bg-[#232D1A] rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {affiliate.user_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{affiliate.user_name}</div>
                        <div className="text-[#8BAE5A] text-sm">{affiliate.user_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-white font-semibold">{affiliate.total_referrals}</div>
                        <div className="text-[#8BAE5A] text-sm">Referrals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">€{affiliate.total_earned}</div>
                        <div className="text-[#8BAE5A] text-sm">Verdiend</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        affiliate.status === 'active' 
                          ? 'bg-green-500/20 text-green-500'
                          : affiliate.status === 'inactive'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {affiliate.status === 'active' ? 'Actief' : 
                         affiliate.status === 'inactive' ? 'Inactief' : 'Geschorst'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Affiliates Tab */}
        {activeTab === 'affiliates' && (
          <div className="bg-[#181F17] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#232D1A]">
              <h3 className="text-lg font-semibold text-white">Alle Affiliates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232D1A]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Verdiensten
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232D1A]">
                  {affiliates.map(affiliate => (
                    <tr key={affiliate.id} className="hover:bg-[#232D1A]/50">
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-mono">{affiliate.affiliate_code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{affiliate.total_referrals}</div>
                        <div className="text-xs text-[#8BAE5A]">{affiliate.active_referrals} actief</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">€{affiliate.total_earned}</div>
                        <div className="text-xs text-[#8BAE5A]">€{affiliate.monthly_earnings}/maand</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          affiliate.status === 'active' 
                            ? 'bg-green-500/20 text-green-500'
                            : affiliate.status === 'inactive'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {affiliate.status === 'active' ? 'Actief' : 
                           affiliate.status === 'inactive' ? 'Inactief' : 'Geschorst'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAffiliate(affiliate);
                              setShowEditModal(true);
                            }}
                            className="text-[#8BAE5A] hover:text-white"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAffiliate(affiliate);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-500 hover:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="bg-[#181F17] rounded-lg overflow-hidden">
            <div className="p-6 border-b border-[#232D1A]">
              <h3 className="text-lg font-semibold text-white">Alle Referrals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#232D1A]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Referred User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Commissie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8BAE5A] uppercase tracking-wider">
                      Datum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232D1A]">
                  {referrals.map(referral => (
                    <tr key={referral.id} className="hover:bg-[#232D1A]/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{referral.affiliate_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-semibold">
                              {referral.referred_user_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{referral.referred_user_name}</div>
                            <div className="text-sm text-[#8BAE5A]">{referral.referred_user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          referral.status === 'active' 
                            ? 'bg-green-500/20 text-green-500'
                            : referral.status === 'inactive'
                            ? 'bg-gray-500/20 text-gray-400'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {referral.status === 'active' ? 'Actief' : 
                           referral.status === 'inactive' ? 'Inactief' : 'Geannuleerd'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">€{referral.commission_earned}</div>
                        <div className="text-xs text-[#8BAE5A]">€{referral.monthly_commission}/maand</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8BAE5A]">
                        {new Date(referral.created_at).toLocaleDateString('nl-NL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="space-y-6">
            {/* Commission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <ArrowUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">€{stats.totalCommissions}</div>
                <div className="text-[#8BAE5A] text-sm">Totaal Uitbetaald</div>
              </div>

              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <ArrowUpIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">€{stats.monthlyCommissions}</div>
                <div className="text-[#8BAE5A] text-sm">Deze Maand</div>
              </div>

              <div className="bg-[#181F17] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <CurrencyEuroIcon className="w-6 h-6 text-yellow-500" />
                  </div>
                  <ArrowDownIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">€{stats.totalCommissions * 0.1}</div>
                <div className="text-[#8BAE5A] text-sm">Openstaand</div>
              </div>
            </div>

            {/* Commission History */}
            <div className="bg-[#181F17] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Commissie Geschiedenis</h3>
              <div className="space-y-4">
                {referrals.map(referral => (
                  <div key={referral.id} className="flex items-center justify-between p-4 bg-[#232D1A] rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {referral.affiliate_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">{referral.affiliate_name}</div>
                        <div className="text-[#8BAE5A] text-sm">→ {referral.referred_user_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">€{referral.commission_earned}</div>
                      <div className="text-[#8BAE5A] text-sm">
                        {new Date(referral.created_at).toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Status</label>
                <select className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]">
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                  <option value="suspended">Geschorst</option>
                </select>
              </div>
              <div>
                <label className="block text-[#8BAE5A] text-sm font-medium mb-2">Affiliate Code</label>
                <input
                  type="text"
                  defaultValue={selectedAffiliate.affiliate_code}
                  className="w-full bg-[#181F17] text-white px-3 py-2 rounded-lg border border-[#3A4D23] focus:outline-none focus:border-[#8BAE5A]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg font-semibold hover:bg-[#4A5D33] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-[#8BAE5A] text-white rounded-lg font-semibold hover:bg-[#9BBE6A] transition-colors"
              >
                Opslaan
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