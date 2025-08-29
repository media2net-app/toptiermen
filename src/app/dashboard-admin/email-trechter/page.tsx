'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronRightIcon, 
  PlusIcon,
  XMarkIcon, 
  EyeIcon, 
  PencilIcon,
  PlayIcon, 
  PauseIcon, 
  DocumentDuplicateIcon, 
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';
import AdminCard from '@/components/admin/AdminCard';
import { toast } from 'react-hot-toast';

interface Lead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  source: string;
  status: 'active' | 'inactive' | 'unsubscribed' | 'bounced';
  created_at: string;
}

interface BulkEmailCampaign {
  id: string;
  name: string;
  subject: string;
  template_type: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'cancelled';
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

interface BulkEmailRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounce_reason?: string;
}

export default function EmailTrechter() {
  // State management
  const [activeTab, setActiveTab] = useState<'leads' | 'campaigns' | 'overview'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<BulkEmailCampaign[]>([]);
  const [recipients, setRecipients] = useState<BulkEmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Lead management
  const [showLeadImport, setShowLeadImport] = useState(false);
  const [leadImportData, setLeadImportData] = useState('');
  const [importingLeads, setImportingLeads] = useState(false);

  // Campaign management
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<BulkEmailCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    template_type: 'welcome'
  });

  // Recipients modal
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [selectedCampaignRecipients, setSelectedCampaignRecipients] = useState<BulkEmailRecipient[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    totalCampaigns: 0,
    totalSent: 0,
    totalOpens: 0,
    totalClicks: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLeads(),
        fetchCampaigns(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fout bij laden van data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setLoadingLeads(true);
      const response = await fetch('/api/admin/leads', {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (response.ok) {
        setLeads(data.leads || []);
      } else {
        toast.error('Fout bij laden leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Fout bij laden leads');
    } finally {
      setLoadingLeads(false);
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/admin/bulk-email-campaigns', {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (response.ok) {
        setCampaigns(data.campaigns || []);
      } else {
        toast.error('Fout bij laden campagnes');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Fout bij laden campagnes');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const activeLeads = leads.filter(lead => lead.status === 'active').length;
      const totalSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);
      const totalOpens = campaigns.reduce((sum, c) => sum + c.open_count, 0);
      const totalClicks = campaigns.reduce((sum, c) => sum + c.click_count, 0);
      
      setStats({
        totalLeads: leads.length,
        activeLeads,
        totalCampaigns: campaigns.length,
        totalSent,
        totalOpens,
        totalClicks,
        avgOpenRate: totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0,
        avgClickRate: totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  // Import leads
  const handleLeadImport = async () => {
    if (!leadImportData.trim()) {
      toast.error('Voer lead data in');
      return;
    }

    try {
      setImportingLeads(true);
      
      // Parse CSV-like data
      const lines = leadImportData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const leadsData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const lead: any = {};
        headers.forEach((header, index) => {
          lead[header] = values[index] || '';
        });
        return lead;
      });

      const response = await fetch('/api/admin/leads/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsData, source: 'import' })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.results.successful} leads geïmporteerd`);
        setLeadImportData('');
        setShowLeadImport(false);
        fetchLeads();
      } else {
        toast.error(result.error || 'Fout bij importeren leads');
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      toast.error('Fout bij importeren leads');
    } finally {
      setImportingLeads(false);
    }
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject) {
      toast.error('Vul alle velden in');
      return;
    }

    try {
      const response = await fetch('/api/admin/bulk-email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Campagne aangemaakt');
        setCampaignForm({ name: '', subject: '', template_type: 'welcome' });
        setShowCampaignModal(false);
        fetchCampaigns();
      } else {
        toast.error(result.error || 'Fout bij aanmaken campagne');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Fout bij aanmaken campagne');
    }
  };

  // View campaign recipients
  const handleViewRecipients = async (campaign: BulkEmailCampaign) => {
      try {
      const response = await fetch(`/api/admin/bulk-email-recipients?campaignId=${campaign.id}`, {
        cache: 'no-store'
        });
        const data = await response.json();
      
      if (response.ok) {
        setSelectedCampaignRecipients(data.recipients || []);
        setSelectedCampaign(campaign);
        setShowRecipientsModal(true);
        } else {
        toast.error('Fout bij laden ontvangers');
        }
      } catch (error) {
      console.error('Error loading recipients:', error);
      toast.error('Fout bij laden ontvangers');
    }
  };

  // Send test email
  const handleSendTest = async (campaign: BulkEmailCampaign) => {
    try {
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: 'chiel@media2net.nl',
          subject: campaign.subject,
          campaignName: campaign.name
        })
      });

      if (response.ok) {
        toast.success('Test email verzonden naar chiel@media2net.nl');
    } else {
        toast.error('Fout bij verzenden test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Fout bij verzenden test email');
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Weet je zeker dat je deze campagne wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/bulk-email-campaigns?id=${campaignId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Campagne verwijderd');
        fetchCampaigns();
    } else {
        toast.error('Fout bij verwijderen campagne');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Fout bij verwijderen campagne');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [leads, campaigns]);

  if (loading) {
  return (
      <div className="p-6 bg-[#0F1419] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-[#8BAE5A]">Data laden...</p>
        </div>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0F1419] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F3F3F1] mb-2">Email Marketing Platform</h1>
          <p className="text-[#8BAE5A]">Beheer leads, campagnes en bulk verzending</p>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#8BAE5A] mb-1">{stats.totalLeads}</div>
              <div className="text-sm text-[#8A9BA8]">Totaal Leads</div>
              <div className="text-xs text-[#8BAE5A] mt-1">{stats.activeLeads} actief</div>
            </div>
          </AdminCard>
          
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-1">{stats.totalCampaigns}</div>
              <div className="text-sm text-[#8A9BA8]">Campagnes</div>
                </div>
          </AdminCard>
          
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4ECDC4] mb-1">{stats.totalSent}</div>
              <div className="text-sm text-[#8A9BA8]">Verzonden</div>
              <div className="text-xs text-[#4ECDC4] mt-1">{stats.avgOpenRate}% open rate</div>
                  </div>
          </AdminCard>
          
          <AdminCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FF6B6B] mb-1">{stats.totalClicks}</div>
              <div className="text-sm text-[#8A9BA8]">Clicks</div>
              <div className="text-xs text-[#FF6B6B] mt-1">{stats.avgClickRate}% click rate</div>
                    </div>
          </AdminCard>
                    </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-[#232D1A] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'leads'
                  ? 'bg-[#8BAE5A] text-[#0F1419]'
                  : 'text-[#8A9BA8] hover:text-[#F3F3F1]'
              }`}
            >
              <UsersIcon className="w-4 h-4 inline mr-2" />
              Leads ({stats.totalLeads})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-[#8BAE5A] text-[#0F1419]'
                  : 'text-[#8A9BA8] hover:text-[#F3F3F1]'
              }`}
            >
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Campagnes ({stats.totalCampaigns})
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#8BAE5A] text-[#0F1419]'
                  : 'text-[#8A9BA8] hover:text-[#F3F3F1]'
              }`}
            >
              <ChartBarIcon className="w-4 h-4 inline mr-2" />
              Overzicht
            </button>
                </div>
              </div>
              
        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <AdminCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#F3F3F1]">Lead Management</h2>
              <div className="flex space-x-3">
                <AdminButton
                  onClick={() => setShowLeadImport(true)}
                  className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
                >
                  <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                  Import Leads
                </AdminButton>
                <AdminButton
                  onClick={fetchLeads}
                  className="bg-[#4ECDC4] hover:bg-[#3DBBB3] text-[#0F1419]"
                >
                  <span className="mr-2">🔄</span>
                  Refresh
                </AdminButton>
              </div>
            </div>

            {loadingLeads ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                <p className="text-[#8BAE5A]">Leads laden...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3A4D23]">
                      <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Naam</th>
                      <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Bron</th>
                      <th className="text-left py-3 px-4 text-[#8A9BA8] font-medium">Toegevoegd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-[#3A4D23] hover:bg-[#232D1A]/50">
                        <td className="py-3 px-4 text-[#F3F3F1] font-medium">
                          {lead.full_name || `${lead.first_name} ${lead.last_name}`.trim() || 'Onbekend'}
                        </td>
                        <td className="py-3 px-4 text-[#8BAE5A]">{lead.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lead.status === 'active' ? 'bg-[#8BAE5A] text-[#0F1419]' :
                            lead.status === 'unsubscribed' ? 'bg-[#FF6B6B] text-white' :
                            lead.status === 'bounced' ? 'bg-[#FFD700] text-[#0F1419]' :
                            'bg-[#8A9BA8] text-white'
                          }`}>
                            {lead.status === 'active' ? 'Actief' : 
                             lead.status === 'unsubscribed' ? 'Uitgeschreven' : 
                             lead.status === 'bounced' ? 'Bounce' : 'Inactief'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#8A9BA8] capitalize">{lead.source}</td>
                        <td className="py-3 px-4 text-[#8A9BA8] text-sm">
                          {new Date(lead.created_at).toLocaleDateString('nl-NL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {leads.length === 0 && (
                  <div className="text-center py-8">
                    <UserPlusIcon className="w-12 h-12 text-[#8A9BA8] mx-auto mb-4" />
                    <p className="text-[#8A9BA8] mb-4">Nog geen leads toegevoegd</p>
                    <AdminButton
                      onClick={() => setShowLeadImport(true)}
                      className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Importeer je eerste leads
                    </AdminButton>
                  </div>
                )}
              </div>
            )}
          </AdminCard>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <AdminCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#F3F3F1]">Bulk Email Campagnes</h2>
              <div className="flex space-x-3">
                  <AdminButton
                  onClick={() => setShowCampaignModal(true)}
                  className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nieuwe Campagne
                  </AdminButton>
                <AdminButton
                  onClick={fetchCampaigns}
                  className="bg-[#4ECDC4] hover:bg-[#3DBBB3] text-[#0F1419]"
                >
                  <span className="mr-2">🔄</span>
                  Refresh
                </AdminButton>
              </div>
      </div>

            {loadingCampaigns ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
                <p className="text-[#8BAE5A]">Campagnes laden...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-6 hover:border-[#8BAE5A] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-[#8BAE5A] text-[#0F1419] rounded-full flex items-center justify-center font-bold">
                            📧
                </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#F3F3F1] text-lg">{campaign.name}</h3>
                            <p className="text-[#8BAE5A] text-sm">{campaign.subject}</p>
                            <p className="text-[#8A9BA8] text-xs">
                              Template: {campaign.template_type} • {campaign.total_recipients} ontvangers
                            </p>
                  </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'completed' ? 'bg-[#8BAE5A] text-[#0F1419]' :
                              campaign.status === 'sending' ? 'bg-[#FFD700] text-[#0F1419]' :
                              campaign.status === 'scheduled' ? 'bg-[#4ECDC4] text-[#0F1419]' :
                              campaign.status === 'paused' ? 'bg-[#FF6B6B] text-white' :
                              'bg-[#8A9BA8] text-white'
                            }`}>
                              {campaign.status === 'completed' ? 'Voltooid' : 
                               campaign.status === 'sending' ? 'Verzenden...' : 
                               campaign.status === 'scheduled' ? 'Gepland' : 
                               campaign.status === 'paused' ? 'Gepauzeerd' : 
                               campaign.status === 'cancelled' ? 'Geannuleerd' : 'Concept'}
                            </span>
                </div>
              </div>
              
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleViewRecipients(campaign)}
                              className="px-4 py-2 bg-[#B6C948] hover:bg-[#A5B837] text-[#0F1419] font-medium rounded-lg transition-colors flex items-center"
                            >
                              <UsersIcon className="w-4 h-4 mr-2" />
                              Ontvangers ({campaign.total_recipients})
                            </button>
                            
                            <button
                              onClick={() => handleSendTest(campaign)}
                              className="px-4 py-2 bg-[#FFD700] hover:bg-[#E6C200] text-[#0F1419] font-medium rounded-lg transition-colors flex items-center"
                            >
                              <span className="mr-2">📧</span>
                              Test Email
                            </button>
                            
                            <button
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="px-4 py-2 bg-[#FF6B6B] hover:bg-[#E55A5A] text-white font-medium rounded-lg transition-colors flex items-center"
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Verwijder
                            </button>
              </div>
              
                          <div className="flex items-center gap-6 text-sm text-[#8A9BA8]">
              <div>
                              <span className="text-[#F3F3F1] font-medium">{campaign.sent_count}</span> verzonden
              </div>
              <div>
                              <span className="text-[#F3F3F1] font-medium">
                                {campaign.sent_count > 0 ? Math.round((campaign.open_count / campaign.sent_count) * 100) : 0}%
                              </span> geopend
              </div>
                            <div>
                              <span className="text-[#F3F3F1] font-medium">
                                {campaign.sent_count > 0 ? Math.round((campaign.click_count / campaign.sent_count) * 100) : 0}%
                              </span> geklikt
            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {campaigns.length === 0 && (
                  <div className="text-center py-8">
                    <EnvelopeIcon className="w-12 h-12 text-[#8A9BA8] mx-auto mb-4" />
                    <p className="text-[#8A9BA8] mb-4">Nog geen campagnes aangemaakt</p>
              <AdminButton
                      onClick={() => setShowCampaignModal(true)}
                      className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Maak je eerste campagne
              </AdminButton>
            </div>
                )}
        </div>
            )}
          </AdminCard>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AdminCard>
              <h2 className="text-xl font-semibold text-[#F3F3F1] mb-4">Platform Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#F3F3F1]">Email Tracking</h3>
                      <p className="text-sm text-[#8A9BA8]">Systeem status</p>
                    </div>
                    <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                  </div>
                  </div>
                
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                <div className="flex items-center justify-between">
                  <div>
                      <h3 className="font-medium text-[#F3F3F1]">Lead Database</h3>
                      <p className="text-sm text-[#8A9BA8]">{stats.totalLeads} leads</p>
                  </div>
                    <UsersIcon className="w-6 h-6 text-[#4ECDC4]" />
                </div>
              </div>
              
                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#F3F3F1]">Campagne Status</h3>
                      <p className="text-sm text-[#8A9BA8]">{stats.totalCampaigns} campagnes</p>
                    </div>
                    <EnvelopeIcon className="w-6 h-6 text-[#FFD700]" />
                  </div>
                </div>

                <div className="bg-[#232D1A] p-4 rounded-lg border border-[#3A4D23]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#F3F3F1]">Bulk Verzending</h3>
                      <p className="text-sm text-[#8A9BA8]">Klaar voor gebruik</p>
                        </div>
                    <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
                                </div>
                                    </div>
                                  </div>
            </AdminCard>

            <AdminCard>
              <h2 className="text-xl font-semibold text-[#F3F3F1] mb-4">Volgende Stappen</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                  <div className="w-8 h-8 bg-[#8BAE5A] text-[#0F1419] rounded-full flex items-center justify-center font-bold mr-3">
                    1
                                    </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#F3F3F1]">Importeer je leads</h3>
                    <p className="text-sm text-[#8A9BA8]">Voeg alle 36 leads toe via CSV import</p>
                                  </div>
                  <AdminButton
                    onClick={() => setActiveTab('leads')}
                    className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419] text-sm"
                  >
                    Ga naar Leads
                  </AdminButton>
                                  </div>
                                  
                <div className="flex items-center p-3 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                  <div className="w-8 h-8 bg-[#FFD700] text-[#0F1419] rounded-full flex items-center justify-center font-bold mr-3">
                    2
                                    </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#F3F3F1]">Maak je eerste campagne</h3>
                    <p className="text-sm text-[#8A9BA8]">Configureer de welkom email voor alle leads</p>
                                  </div>
                  <AdminButton
                    onClick={() => setActiveTab('campaigns')}
                    className="bg-[#FFD700] hover:bg-[#E6C200] text-[#0F1419] text-sm"
                  >
                    Ga naar Campagnes
                  </AdminButton>
                                </div>
                
                <div className="flex items-center p-3 bg-[#232D1A] rounded-lg border border-[#3A4D23]">
                  <div className="w-8 h-8 bg-[#4ECDC4] text-[#0F1419] rounded-full flex items-center justify-center font-bold mr-3">
                    3
                                </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#F3F3F1]">Start bulk verzending</h3>
                    <p className="text-sm text-[#8A9BA8]">Verzend naar alle leads met volledige tracking</p>
                                    </div>
                  <span className="text-[#8A9BA8] text-sm">Wacht op groen licht</span>
                                  </div>
                                    </div>
            </AdminCard>
                                  </div>
        )}
                                    </div>

      {/* Lead Import Modal */}
      {showLeadImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#8BAE5A]">Import Leads</h2>
              <button
                onClick={() => {
                  setShowLeadImport(false);
                  setLeadImportData('');
                }}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
                                  </div>
            
            <div className="mb-4">
              <label className="block text-[#F3F3F1] font-medium mb-2">CSV Data (email, first_name, last_name)</label>
              <textarea
                value={leadImportData}
                onChange={(e) => setLeadImportData(e.target.value)}
                placeholder="email@example.com,Jan,Jansen&#10;info@company.com,Peter,de Vries&#10;..."
                className="w-full h-32 p-3 bg-[#141A15] border border-[#3A4D23] rounded-lg text-[#F3F3F1] placeholder-[#8A9BA8] focus:border-[#8BAE5A] focus:outline-none"
              />
                                  </div>
            
            <div className="flex justify-end space-x-3">
              <AdminButton
                onClick={() => {
                  setShowLeadImport(false);
                  setLeadImportData('');
                }}
                className="bg-[#8A9BA8] hover:bg-[#798A97] text-white"
              >
                Annuleren
              </AdminButton>
              <AdminButton
                onClick={handleLeadImport}
                disabled={importingLeads}
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
              >
                {importingLeads ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0F1419] mr-2"></div>
                    Importeren...
                  </>
                ) : (
                  'Importeer Leads'
                )}
              </AdminButton>
                  </div>
                </div>
              </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#8BAE5A]">Nieuwe Campagne</h2>
              <button
                onClick={() => {
                  setShowCampaignModal(false);
                  setCampaignForm({ name: '', subject: '', template_type: 'welcome' });
                }}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
                    </div>
            
            <div className="space-y-4">
                    <div>
                <label className="block text-[#F3F3F1] font-medium mb-2">Campagne Naam</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Welkom & Introductie"
                  className="w-full p-3 bg-[#141A15] border border-[#3A4D23] rounded-lg text-[#F3F3F1] placeholder-[#8A9BA8] focus:border-[#8BAE5A] focus:outline-none"
                />
                    </div>
              
              <div>
                <label className="block text-[#F3F3F1] font-medium mb-2">Email Onderwerp</label>
                <input
                  type="text"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  placeholder="🎯 Welkom bij Top Tier Men"
                  className="w-full p-3 bg-[#141A15] border border-[#3A4D23] rounded-lg text-[#F3F3F1] placeholder-[#8A9BA8] focus:border-[#8BAE5A] focus:outline-none"
                />
                  </div>
              
              <div>
                <label className="block text-[#F3F3F1] font-medium mb-2">Template Type</label>
                <select
                  value={campaignForm.template_type}
                  onChange={(e) => setCampaignForm({ ...campaignForm, template_type: e.target.value })}
                  className="w-full p-3 bg-[#141A15] border border-[#3A4D23] rounded-lg text-[#F3F3F1] focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="welcome">Welkom Email</option>
                  <option value="marketing">Marketing Email</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <AdminButton
                onClick={() => {
                  setShowCampaignModal(false);
                  setCampaignForm({ name: '', subject: '', template_type: 'welcome' });
                }}
                className="bg-[#8A9BA8] hover:bg-[#798A97] text-white"
              >
                Annuleren
              </AdminButton>
              <AdminButton
                onClick={handleCreateCampaign}
                className="bg-[#8BAE5A] hover:bg-[#B6C948] text-[#0F1419]"
              >
                Aanmaken
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Recipients Modal */}
      {showRecipientsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#8BAE5A]">
                Ontvangers: {selectedCampaign.name}
              </h2>
              <button
                onClick={() => {
                  setShowRecipientsModal(false);
                  setSelectedCampaign(null);
                  setSelectedCampaignRecipients([]);
                }}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {selectedCampaignRecipients.length > 0 ? (
              <div className="space-y-3">
                {selectedCampaignRecipients.map((recipient) => {
                  const statusBadge = {
                    text: recipient.status === 'sent' ? '📬 BEZORGD' : 
                          recipient.status === 'opened' ? '👁️ GEOPEND' : 
                          recipient.status === 'clicked' ? '✅ GEKLIKT' : 
                          recipient.status === 'bounced' ? '❌ BOUNCE' : 
                          recipient.status === 'failed' ? '💥 MISLUKT' : '⏳ PENDING',
                    bg: recipient.status === 'sent' ? 'bg-blue-500' : 
                        recipient.status === 'opened' ? 'bg-green-500' : 
                        recipient.status === 'clicked' ? 'bg-[#8BAE5A]' : 
                        recipient.status === 'bounced' ? 'bg-red-500' : 
                        recipient.status === 'failed' ? 'bg-orange-500' : 'bg-gray-500'
                  };

                  return (
                    <div key={recipient.id} className="bg-[#141A15] p-4 rounded-lg border border-[#3A4D23]">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white">{recipient.full_name || `${recipient.first_name} ${recipient.last_name}`.trim()}</span>
                          <span className="ml-2 text-sm text-[#8BAE5A]">{recipient.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`${statusBadge.bg} px-2 py-1 rounded text-xs text-white`}>
                            {statusBadge.text}
                          </span>
                          {recipient.sent_at && (
                            <span className="text-blue-400 text-xs">
                              {new Date(recipient.sent_at).toLocaleString('nl-NL')}
                            </span>
                          )}
                        </div>
                      </div>
                      {recipient.bounce_reason && (
                        <div className="mt-2 text-sm text-red-400">
                          Bounce reden: {recipient.bounce_reason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#141A15] text-white rounded-lg p-8 text-center">
                <p className="text-[#8BAE5A]">Geen ontvangers gevonden voor deze campagne.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 