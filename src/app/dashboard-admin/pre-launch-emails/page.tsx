'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  EnvelopeIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface PreLaunchEmail {
  id: string;
  email: string;
  name?: string;
  source: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed' | 'pending';
  package?: string;
  notes?: string;
}

export default function PreLaunchEmailsPage() {
  const [emails, setEmails] = useState<PreLaunchEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<PreLaunchEmail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState<PreLaunchEmail | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from database
  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/prelaunch-emails');
      const data = await response.json();

      if (data.success) {
        // Convert database format to component format
        const formattedEmails = data.emails.map((email: any) => ({
          id: email.id,
          email: email.email,
          name: email.name,
          source: email.source,
          subscribedAt: new Date(email.subscribed_at),
          status: email.status,
          package: email.package,
          notes: email.notes
        }));
        
        setEmails(formattedEmails);
      } else {
        // If it's a table setup error, try to setup the table
        if (data.error && data.error.includes('42P01')) {
          console.log('Table does not exist, setting up...');
          await setupDatabase();
          // Retry fetching after setup
          setTimeout(() => fetchEmails(), 1000);
        } else {
          setError(data.error || 'Failed to fetch emails');
        }
      }
    } catch (err) {
      console.error('Error fetching prelaunch emails:', err);
      setError('Failed to load prelaunch emails');
    } finally {
      setLoading(false);
    }
  };

  // Setup database function
  const setupDatabase = async () => {
    try {
      const response = await fetch('/api/admin/setup-prelaunch-emails', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        console.log('Database setup completed successfully');
      } else {
        console.error('Database setup failed:', data.error);
      }
    } catch (err) {
      console.error('Error setting up database:', err);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    let filtered = emails;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(email => 
        email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(email => email.status === statusFilter);
    }

    setFilteredEmails(filtered);
    setCurrentPage(1);
  }, [emails, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmails = filteredEmails.slice(startIndex, endIndex);

  const addEmail = async (emailData: Omit<PreLaunchEmail, 'id' | 'subscribedAt'>) => {
    try {
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const data = await response.json();

      if (data.success) {
        const newEmail: PreLaunchEmail = {
          id: data.email.id,
          email: data.email.email,
          name: data.email.name,
          source: data.email.source,
          subscribedAt: new Date(data.email.subscribed_at),
          status: data.email.status,
          package: data.email.package,
          notes: data.email.notes
        };
        setEmails([newEmail, ...emails]);
        setShowAddModal(false);
      } else {
        alert('Error: ' + (data.error || 'Failed to add email'));
      }
    } catch (err) {
      console.error('Error adding email:', err);
      alert('Failed to add email');
    }
  };

  const updateEmail = async (id: string, emailData: Partial<PreLaunchEmail>) => {
    try {
      const response = await fetch('/api/admin/prelaunch-emails', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...emailData })
      });

      const data = await response.json();

      if (data.success) {
        setEmails(emails.map(email => 
          email.id === id ? { ...email, ...emailData } : email
        ));
        setEditingEmail(null);
      } else {
        alert('Error: ' + (data.error || 'Failed to update email'));
      }
    } catch (err) {
      console.error('Error updating email:', err);
      alert('Failed to update email');
    }
  };

  const deleteEmail = async (id: string) => {
    if (confirm('Weet je zeker dat je deze e-mail wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/admin/prelaunch-emails?id=${id}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
          setEmails(emails.filter(email => email.id !== id));
        } else {
          alert('Error: ' + (data.error || 'Failed to delete email'));
        }
      } catch (err) {
        console.error('Error deleting email:', err);
        alert('Failed to delete email');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'unsubscribed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending': return <CalendarIcon className="w-4 h-4" />;
      case 'unsubscribed': return <XCircleIcon className="w-4 h-4" />;
      default: return <EnvelopeIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Laden van prelaunch e-mails...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1419] text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="text-red-500 mb-4 text-6xl">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Database Setup Required</h2>
          <p className="text-red-400 mb-6">{error}</p>
          
          <div className="bg-[#1F2937] rounded-lg p-6 border border-[#374151] mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Setup Instructions:</h3>
            <ol className="text-gray-300 text-left space-y-2">
              <li>1. Ga naar je <strong>Supabase Dashboard</strong></li>
              <li>2. Open de <strong>SQL Editor</strong></li>
              <li>3. Kopieer en plak de SQL code uit <code className="bg-gray-800 px-2 py-1 rounded">setup_prelaunch_emails_manual.sql</code></li>
              <li>4. Voer de SQL uit</li>
              <li>5. Kom terug en klik op "Opnieuw proberen"</li>
            </ol>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={fetchEmails}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Opnieuw proberen
            </button>
            <button 
              onClick={setupDatabase}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Setup Database
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pre-launch E-mail Beheer</h1>
            <p className="text-gray-400">
              Beheer e-mail abonnementen voor de pre-launch campagne
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await fetch('/api/admin/setup-prelaunch-emails', { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                  alert('Database setup completed!');
                  await fetchEmails();
                } else {
                  alert('Setup failed: ' + data.error);
                }
              } catch (err) {
                alert('Setup failed');
              } finally {
                setLoading(false);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Setup Database
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <EnvelopeIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Totaal Abonnementen</p>
                <p className="text-2xl font-bold text-white">{emails.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Actieve Abonnementen</p>
                <p className="text-2xl font-bold text-white">
                  {emails.filter(email => email.status === 'active').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Deze Week</p>
                <p className="text-2xl font-bold text-white">
                  {emails.filter(email => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return email.subscribedAt >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <UserIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Premium/Ultimate</p>
                <p className="text-2xl font-bold text-white">
                  {emails.filter(email => email.package === 'Premium' || email.package === 'Ultimate').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Actieve Abonnementen</p>
                <p className="text-2xl font-bold text-white">
                  {emails.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">In Afwachting</p>
                <p className="text-2xl font-bold text-white">
                  {emails.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1F2937] rounded-lg p-6 border border-[#374151]"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <UserIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Premium Pakketten</p>
                <p className="text-2xl font-bold text-white">
                  {emails.filter(e => e.package === 'Premium' || e.package === 'Ultimate').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek op e-mail, naam of bron..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1F2937] border border-[#374151] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Statussen</option>
              <option value="active">Actief</option>
              <option value="pending">In Afwachting</option>
              <option value="unsubscribed">Uitgeschreven</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              E-mail Toevoegen
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1F2937] rounded-lg border border-[#374151] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#374151]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Naam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Bron
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pakket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#374151]">
                {currentEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-[#374151]/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{email.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{email.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{email.source}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                        {getStatusIcon(email.status)}
                        {email.status === 'active' && 'Actief'}
                        {email.status === 'pending' && 'In Afwachting'}
                        {email.status === 'unsubscribed' && 'Uitgeschreven'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{email.package || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {email.subscribedAt.toLocaleDateString('nl-NL')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingEmail(email)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEmail(email.id)}
                          className="text-red-400 hover:text-red-300"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-400">
              Toon {startIndex + 1} tot {Math.min(endIndex, filteredEmails.length)} van {filteredEmails.length} resultaten
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[#1F2937] border border-[#374151] rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Vorige
              </button>
              <span className="px-3 py-1 text-white">
                Pagina {currentPage} van {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-[#1F2937] border border-[#374151] rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volgende
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingEmail) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1F2937] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingEmail ? 'E-mail Bewerken' : 'E-mail Toevoegen'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const emailData = {
                email: formData.get('email') as string,
                name: formData.get('name') as string,
                source: formData.get('source') as string,
                status: formData.get('status') as 'active' | 'pending' | 'unsubscribed',
                package: formData.get('package') as string,
                notes: formData.get('notes') as string
              };

              if (editingEmail) {
                updateEmail(editingEmail.id, emailData);
              } else {
                addEmail(emailData);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingEmail?.email}
                    className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Naam
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingEmail?.name}
                    className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Bron *
                  </label>
                  <select
                    name="source"
                    required
                    defaultValue={editingEmail?.source}
                    className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecteer bron</option>
                    <option value="Website Form">Website Form</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Referral">Referral</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingEmail?.status}
                    className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Actief</option>
                    <option value="pending">In Afwachting</option>
                    <option value="unsubscribed">Uitgeschreven</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Pakket
                  </label>
                  <select
                    name="package"
                    defaultValue={editingEmail?.package}
                    className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Geen pakket</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="Ultimate">Ultimate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notities
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingEmail?.notes}
                    className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  {editingEmail ? 'Bijwerken' : 'Toevoegen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEmail(null);
                  }}
                  className="flex-1 px-4 py-2 bg-[#374151] hover:bg-[#4B5563] text-white rounded transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 