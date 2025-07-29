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
  package: string;
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
    package: 'BASIC',
    notes: ''
  });

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/prelaunch-emails-live');
      const data = await response.json();

      if (data.success) {
        const formattedEmails = data.emails.map((email: any) => ({
          id: email.id,
          email: email.email,
          name: email.name,
          source: email.source,
          subscribedAt: new Date(email.subscribedAt),
          status: email.status.toLowerCase(),
          package: email.package,
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
  const premium = emails.filter(e => e.package === 'PREMIUM').length;
  const ultimate = emails.filter(e => e.package === 'ULTIMATE').length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = emails.filter(e => e.subscribedAt >= weekAgo).length;

  const addEmail = async () => {
    try {
      const response = await fetch('/api/admin/prelaunch-emails-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('E-mail succesvol toegevoegd');
        setShowAddModal(false);
        setFormData({ email: '', name: '', source: '', status: 'ACTIVE', package: 'BASIC', notes: '' });
        fetchEmails();
      } else {
        toast.error(data.error || 'Fout bij toevoegen');
      }
    } catch (err) {
      toast.error('Fout bij toevoegen van e-mail');
    }
  };

  const updateEmail = async () => {
    if (!editingEmail) return;
    
    try {
      const response = await fetch(`/api/admin/prelaunch-emails-live`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEmail.id, ...formData })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('E-mail succesvol bijgewerkt');
        setShowEditModal(false);
        setEditingEmail(null);
        setFormData({ email: '', name: '', source: '', status: 'ACTIVE', package: 'BASIC', notes: '' });
        fetchEmails();
      } else {
        toast.error(data.error || 'Fout bij bijwerken');
      }
    } catch (err) {
      toast.error('Fout bij bijwerken van e-mail');
    }
  };

  const deleteEmail = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze e-mail wilt verwijderen?')) return;
    
    try {
      const response = await fetch(`/api/admin/prelaunch-emails-live`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
        });

        const data = await response.json();
        if (data.success) {
        toast.success('E-mail succesvol verwijderd');
        fetchEmails();
        } else {
        toast.error(data.error || 'Fout bij verwijderen');
      }
    } catch (err) {
      toast.error('Fout bij verwijderen van e-mail');
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

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'PREMIUM': return 'text-[#C49C48]';
      case 'ULTIMATE': return 'text-purple-400';
      case 'BASIC': return 'text-[#8BAE5A]';
      default: return 'text-[#B6C948]';
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
      package: email.package,
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
    'PAKKET': email.package,
    'DATUM': email.subscribedAt.toLocaleDateString('nl-NL')
  }));

  const tableHeaders = ['E-MAIL', 'NAAM', 'BRON', 'STATUS', 'PAKKET', 'DATUM'];

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
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Pre-launch E-mail Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer e-mail abonnementen voor de pre-launch campagne</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            {filteredEmails.length} van {emails.length} e-mails
          </span>
          {loading && (
            <span className="text-[#B6C948] text-sm">Laden...</span>
          )}
          <AdminButton 
            variant="secondary" 
            icon={<ArrowPathIcon className="w-5 h-5" />}
            onClick={fetchEmails}
            loading={loading}
          >
            Verversen
          </AdminButton>
          <AdminButton 
            variant="primary" 
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowAddModal(true)}
          >
            E-mail Toevoegen
          </AdminButton>
              </div>
            </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <AdminStatsCard
          title="Totaal Abonnementen"
          value={total}
          icon={<EnvelopeIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Actieve Abonnementen"
          value={active}
          icon={<CheckCircleIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Deze Week"
          value={thisWeek}
          icon={<CalendarIcon className="w-8 h-8" />}
          color="blue"
        />
        <AdminStatsCard
          title="In Afwachting"
          value={pending}
          icon={<ExclamationTriangleIcon className="w-8 h-8" />}
          color="orange"
        />
        <AdminStatsCard
          title="Uitgeschreven"
          value={unsubscribed}
          icon={<XCircleIcon className="w-8 h-8" />}
          color="red"
        />
        <AdminStatsCard
          title="Premium/Ultimate"
          value={premium + ultimate}
          icon={<ChartBarIcon className="w-8 h-8" />}
          color="purple"
        />
        <AdminStatsCard
          title="Premium Pakketten"
          value={premium + ultimate}
          icon={<UserIcon className="w-8 h-8" />}
          color="orange"
        />
        </div>

      {/* Search and Filters */}
      <AdminCard title="Filters & Zoeken" icon={<FunnelIcon className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op e-mail, naam, bron of notities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              <option value="all">Alle Statussen</option>
              <option value="active">Actief</option>
              <option value="pending">In Afwachting</option>
              <option value="unsubscribed">Uitgeschreven</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              <option value="all">Alle Bronnen</option>
              <option value="Social Media">Social Media</option>
              <option value="Direct Contact">Direct Contact</option>
              <option value="Website Form">Website Form</option>
              <option value="Referral">Referral</option>
              <option value="Email Campaign">Email Campaign</option>
            </select>
          </div>

          {/* Export Button */}
          <AdminButton variant="primary" icon={<DocumentTextIcon className="w-5 h-5" />}>
            Export CSV
          </AdminButton>
        </div>
      </AdminCard>

      {/* Emails Table */}
      <AdminCard title="E-mails Overzicht" icon={<EnvelopeIcon className="w-6 h-6" />}>
        <AdminTable
          headers={tableHeaders}
          data={tableData}
          loading={loading}
          emptyMessage="Geen e-mails gevonden"
          actions={renderActions}
        />
      </AdminCard>

      {/* Add Email Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#8BAE5A]">E-mail Toevoegen</h2>
                        <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                        </button>
                      </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mailadres *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="gebruiker@voorbeeld.nl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Naam *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Jan Jansen"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bron</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="ACTIVE">Actief</option>
                  <option value="PENDING">In Afwachting</option>
                  <option value="UNSUBSCRIBED">Uitgeschreven</option>
                </select>
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pakket</label>
                <select
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ULTIMATE">ULTIMATE</option>
                </select>
        </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notities</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Optionele notities..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#3A4D23] flex justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Annuleren
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={addEmail}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Toevoegen
              </AdminButton>
            </div>
            </div>
          </div>
        )}

      {/* Edit Email Modal */}
      {showEditModal && editingEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#3A4D23]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#8BAE5A]">E-mail Bewerken</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
      </div>

            <div className="p-6 space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mailadres *</label>
                  <input
                    type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Naam *</label>
                  <input
                    type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bron</label>
                  <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="Social Media">Social Media</option>
                  <option value="Direct Contact">Direct Contact</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Referral">Referral</option>
                    <option value="Email Campaign">Email Campaign</option>
                  </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="ACTIVE">Actief</option>
                  <option value="PENDING">In Afwachting</option>
                  <option value="UNSUBSCRIBED">Uitgeschreven</option>
                  </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pakket</label>
                  <select
                  value={formData.package}
                  onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                >
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ULTIMATE">ULTIMATE</option>
                  </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notities</label>
                  <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
              </div>

            <div className="p-6 border-t border-[#3A4D23] flex justify-end space-x-3">
              <AdminButton
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                >
                  Annuleren
              </AdminButton>
              <AdminButton
                variant="primary"
                onClick={updateEmail}
                icon={<PencilIcon className="w-4 h-4" />}
              >
                Opslaan
              </AdminButton>
              </div>
          </div>
        </div>
      )}
    </div>
  );
} 