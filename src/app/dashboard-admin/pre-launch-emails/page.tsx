'use client';
import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  PencilIcon,
  TrashIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CalendarIcon,
  ChartBarIcon,
  UserIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { AdminCard, AdminStatsCard, AdminTable, AdminButton } from '@/components/admin';

interface PreLaunchEmail {
  id: string;
  email: string;
  name: string;
  source: string;
  subscribedAt: Date;
  status: string;
  interestLevel: string;
  notes?: string;
}

export default function PreLaunchEmails() {
  const [emails, setEmails] = useState<PreLaunchEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState<PreLaunchEmail | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    source: '',
    status: 'ACTIVE',
    interestLevel: 'BASIC',
    notes: ''
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
          interestLevel: email.package?.toUpperCase() || 'BASIC',
          notes: email.notes
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

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
        email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (email.notes && email.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || email.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Calculate statistics
  const total = emails.length;
  const active = emails.filter(e => e.status === 'active').length;
  const pending = emails.filter(e => e.status === 'pending').length;
  const unsubscribed = emails.filter(e => e.status === 'unsubscribed').length;

  const addEmail = async () => {
    // Validate form data
    if (!formData.email) {
      toast.error('E-mail adres is verplicht');
      return;
    }

    if (!formData.name) {
      toast.error('Naam is verplicht');
      return;
    }

    try {
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: formData.status.toLowerCase(),
          package: formData.interestLevel.toUpperCase()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Lead succesvol toegevoegd');
        setShowAddModal(false);
        setFormData({ email: '', name: '', source: '', status: 'ACTIVE', interestLevel: 'BASIC', notes: '' });
        fetchEmails();
      } else {
        toast.error(data.error || 'Fout bij toevoegen');
      }
    } catch (err) {
      console.error('Error adding email:', err);
      toast.error('Fout bij toevoegen van lead');
    }
  };

  const updateEmail = async () => {
    if (!editingEmail) return;
    
    // Validate form data
    if (!formData.email) {
      toast.error('E-mail adres is verplicht');
      return;
    }

    if (!formData.name) {
      toast.error('Naam is verplicht');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/prelaunch-emails`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingEmail.id, 
          ...formData,
          status: formData.status.toLowerCase(),
          package: formData.interestLevel.toUpperCase()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Lead succesvol bijgewerkt');
        setShowEditModal(false);
        setEditingEmail(null);
        setFormData({ email: '', name: '', source: '', status: 'ACTIVE', interestLevel: 'BASIC', notes: '' });
        fetchEmails();
      } else {
        toast.error(data.error || 'Fout bij bijwerken');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      toast.error('Fout bij bijwerken van lead');
    }
  };

  const deleteEmail = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) return;
    
    try {
      const response = await fetch(`/api/admin/prelaunch-emails`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Lead succesvol verwijderd');
        fetchEmails();
      } else {
        toast.error(data.error || 'Fout bij verwijderen');
      }
    } catch (err) {
      console.error('Error deleting email:', err);
      toast.error('Fout bij verwijderen van lead');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'unsubscribed': return 'text-red-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'pending': return 'In Afwachting';
      case 'unsubscribed': return 'Uitgeschreven';
      default: return status;
    }
  };

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case 'PREMIUM': return 'text-[#C49C48]';
      case 'ULTIMATE': return 'text-purple-400';
      case 'BASIC': return 'text-[#8BAE5A]';
      default: return 'text-[#B6C948]';
    }
  };

  const getInterestLevelText = (level: string) => {
    switch (level) {
      case 'BASIC': return 'Basis Interesse';
      case 'PREMIUM': return 'Hoge Interesse';
      case 'ULTIMATE': return 'Zeer Hoge Interesse';
      default: return level;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Social Media': return 'bg-pink-500/20 text-pink-400';
      case 'Direct Contact': return 'bg-blue-500/20 text-blue-400';
      case 'Website Form': return 'bg-cyan-500/20 text-cyan-400';
      case 'Referral': return 'bg-orange-500/20 text-orange-400';
      case 'Email Campaign': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleEdit = (email: PreLaunchEmail) => {
    setEditingEmail(email);
    setFormData({
      email: email.email,
      name: email.name,
      source: email.source,
      status: email.status.toUpperCase(),
      interestLevel: email.interestLevel.toUpperCase(),
      notes: email.notes || ''
    });
    setShowEditModal(true);
  };

  // Prepare table data for AdminTable
  const tableData = filteredEmails.map(email => ({
    'E-MAIL': email.email,
    'NAAM': email.name,
    'BRON': email.source,
    'STATUS': getStatusText(email.status),
    'INTERESSE': getInterestLevelText(email.interestLevel),
    'DATUM': email.subscribedAt.toLocaleDateString('nl-NL')
  }));

  const tableHeaders = ['E-MAIL', 'NAAM', 'BRON', 'STATUS', 'INTERESSE', 'DATUM'];

  const renderActions = (item: any) => {
    const email = filteredEmails.find(e => e.email === item['E-MAIL']);
    if (!email) return null;

    return (
      <div className="flex gap-2">
        <AdminButton
          variant="secondary"
          size="sm"
          onClick={() => handleEdit(email)}
          icon={<PencilIcon className="w-4 h-4" />}
        >
          Bewerken
        </AdminButton>
        <AdminButton
          variant="danger"
          size="sm"
          onClick={() => deleteEmail(email.id)}
          icon={<TrashIcon className="w-4 h-4" />}
        >
          Verwijderen
        </AdminButton>
      </div>
    );
  };

  return (
    <div className="space-y-8">
        {/* Header */}
      <div className="flex items-center justify-between">
          <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Pre-launch Lead Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer leads voor de pre-launch campagne - nog geen aanschaf gedaan</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            {filteredEmails.length} van {emails.length} leads
          </span>
          {loading && (
            <span className="text-[#B6C948] text-sm">Laden...</span>
          )}
          <AdminButton
            onClick={() => setShowAddModal(true)}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Lead Toevoegen
          </AdminButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          title="Totaal Leads"
          value={total}
          icon={<EnvelopeIcon className="w-6 h-6" />}
          color="blue"
        />
        <AdminStatsCard
          title="Actieve Leads"
          value={active}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="green"
        />
                  <AdminStatsCard
            title="In Afwachting"
            value={pending}
            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
            color="orange"
          />
        <AdminStatsCard
          title="Uitgeschreven"
          value={unsubscribed}
          icon={<XCircleIcon className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
              <input
                type="text"
                placeholder="Zoeken in leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="all">Alle Statussen</option>
              <option value="active">Actief</option>
              <option value="pending">In Afwachting</option>
              <option value="unsubscribed">Uitgeschreven</option>
            </select>
            
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="all">Alle Bronnen</option>
              <option value="Social Media">Social Media</option>
              <option value="Direct Contact">Direct Contact</option>
              <option value="Website Form">Website Form</option>
              <option value="Referral">Referral</option>
              <option value="Email Campaign">Email Campaign</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard>
        <AdminTable
          headers={tableHeaders}
          data={tableData}
          actions={renderActions}
          loading={loading}
        />
      </AdminCard>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Nieuwe Lead Toevoegen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">E-mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Naam *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Bron</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="">Selecteer bron</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Direct Contact">Direct Contact</option>
                  <option value="Website Form">Website Form</option>
                  <option value="Referral">Referral</option>
                  <option value="Email Campaign">Email Campaign</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="ACTIVE">Actief</option>
                  <option value="PENDING">In Afwachting</option>
                  <option value="UNSUBSCRIBED">Uitgeschreven</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Interesse Niveau</label>
                <select
                  value={formData.interestLevel}
                  onChange={(e) => setFormData({...formData, interestLevel: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="BASIC">Basis Interesse</option>
                  <option value="PREMIUM">Hoge Interesse</option>
                  <option value="ULTIMATE">Zeer Hoge Interesse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Notities</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <AdminButton
                onClick={addEmail}
                className="flex-1"
              >
                Toevoegen
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Annuleren
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] p-6 rounded-xl border border-[#3A4D23] w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-[#8BAE5A]">Lead Bewerken</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">E-mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Naam *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Bron</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="">Selecteer bron</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Direct Contact">Direct Contact</option>
                  <option value="Website Form">Website Form</option>
                  <option value="Referral">Referral</option>
                  <option value="Email Campaign">Email Campaign</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="ACTIVE">Actief</option>
                  <option value="PENDING">In Afwachting</option>
                  <option value="UNSUBSCRIBED">Uitgeschreven</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Interesse Niveau</label>
                <select
                  value={formData.interestLevel}
                  onChange={(e) => setFormData({...formData, interestLevel: e.target.value})}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="BASIC">Basis Interesse</option>
                  <option value="PREMIUM">Hoge Interesse</option>
                  <option value="ULTIMATE">Zeer Hoge Interesse</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#B6C948] mb-2">Notities</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <AdminButton
                onClick={updateEmail}
                className="flex-1"
              >
                Bijwerken
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmail(null);
                }}
                className="flex-1"
              >
                Annuleren
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 