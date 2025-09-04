'use client';
import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon,
  TrashIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface PreLaunchEmail {
  id: string;
  email: string;
  name: string;
  source: string;
  subscribedAt: Date;
  status: string;
  notes?: string;
  package?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_source?: string;
}

interface NewLeadForm {
  email: string;
  name: string;
  source: string;
  status: string;
  notes: string;
}

interface EditLeadForm {
  email: string;
  name: string;
  source: string;
  status: string;
  notes: string;
  package?: string;
}

export default function PreLaunchEmails() {
  const [emails, setEmails] = useState<PreLaunchEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<PreLaunchEmail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  
  const [newLead, setNewLead] = useState<NewLeadForm>({
    email: '',
    name: '',
    source: '',
    status: 'active',
    notes: ''
  });

  const [editLead, setEditLead] = useState<EditLeadForm>({
    email: '',
    name: '',
    source: '',
    status: 'active',
    notes: '',
    package: ''
  });

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/prelaunch-emails');
      const data = await response.json();

      if (data.success) {
        const formattedEmails = data.emails.map((email: any) => ({
          id: email.id,
          email: email.email,
          name: email.name,
          source: email.source,
          subscribedAt: new Date(email.subscribed_at || email.subscribedAt),
          status: email.status?.toLowerCase() || 'active',
          notes: email.notes,
          package: email.package,
          utm_campaign: email.utm_campaign,
          utm_content: email.utm_content,
          utm_source: email.utm_source
        }));
        setEmails(formattedEmails);
      } else {
        setError(data.error || 'Failed to fetch emails');
      }
    } catch (err) {
      console.error('Error fetching prelaunch emails:', err);
      setError('Failed to load prelaunch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async () => {
    if (!newLead.email || !newLead.name) {
      toast.error('Email en naam zijn verplicht');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLead),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lead succesvol toegevoegd!');
        setShowAddModal(false);
        setNewLead({
          email: '',
          name: '',
          source: '',
          status: 'active',
          notes: ''
        });
        fetchEmails(); // Refresh the list
      } else {
        toast.error(data.error || 'Fout bij toevoegen van lead');
      }
    } catch (err) {
      console.error('Error adding lead:', err);
      toast.error('Fout bij toevoegen van lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailClick = (email: PreLaunchEmail) => {
    setSelectedEmail(email);
    setEditLead({
      email: email.email,
      name: email.name,
      source: email.source || '',
      status: email.status,
      notes: email.notes || '',
      package: email.package || ''
    });
    setIsEditing(false);
    setShowDetailModal(true);
  };

  const handleUpdateLead = async () => {
    if (!selectedEmail || !editLead.email || !editLead.name) {
      toast.error('Email en naam zijn verplicht');
      return;
    }

    try {
      setUpdating(true);
      
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedEmail.id,
          ...editLead
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lead succesvol bijgewerkt!');
        setIsEditing(false);
        fetchEmails(); // Refresh the list
        // Update the selected email with new data
        if (selectedEmail) {
          setSelectedEmail({
            ...selectedEmail,
            email: editLead.email,
            name: editLead.name,
            source: editLead.source,
            status: editLead.status,
            notes: editLead.notes,
            package: editLead.package
          });
        }
      } else {
        toast.error(data.error || 'Fout bij bijwerken van lead');
      }
    } catch (err) {
      console.error('Error updating lead:', err);
      toast.error('Fout bij bijwerken van lead');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) {
      return;
    }

    try {
      setDeleting(true);
      
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: emailId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lead succesvol verwijderd!');
        setShowDetailModal(false);
        setSelectedEmail(null);
        setIsEditing(false);
        fetchEmails(); // Refresh the list
      } else {
        toast.error(data.error || 'Fout bij verwijderen van lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error('Fout bij verwijderen van lead');
    } finally {
      setDeleting(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (selectedEmail) {
      setEditLead({
        email: selectedEmail.email,
        name: selectedEmail.name,
        source: selectedEmail.source || '',
        status: selectedEmail.status,
        notes: selectedEmail.notes || '',
        package: selectedEmail.package || ''
      });
    }
    setIsEditing(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Calculate statistics
  const total = emails.length;
  const active = emails.filter(e => e.status === 'active').length;
  const pending = emails.filter(e => e.status === 'pending').length;
  const unsubscribed = emails.filter(e => e.status === 'unsubscribed').length;
  const facebookLeads = emails.filter(e => e.utm_campaign || (e.notes && e.notes.includes('Campaign:') && !e.notes.includes('Campaign: test'))).length;
  const organicLeads = emails.filter(e => !e.utm_campaign && !e.utm_source && !(e.notes && e.notes.includes('Campaign:'))).length;
  
  // Get unique sources for filtering
  const sources = [...new Set(emails.map(e => e.source).filter(Boolean))];
  
  // Get recent leads (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLeads = emails.filter(e => e.subscribedAt >= sevenDaysAgo);
  
  // Filter emails based on search and filters
  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (email.notes && email.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = filterSource === 'all' || email.source === filterSource;
    const matchesStatus = filterStatus === 'all' || email.status === filterStatus;
    
    // Campaign filter logic (same as marketing dashboard)
    let matchesCampaign = true;
    if (filterCampaign !== 'all') {
      const hasFacebookCampaign = !!email.utm_campaign || (email.notes && email.notes.includes('Campaign:') && !email.notes.includes('Campaign: test'));
      
      if (filterCampaign === 'facebook') {
        matchesCampaign = !!hasFacebookCampaign;
      } else if (filterCampaign === 'other-utm') {
        matchesCampaign = !!email.utm_source && !email.utm_campaign && !hasFacebookCampaign;
      } else if (filterCampaign === 'organic') {
        matchesCampaign = !hasFacebookCampaign && !email.utm_source;
      }
    }
    
    return matchesSearch && matchesSource && matchesStatus && matchesCampaign;
  });
  
  // Get campaign statistics
  const campaigns = [...new Set(emails.map(e => e.utm_campaign).filter(Boolean))];
  const campaignStats = campaigns.map(campaign => ({
    campaign,
    count: emails.filter(e => e.utm_campaign === campaign).length
  }));

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Pre-launch Lead Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer leads voor de pre-launch campagne</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            {emails.length} leads
          </span>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:from-[#B6C948] hover:to-[#FFD700] transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Lead Toevoegen
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border border-[#8BAE5A] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8BAE5A]">Totaal Leads</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{total}</p>
            </div>
            <EnvelopeIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#FFD700]/10 border border-[#8BAE5A] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8BAE5A]">Actieve Leads</p>
              <p className="text-2xl font-bold text-[#8BAE5A]">{active}</p>
            </div>
            <CheckCircleIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#f0a14f]/10 to-[#FFD700]/10 border border-[#f0a14f] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#f0a14f]">Nieuwe Leads (7d)</p>
              <p className="text-2xl font-bold text-[#f0a14f]">{recentLeads.length}</p>
            </div>
            <ArrowTrendingUpIcon className="w-6 h-6 text-[#f0a14f]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-500">Facebook Leads</p>
              <p className="text-2xl font-bold text-blue-500">{facebookLeads}</p>
              <p className="text-xs text-blue-400 mt-1">{campaigns.length} campagnes</p>
            </div>
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-500">Organische Leads</p>
              <p className="text-2xl font-bold text-green-500">{organicLeads}</p>
              <p className="text-xs text-green-400 mt-1">Geen UTM tracking</p>
            </div>
            <UserGroupIcon className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Recent Leads Section */}
      {recentLeads.length > 0 && (
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#8BAE5A] mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Nieuwe Leads (Laatste 7 dagen)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLeads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[#B6C948]">{lead.name}</h4>
                  <span className="text-xs text-[#8BAE5A] bg-[#8BAE5A]/20 px-2 py-1 rounded">
                    {lead.source}
                  </span>
                </div>
                <p className="text-sm text-[#B6C948] mb-2">{lead.email}</p>
                <p className="text-xs text-gray-400">
                  {lead.subscribedAt.toLocaleDateString('nl-NL')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8BAE5A]" />
            <input
              type="text"
              placeholder="Zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] placeholder-[#8BAE5A] focus:outline-none focus:border-[#8BAE5A]"
            />
          </div>
          
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="all">Alle Bronnen</option>
            {sources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="all">Alle Campagnes</option>
            <option value="facebook">Facebook</option>
            <option value="other-utm">Andere UTM</option>
            <option value="organic">Organisch</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] focus:outline-none focus:border-[#8BAE5A]"
          >
            <option value="all">Alle Statussen</option>
            <option value="active">Actief</option>
            <option value="pending">In Afwachting</option>
            <option value="unsubscribed">Uitgeschreven</option>
          </select>
          
          <div className="text-right">
            <span className="text-[#8BAE5A] text-sm">
              {filteredEmails.length} van {total} leads
            </span>
          </div>
        </div>
      </div>

      {/* Simple Table */}
      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#181F17] border-b border-[#3A4D23]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  E-MAIL
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  NAAM
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  BRON
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  CAMPAGNE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  DATUM
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ACTIES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4D23]">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-[#232D1A] cursor-pointer">
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    onClick={() => handleEmailClick(email)}
                  >
                    {email.email}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    onClick={() => handleEmailClick(email)}
                  >
                    {email.name}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    onClick={() => handleEmailClick(email)}
                  >
                    {email.source}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    onClick={() => handleEmailClick(email)}
                  >
                    {email.utm_campaign ? (
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          Facebook
                        </span>
                        <span className="text-xs text-gray-400">
                          {email.utm_campaign}
                        </span>
                      </div>
                    ) : email.utm_source ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        {email.utm_source}
                      </span>
                    ) : email.notes && email.notes.includes('Campaign:') && !email.notes.includes('Campaign: test') ? (
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          Facebook
                        </span>
                        <span className="text-xs text-gray-400">
                          Legacy (in notes)
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Organisch
                      </span>
                    )}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    onClick={() => handleEmailClick(email)}
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      email.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      email.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {email.status}
                    </span>
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    onClick={() => handleEmailClick(email)}
                  >
                    {email.subscribedAt.toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEmail(email.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Verwijder lead"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Nieuwe Lead Toevoegen</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Bron
                </label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="">Selecteer bron</option>
                  <option value="Website Form">Website Form</option>
                  <option value="Direct Contact">Direct Contact</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Referral">Referral</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook Ad">Facebook Ad</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Status
                </label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead({...newLead, status: e.target.value})}
                  className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="active">Actief</option>
                  <option value="pending">In Afwachting</option>
                  <option value="unsubscribed">Uitgeschreven</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Notities
                </label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  rows={3}
                  placeholder="Optionele notities..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddLead}
                disabled={submitting || !newLead.email || !newLead.name}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] rounded-lg font-semibold hover:from-[#B6C948] hover:to-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Toevoegen...' : 'Toevoegen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail/Edit Modal */}
      {showDetailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A]">
                {isEditing ? 'Lead Bewerken' : 'Lead Details'}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
                    title="Bewerken"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedEmail(null);
                    setIsEditing(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Email *
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editLead.email}
                    onChange={(e) => setEditLead({...editLead, email: e.target.value})}
                    className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  />
                ) : (
                  <p className="text-white">{selectedEmail.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Naam *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editLead.name}
                    onChange={(e) => setEditLead({...editLead, name: e.target.value})}
                    className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  />
                ) : (
                  <p className="text-white">{selectedEmail.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Bron
                </label>
                {isEditing ? (
                  <select
                    value={editLead.source}
                    onChange={(e) => setEditLead({...editLead, source: e.target.value})}
                    className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  >
                    <option value="">Selecteer bron</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Direct Contact">Direct Contact</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Referral">Referral</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook Ad">Facebook Ad</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                ) : (
                  <p className="text-white">{selectedEmail.source || 'Niet opgegeven'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editLead.status}
                    onChange={(e) => setEditLead({...editLead, status: e.target.value})}
                    className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                  >
                    <option value="active">Actief</option>
                    <option value="pending">In Afwachting</option>
                    <option value="unsubscribed">Uitgeschreven</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEmail.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    selectedEmail.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedEmail.status}
                  </span>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-[#B6C948] mb-2">
                    Pakket
                  </label>
                  <input
                    type="text"
                    value={editLead.package || ''}
                    onChange={(e) => setEditLead({...editLead, package: e.target.value})}
                    className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                    placeholder="Optioneel pakket..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Aangemeld op
                </label>
                <p className="text-white">{selectedEmail.subscribedAt.toLocaleDateString('nl-NL')} om {selectedEmail.subscribedAt.toLocaleTimeString('nl-NL')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">
                  Notities
                </label>
                {isEditing ? (
                  <textarea
                    value={editLead.notes}
                    onChange={(e) => setEditLead({...editLead, notes: e.target.value})}
                    className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                    rows={3}
                    placeholder="Optionele notities..."
                  />
                ) : (
                  <p className="text-white">{selectedEmail.notes || 'Geen notities'}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 px-4 py-2 border border-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleUpdateLead}
                    disabled={updating || !editLead.email || !editLead.name}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] rounded-lg font-semibold hover:from-[#B6C948] hover:to-[#FFD700] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A0F0A]"></div>
                        Bijwerken...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Bijwerken
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedEmail(null);
                    }}
                    className="flex-1 px-4 py-2 border border-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
                  >
                    Sluiten
                  </button>
                  <button
                    onClick={() => handleDeleteEmail(selectedEmail.id)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Verwijderen...' : 'Verwijderen'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 