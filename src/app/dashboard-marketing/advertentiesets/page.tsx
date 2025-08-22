'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyEuroIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  PresentationChartLineIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  campaign_name: string;
  status: string;
  impressions: number;
  clicks: number;
  spent: number;
  reach: number;
  ctr: number;
  cpc: number;
  daily_budget: number;
  lifetime_budget: number;
  created_time: string;
  updated_time: string;
}

export default function AdSetsPage() {
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingTargeting, setUpdatingTargeting] = useState<string | null>(null);
  const [updatingAllTargeting, setUpdatingAllTargeting] = useState(false);
  const [checkingTargeting, setCheckingTargeting] = useState(false);
  const [targetingStatus, setTargetingStatus] = useState<any>(null);
  const [selectedAdSet, setSelectedAdSet] = useState<AdSet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAdSets();
  }, []);

  const fetchAdSets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/facebook/get-adsets');
      const data = await response.json();

      if (data.success) {
        setAdSets(data.data);
        console.log('✅ Ad sets loaded:', data.data.length);
      } else {
        setError(data.error || 'Failed to fetch ad sets');
      }
    } catch (err) {
      console.error('Error fetching ad sets:', err);
      setError('Failed to load ad sets');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (adsetId: string, currentStatus: string) => {
    try {
      setUpdatingStatus(adsetId);
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const response = await fetch('/api/facebook/update-adset-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adsetId, status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setAdSets(prev => prev.map(adSet => 
          adSet.id === adsetId ? { ...adSet, status: newStatus } : adSet
        ));
        
        console.log(`✅ Ad set status updated successfully`);
      } else {
        console.error(`❌ Failed to update ad set status:`, result.error);
        alert(`Fout bij het updaten van ad set status: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ad set status:`, error);
      alert(`Fout bij het updaten van ad set status`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateTargeting = async (adsetId: string, adsetName: string) => {
    try {
      setUpdatingTargeting(adsetId);
      
      const response = await fetch('/api/facebook/update-adset-targeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adsetId, adsetName })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Targeting updated successfully for ${adsetName}`);
        alert(`✅ Targeting bijgewerkt voor ${adsetName}`);
      } else {
        console.error(`❌ Failed to update targeting:`, result.error);
        alert(`❌ Fout bij het updaten van targeting: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error updating targeting:`, error);
      alert(`❌ Fout bij het updaten van targeting`);
    } finally {
      setUpdatingTargeting(null);
    }
  };

  const checkTargetingStatus = async () => {
    try {
      setCheckingTargeting(true);
      
      const response = await fetch('/api/facebook/check-adset-targeting');
      const result = await response.json();

      if (result.success) {
        setTargetingStatus(result);
        console.log('✅ Targeting status checked:', result.summary);
      } else {
        console.error('❌ Failed to check targeting status:', result.error);
        alert('❌ Fout bij het controleren van targeting status');
      }
    } catch (error) {
      console.error('❌ Error checking targeting status:', error);
      alert('❌ Fout bij het controleren van targeting status');
    } finally {
      setCheckingTargeting(false);
    }
  };

  const updateAllTargeting = async () => {
    try {
      setUpdatingAllTargeting(true);
      let successCount = 0;
      let errorCount = 0;

      for (const adSet of adSets) {
        try {
          const response = await fetch('/api/facebook/update-adset-targeting', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ adsetId: adSet.id, adsetName: adSet.name })
          });

          const result = await response.json();

          if (result.success) {
            successCount++;
            console.log(`✅ Targeting updated for ${adSet.name}`);
          } else {
            errorCount++;
            console.error(`❌ Failed to update targeting for ${adSet.name}:`, result.error);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Error updating targeting for ${adSet.name}:`, error);
        }
      }

      alert(`✅ Targeting update voltooid!\nSuccesvol: ${successCount}\nFouten: ${errorCount}`);
      
      // Clear the targeting status to force a fresh check
      setTargetingStatus(null);
      
      // Wait a moment for Facebook to process the changes, then auto-refresh
      setTimeout(async () => {
        console.log('🔄 Auto-refreshing targeting status...');
        try {
          const response = await fetch('/api/facebook/check-adset-targeting');
          const result = await response.json();
          if (result.success) {
            setTargetingStatus(result);
            console.log('✅ Auto-refresh completed:', result.summary);
          }
        } catch (error) {
          console.log('⚠️ Auto-refresh failed, but targeting was updated');
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error in bulk targeting update:', error);
      alert('❌ Fout bij bulk targeting update');
    } finally {
      setUpdatingAllTargeting(false);
    }
  };

  const openDetailModal = (adSet: AdSet) => {
    setSelectedAdSet(adSet);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedAdSet(null);
    setShowDetailModal(false);
  };

  // Calculate totals
  const totalImpressions = adSets.reduce((sum, adSet) => sum + adSet.impressions, 0);
  const totalClicks = adSets.reduce((sum, adSet) => sum + adSet.clicks, 0);
  const totalSpent = adSets.reduce((sum, adSet) => sum + adSet.spent, 0);
  const totalReach = adSets.reduce((sum, adSet) => sum + adSet.reach, 0);
  const activeAdSets = adSets.filter(adSet => adSet.status === 'active').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Advertentiesets Laden...</h1>
          <p className="text-gray-400">Facebook data wordt opgehaald...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Fout Opgetreden</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchAdSets}
            className="bg-[#8BAE5A] hover:bg-[#3A4D23] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Opnieuw Proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Advertentiesets Beheer</h1>
          <p className="text-gray-400">Beheer al je Facebook advertentiesets en hun performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totaal Ad Sets</p>
                <p className="text-2xl font-bold text-white">{adSets.length}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Actieve Ad Sets</p>
                <p className="text-2xl font-bold text-green-400">{activeAdSets}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totaal Weergaven</p>
                <p className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totaal Klikken</p>
                <p className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</p>
              </div>
              <CursorArrowRaysIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Totaal Uitgegeven</p>
                <p className="text-2xl font-bold text-white">€{(totalSpent / 100).toFixed(2)}</p>
              </div>
              <CurrencyEuroIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Targeting Status Banner */}
        {targetingStatus && (
          <div className={`mb-6 p-4 rounded-lg border ${
            targetingStatus.summary.needsUpdate 
              ? 'bg-yellow-900/20 border-yellow-500/30' 
              : 'bg-green-900/20 border-green-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold mb-1 ${
                  targetingStatus.summary.needsUpdate ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  Targeting Status Check
                </h3>
                <p className={`text-sm mb-2 ${
                  targetingStatus.summary.needsUpdate ? 'text-yellow-200' : 'text-green-200'
                }`}>
                  {targetingStatus.summary.needsUpdate 
                    ? `${targetingStatus.summary.incorrectGender} van ${targetingStatus.summary.totalAdSets} advertentiesets hebben nog "Alle geslachten" in plaats van "Alleen mannen"`
                    : `Alle ${targetingStatus.summary.totalAdSets} advertentiesets hebben correct "Alleen mannen" targeting`
                  }
                </p>
                <div className="flex items-center space-x-4 text-xs">
                  <span>✅ Correct: {targetingStatus.summary.correctGender}</span>
                  <span>❌ Incorrect: {targetingStatus.summary.incorrectGender}</span>
                  <span>📊 Totaal: {targetingStatus.summary.totalAdSets}</span>
                </div>
              </div>
              {targetingStatus.summary.needsUpdate && (
                <button
                  onClick={updateAllTargeting}
                  disabled={updatingAllTargeting}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingAllTargeting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Fixen...
                    </div>
                  ) : (
                    'Fix Incorrecte Targeting'
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Ad Sets Table */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
          <div className="p-6 border-b border-[#334155]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Alle Advertentiesets</h2>
                <p className="text-gray-400 text-sm mt-1">Beheer en monitor je advertentiesets</p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={checkTargetingStatus}
                  disabled={checkingTargeting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingTargeting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Controleren...
                    </div>
                  ) : (
                    <>
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Check Targeting</span>
                    </>
                  )}
                </button>
                <button
                  onClick={updateAllTargeting}
                  disabled={updatingAllTargeting}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingAllTargeting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Alle Targeting Fixen...
                    </div>
                  ) : (
                    'Fix Alle Targeting'
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#334155]/50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Advertentieset</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Campagne</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Budget</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Weergaven</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Bereik</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Klikken</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">CTR</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">CPC</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Uitgegeven</th>
                                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Acties</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Targeting</th>
                </tr>
              </thead>
              <tbody>
                {adSets.map((adSet, index) => (
                  <tr key={adSet.id} className="border-b border-[#334155]/30 hover:bg-[#334155]/20 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        adSet.status === 'active' ? 'bg-green-900/20 text-green-400' :
                        adSet.status === 'paused' ? 'bg-yellow-900/20 text-yellow-400' :
                        'bg-gray-900/20 text-gray-400'
                      }`}>
                        {adSet.status === 'active' ? 'Actief' :
                         adSet.status === 'paused' ? 'Gepauzeerd' :
                         adSet.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium cursor-pointer hover:text-[#8BAE5A] transition-colors" onClick={() => openDetailModal(adSet)}>
                        {adSet.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white">{adSet.campaign_name}</td>
                    <td className="py-4 px-6 text-white">€{(adSet.daily_budget / 100).toFixed(2)}/dag</td>
                    <td className="py-4 px-6 text-white">{adSet.impressions.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white">{adSet.reach.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white">{adSet.clicks.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white">{adSet.ctr ? `${(adSet.ctr * 100).toFixed(2)}%` : '-'}</td>
                    <td className="py-4 px-6 text-white">{adSet.cpc ? `€${(adSet.cpc / 100).toFixed(2)}` : '-'}</td>
                    <td className="py-4 px-6 text-white">€{(adSet.spent / 100).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateStatus(adSet.id, adSet.status)}
                          disabled={updatingStatus === adSet.id}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            adSet.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingStatus === adSet.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            adSet.status === 'active' ? 'Pauzeren' : 'Activeren'
                          )}
                        </button>
                        <button
                          onClick={() => openDetailModal(adSet)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => updateTargeting(adSet.id, adSet.name)}
                        disabled={updatingTargeting === adSet.id}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingTargeting === adSet.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Fix Targeting'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedAdSet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1E293B] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Advertentieset Details</h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">{selectedAdSet.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className="text-white font-medium">{selectedAdSet.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Campagne</p>
                      <p className="text-white font-medium">{selectedAdSet.campaign_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Dagelijks Budget</p>
                      <p className="text-white font-medium">€{(selectedAdSet.daily_budget / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Aangemaakt</p>
                      <p className="text-white font-medium">{new Date(selectedAdSet.created_time).toLocaleDateString('nl-NL')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-md font-medium text-white mb-3">Performance Metrics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#334155]/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Weergaven</p>
                      <p className="text-2xl font-bold text-white">{selectedAdSet.impressions.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#334155]/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Bereik</p>
                      <p className="text-2xl font-bold text-white">{selectedAdSet.reach.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#334155]/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Klikken</p>
                      <p className="text-2xl font-bold text-white">{selectedAdSet.clicks.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#334155]/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">CTR</p>
                      <p className="text-2xl font-bold text-white">{selectedAdSet.ctr ? `${(selectedAdSet.ctr * 100).toFixed(2)}%` : '-'}</p>
                    </div>
                    <div className="bg-[#334155]/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">CPC</p>
                      <p className="text-2xl font-bold text-white">{selectedAdSet.cpc ? `€${(selectedAdSet.cpc / 100).toFixed(2)}` : '-'}</p>
                    </div>
                    <div className="bg-[#334155]/30 rounded-lg p-4">
                      <p className="text-gray-400 text-sm">Uitgegeven</p>
                      <p className="text-2xl font-bold text-white">€{(selectedAdSet.spent / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => updateStatus(selectedAdSet.id, selectedAdSet.status)}
                    disabled={updatingStatus === selectedAdSet.id}
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      selectedAdSet.status === 'active'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updatingStatus === selectedAdSet.id ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Updaten...
                      </div>
                    ) : (
                      selectedAdSet.status === 'active' ? 'Pauzeren' : 'Activeren'
                    )}
                  </button>
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                  >
                    Sluiten
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
