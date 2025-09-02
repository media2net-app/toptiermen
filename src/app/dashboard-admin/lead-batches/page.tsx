'use client';

import { useState, useEffect } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, EnvelopeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface LeadBatch {
  batch_number: number;
  batch_name: string;
  lead_count: number;
  leads: Lead[];
  campaign_1_sent: number;
  campaign_2_sent: number;
  campaign_3_sent: number;
}

interface Lead {
  lead_id: string;
  email: string;
  full_name: string;
  created_at: string;
  batch_number: number;
  batch_name: string;
  campaign_1_sent: boolean;
  campaign_2_sent: boolean;
  campaign_3_sent: boolean;
  next_campaign: string;
  status: string;
}

export default function LeadBatchesPage() {
  const [batchData, setBatchData] = useState<{
    totalLeads: number;
    batchAssignments: Lead[];
    batchOverview: LeadBatch[];
    summary: {
      totalBatches: number;
      batch1Leads: number;
      batch2Leads: number;
      batch3Leads: number;
      readyForCampaign2: number;
      readyForCampaign1: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  // Fetch batch data
  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categorize-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batch data');
      }

      const data = await response.json();
      setBatchData(data);
    } catch (error) {
      console.error('Error fetching batch data:', error);
      toast.error('Fout bij ophalen batch data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBatchData();
    setRefreshing(false);
    toast.success('Batch data bijgewerkt');
  };

  useEffect(() => {
    fetchBatchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!batchData) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-400">Geen batch data gevonden</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, batchOverview } = batchData;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Batch Management</h1>
            <p className="text-gray-400 mt-2">Overzicht van alle leads georganiseerd per batch</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Vernieuwen</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{summary.batch1Leads + summary.batch2Leads + summary.batch3Leads}</div>
                <div className="text-gray-400">Totaal Leads</div>
              </div>
              <div className="text-blue-400">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{summary.totalBatches}</div>
                <div className="text-gray-400">Totaal Batches</div>
              </div>
              <div className="text-green-400">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{summary.readyForCampaign2}</div>
                <div className="text-gray-400">Klaar voor Campagne 2</div>
                <div className="text-sm text-gray-500">(3 september)</div>
              </div>
              <div className="text-yellow-400">
                <ClockIcon className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{summary.readyForCampaign1}</div>
                <div className="text-gray-400">Klaar voor Campagne 1</div>
                <div className="text-sm text-gray-500">(direct)</div>
              </div>
              <div className="text-orange-400">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Batch Overzicht
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'details'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Gedetailleerde Leads
          </button>
        </div>

        {/* Batch Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {batchOverview.map((batch) => (
              <AdminCard key={batch.batch_number} title={`${batch.batch_name} - ${batch.lead_count} leads`}>
                <div className="space-y-4">
                  {/* Campaign Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-white">
                        {batch.campaign_1_sent}/{batch.lead_count}
                      </div>
                      <div className="text-sm text-gray-400">Campagne 1 Verzonden</div>
                      <div className="text-xs text-gray-500">Welkom & Introductie</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-white">
                        {batch.campaign_2_sent}/{batch.lead_count}
                      </div>
                      <div className="text-sm text-gray-400">Campagne 2 Verzonden</div>
                      <div className="text-xs text-gray-500">3 september</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-white">
                        {batch.campaign_3_sent}/{batch.lead_count}
                      </div>
                      <div className="text-sm text-gray-400">Campagne 3 Verzonden</div>
                      <div className="text-xs text-gray-500">9 september</div>
                    </div>
                  </div>

                  {/* Next Action */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Volgende Actie</h4>
                    <div className="text-white">
                      {batch.batch_number === 1 ? (
                        <span className="text-yellow-400">⏳ Wachten op 3 september voor Campagne 2</span>
                      ) : (
                        <span className="text-orange-400">📧 Klaar voor Campagne 1 (direct verzenden)</span>
                      )}
                    </div>
                  </div>

                  {/* Sample Leads */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Voorbeeld Leads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {batch.leads.slice(0, 4).map((lead) => (
                        <div key={lead.lead_id} className="bg-gray-800 p-3 rounded text-sm">
                          <div className="text-white font-medium">{lead.full_name}</div>
                          <div className="text-gray-400">{lead.email}</div>
                          <div className="text-gray-500 text-xs">
                            {new Date(lead.created_at).toLocaleDateString('nl-NL')}
                          </div>
                        </div>
                      ))}
                      {batch.leads.length > 4 && (
                        <div className="bg-gray-800 p-3 rounded text-sm flex items-center justify-center">
                          <span className="text-gray-400">+{batch.leads.length - 4} meer leads</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        )}

        {/* Detailed Leads Tab */}
        {activeTab === 'details' && (
          <AdminCard title="Gedetailleerde Lead Informatie">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Batch</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Naam</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Aangemeld</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Campagne 1</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Campagne 2</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Campagne 3</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batchData.batchAssignments.map((lead) => (
                    <tr key={lead.lead_id} className="border-b border-gray-800">
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.batch_number === 1 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {lead.batch_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{lead.full_name}</td>
                      <td className="py-3 px-4 text-white">{lead.email}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.campaign_1_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.campaign_1_sent ? 'Verzonden' : 'Niet verzonden'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.campaign_2_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.campaign_2_sent ? 'Verzonden' : 'Niet verzonden'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.campaign_3_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.campaign_3_sent ? 'Verzonden' : 'Niet verzonden'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{lead.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
