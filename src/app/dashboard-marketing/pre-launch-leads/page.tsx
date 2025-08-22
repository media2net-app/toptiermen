'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface PrelaunchLead {
  id: string;
  email: string;
  source: string;
  status: string;
  package: string;
  notes: string;
  subscribed_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

export default function PreLaunchLeadsPage() {
  const [leads, setLeads] = useState<PrelaunchLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterAdSet, setFilterAdSet] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prelaunch-leads');
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.leads);
      } else {
        setError(data.error || 'Failed to load leads');
      }
    } catch (error) {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // Get unique campaigns and ad sets for filtering
  const campaigns = [...new Set(leads.map(lead => lead.utm_campaign).filter(Boolean))];
  const adSets = [...new Set(leads.map(lead => lead.utm_content).filter(Boolean))];

  // Filter leads based on search and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = !filterCampaign || lead.utm_campaign === filterCampaign;
    const matchesAdSet = !filterAdSet || lead.utm_content === filterAdSet;
    
    return matchesSearch && matchesCampaign && matchesAdSet;
  });

  // Calculate statistics
  const totalLeads = leads.length;
  const leadsWithTracking = leads.filter(lead => lead.utm_campaign).length;
  const campaignStats = campaigns.map(campaign => ({
    campaign,
    count: leads.filter(lead => lead.utm_campaign === campaign).length
  }));

  const getCampaignColor = (campaign: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
    const index = campaigns.indexOf(campaign);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pre-launch Leads</h1>
          <p className="text-gray-400">Track leads from Facebook campaigns</p>
        </div>
        <button
          onClick={loadLeads}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <div className="flex items-center">
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
            <div className="ml-3">
              <p className="text-gray-400 text-sm">totaal leads</p>
              <p className="text-white text-2xl font-bold">{totalLeads}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-8 h-8 text-green-400" />
            <div className="ml-3">
              <p className="text-gray-400 text-sm">met tracking</p>
              <p className="text-white text-2xl font-bold">{leadsWithTracking}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <div className="flex items-center">
            <FunnelIcon className="w-8 h-8 text-purple-400" />
            <div className="ml-3">
              <p className="text-gray-400 text-sm">campagnes</p>
              <p className="text-white text-2xl font-bold">{campaigns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-orange-400" />
            <div className="ml-3">
              <p className="text-gray-400 text-sm">ad sets</p>
              <p className="text-white text-2xl font-bold">{adSets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      {campaignStats.length > 0 && (
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">campagne prestaties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignStats.map((stat) => (
              <div key={stat.campaign} className="flex items-center justify-between p-3 bg-[#2D3748] rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getCampaignColor(stat.campaign)} mr-3`}></div>
                  <span className="text-white font-medium">{stat.campaign}</span>
                </div>
                <span className="text-gray-400 font-bold">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">zoeken</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Email of notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2D3748] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">campagne</label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">alle campagnes</option>
              {campaigns.map(campaign => (
                <option key={campaign} value={campaign}>{campaign}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">ad set</label>
            <select
              value={filterAdSet}
              onChange={(e) => setFilterAdSet(e.target.value)}
              className="w-full px-4 py-2 bg-[#2D3748] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">alle ad sets</option>
              {adSets.map(adSet => (
                <option key={adSet} value={adSet}>{adSet}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCampaign('');
                setFilterAdSet('');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#2D3748]">
          <h2 className="text-lg font-semibold text-white">
            leads ({filteredLeads.length} van {totalLeads})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2D3748]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">campagne</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ad set</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">bron</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">datum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#2D3748] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white font-medium">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.utm_campaign ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCampaignColor(lead.utm_campaign)} text-white`}>
                        {lead.utm_campaign}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white text-sm">{lead.utm_content || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-white text-sm">{lead.utm_source || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-400 text-sm">
                      {new Date(lead.subscribed_at).toLocaleDateString('nl-NL')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            geen leads gevonden
          </div>
        )}
      </div>
    </div>
  );
}
