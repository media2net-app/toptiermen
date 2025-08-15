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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

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

interface NewLeadForm {
  email: string;
  name: string;
  source: string;
  status: string;
  package: string;
  notes: string;
}

export default function PreLaunchEmails() {
  const [emails, setEmails] = useState<PreLaunchEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newLead, setNewLead] = useState<NewLeadForm>({
    email: '',
    name: '',
    source: '',
    status: 'active',
    package: 'Basic',
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
          package: 'Basic',
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

  useEffect(() => {
    fetchEmails();
  }, []);

  // Calculate statistics
  const total = emails.length;
  const active = emails.filter(e => e.status === 'active').length;
  const pending = emails.filter(e => e.status === 'pending').length;
  const unsubscribed = emails.filter(e => e.status === 'unsubscribed').length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-sm text-[#f0a14f]">In Afwachting</p>
              <p className="text-2xl font-bold text-[#f0a14f]">{pending}</p>
            </div>
            <ExclamationTriangleIcon className="w-6 h-6 text-[#f0a14f]" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-500">Uitgeschreven</p>
              <p className="text-2xl font-bold text-red-500">{unsubscribed}</p>
            </div>
            <XCircleIcon className="w-6 h-6 text-red-500" />
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
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  DATUM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4D23]">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-[#232D1A]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {email.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {email.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {email.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {email.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {email.subscribedAt.toLocaleDateString('nl-NL')}
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
                  Package
                </label>
                <select
                  value={newLead.package}
                  onChange={(e) => setNewLead({...newLead, package: e.target.value})}
                  className="w-full p-3 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:border-[#8BAE5A] focus:outline-none"
                >
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Ultimate">Ultimate</option>
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
    </div>
  );
} 