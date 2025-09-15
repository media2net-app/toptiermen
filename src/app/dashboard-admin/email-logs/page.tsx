'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface EmailLog {
  id: string;
  user_id: string | null;
  to_email: string;
  email_type: string;
  subject: string | null;
  status: string;
  error_message: string | null;
  provider: string | null;
  message_id: string | null;
  template_id: string | null;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
  };
}

interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  success_rate: number;
}

const EmailLogsPage = () => {
  const { user, profile, isAdmin } = useSupabaseAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats>({ total: 0, sent: 0, failed: 0, success_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [startDate, setStartDate] = useState('2024-09-10');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSampleData, setIsSampleData] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchEmailLogs();
    }
  }, [user, isAdmin, startDate, endDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchEmailLogs();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, startDate, endDate]);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/email-logs?start_date=${startDate}&end_date=${endDate}&limit=100`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch email logs');
      }

      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || { total: 0, sent: 0, failed: 0, success_rate: 0 });
        setIsSampleData(data.isSampleData || false);
      } else {
        throw new Error(data.error || 'Failed to fetch email logs');
      }
    } catch (err: any) {
      console.error('Error fetching email logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEmailTypeLabel = (emailType: string) => {
    const types: { [key: string]: string } = {
      'welcome': 'Welkom Email',
      'password_reset': 'Wachtwoord Reset',
      'email_verification': 'Email Verificatie',
      'login_notification': 'Login Notificatie',
      'newsletter': 'Nieuwsbrief',
      'notification': 'Notificatie',
      'system': 'Systeem Email'
    };
    return types[emailType] || emailType;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'delivered':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircleIcon className="w-3 h-3 mr-1" />;
      case 'failed':
        return <XCircleIcon className="w-3 h-3 mr-1" />;
      case 'pending':
        return <ClockIcon className="w-3 h-3 mr-1" />;
      default:
        return <EnvelopeIcon className="w-3 h-3 mr-1" />;
    }
  };

  const openLogDetail = (log: EmailLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const closeLogDetail = () => {
    setSelectedLog(null);
    setShowDetailModal(false);
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="bg-[#232D1A] rounded-2xl p-8 text-center border border-[#3A4D23]">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Toegang Geweigerd</h1>
          <p className="text-[#8BAE5A] mb-6">Je hebt geen admin rechten om deze pagina te bekijken.</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-[#8BAE5A] text-[#181F17] font-bold rounded-xl hover:bg-[#B6C948] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Terug naar Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard-admin"
            className="inline-flex items-center text-[#8BAE5A] hover:text-[#FFD700] mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Terug naar Admin Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Email Logs</h1>
              <p className="text-[#8BAE5A]">Monitor alle verzonden emails vanaf 10 september 2024</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-4 py-2 rounded-xl font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-[#8BAE5A] text-[#181F17]' 
                    : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#4A5D33]'
                }`}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={fetchEmailLogs}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-[#FFD700] text-[#181F17] rounded-xl font-medium hover:bg-[#E6C200] transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Verversen
              </button>
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <div className="bg-[#232D1A] rounded-2xl p-6 mb-6 border border-[#3A4D23]">
          <h2 className="text-lg font-semibold text-white mb-4">Filter Periode</h2>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[#8BAE5A] text-sm mb-1">Van</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
            <div>
              <label className="block text-[#8BAE5A] text-sm mb-1">Tot</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm">Totaal Emails</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <EnvelopeIcon className="w-8 h-8 text-[#8BAE5A]" />
            </div>
          </div>
          
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm">Verzonden</p>
                <p className="text-2xl font-bold text-green-400">{stats.sent}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm">Gefaald</p>
                <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm">Succes Rate</p>
                <p className="text-2xl font-bold text-[#FFD700]">{stats.success_rate}%</p>
              </div>
              <ClockIcon className="w-8 h-8 text-[#FFD700]" />
            </div>
          </div>
        </div>

        {/* Sample Data Notice */}
        {isSampleData && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-yellow-400 font-semibold">Sample Data</h3>
                <p className="text-yellow-300 text-sm mt-1">
                  De email_logs tabel bestaat nog niet in de database. Je ziet nu sample data. 
                  Om echte email logs te zien, moet je de email_logs tabel aanmaken in je Supabase dashboard.
                </p>
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200 text-xs font-mono">
                    CREATE TABLE email_logs (id UUID PRIMARY KEY, user_id UUID, to_email TEXT, email_type TEXT, subject TEXT, status TEXT, error_message TEXT, provider TEXT, message_id TEXT, template_id TEXT, created_at TIMESTAMP DEFAULT NOW());
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mr-3" />
              <div>
                <h3 className="text-red-400 font-semibold">Fout bij ophalen email logs</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Email Logs Table */}
        <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] overflow-hidden">
          <div className="p-6 border-b border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white">Email Logs</h2>
            <p className="text-[#8BAE5A] text-sm mt-1">
              {loading ? 'Laden...' : `${logs.length} logs gevonden`}
            </p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-[#8BAE5A]">Email logs laden...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <EnvelopeIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-4" />
              <p className="text-[#8BAE5A]">Geen email logs gevonden voor de geselecteerde periode.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181F17]">
                  <tr>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Ontvanger</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Email Type</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Onderwerp</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Tijd</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Provider</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Foutmelding</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#181F17]/50 transition-colors cursor-pointer"
                      onClick={() => openLogDetail(log)}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#3A4D23] rounded-full flex items-center justify-center mr-3">
                            <EnvelopeIcon className="w-4 h-4 text-[#8BAE5A]" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{log.to_email}</p>
                            {log.profiles && (
                              <p className="text-[#8BAE5A] text-xs">
                                {log.profiles.full_name || log.profiles.username || 'Onbekend'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#3A4D23] text-[#8BAE5A]">
                          {getEmailTypeLabel(log.email_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm max-w-xs truncate" title={log.subject || 'Geen onderwerp'}>
                          {log.subject || 'Geen onderwerp'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#8BAE5A] text-sm">{formatDate(log.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <GlobeAltIcon className="w-4 h-4 text-[#8BAE5A] mr-2" />
                          <p className="text-[#8BAE5A] text-sm">{log.provider || 'Onbekend'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.error_message ? (
                          <p className="text-red-400 text-sm max-w-xs truncate" title={log.error_message}>
                            {log.error_message}
                          </p>
                        ) : (
                          <p className="text-[#8BAE5A] text-sm">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[#8BAE5A] text-xs">👆 Klik voor details</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Email Log Detail Modal */}
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-[#232D1A] rounded-2xl shadow-2xl border border-[#3A4D23]/40 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Email Log Details</h2>
                <button
                  onClick={closeLogDetail}
                  className="p-2 text-[#8BAE5A] hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div className="bg-[#181F17] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <EnvelopeIcon className="w-5 h-5 mr-2 text-[#8BAE5A]" />
                      Email Informatie
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Naar Email</label>
                        <p className="text-white font-medium">{selectedLog.to_email}</p>
                      </div>
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Email Type</label>
                        <p className="text-white font-medium">{getEmailTypeLabel(selectedLog.email_type)}</p>
                      </div>
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Onderwerp</label>
                        <p className="text-white font-medium">{selectedLog.subject || 'Geen onderwerp'}</p>
                      </div>
                      {selectedLog.profiles && (
                        <div>
                          <label className="text-[#8BAE5A] text-sm">Gebruiker</label>
                          <p className="text-white font-medium">
                            {selectedLog.profiles.full_name || `${selectedLog.profiles.first_name} ${selectedLog.profiles.last_name}` || 'Onbekend'}
                          </p>
                          <p className="text-[#8BAE5A] text-xs">{selectedLog.profiles.role || 'Onbekend'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2 text-[#8BAE5A]" />
                      Timing Informatie
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Verzend Tijd</label>
                        <p className="text-white font-medium">{formatDate(selectedLog.created_at)}</p>
                      </div>
                      <div>
                        <label className="text-[#8BAE5A] text-sm">User ID</label>
                        <p className="text-white font-mono text-sm">{selectedLog.user_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Technical Info */}
                <div className="space-y-6">
                  <div className="bg-[#181F17] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <GlobeAltIcon className="w-5 h-5 mr-2 text-[#8BAE5A]" />
                      Technische Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Provider</label>
                        <p className="text-white font-medium">{selectedLog.provider || 'Onbekend'}</p>
                      </div>
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Message ID</label>
                        <p className="text-white font-mono text-sm">{selectedLog.message_id || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Template ID</label>
                        <p className="text-white font-mono text-sm">{selectedLog.template_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#181F17] rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      {selectedLog.status === 'sent' || selectedLog.status === 'delivered' ? (
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />
                      ) : selectedLog.status === 'failed' ? (
                        <XCircleIcon className="w-5 h-5 mr-2 text-red-400" />
                      ) : (
                        <ClockIcon className="w-5 h-5 mr-2 text-yellow-400" />
                      )}
                      Email Status
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[#8BAE5A] text-sm">Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedLog.status)}`}>
                            {getStatusIcon(selectedLog.status)}
                            {selectedLog.status}
                          </span>
                        </div>
                      </div>
                      {selectedLog.error_message && (
                        <div>
                          <label className="text-[#8BAE5A] text-sm">Foutmelding</label>
                          <div className="mt-1 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm font-mono">{selectedLog.error_message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeLogDetail}
                  className="px-6 py-3 bg-[#3A4D23] text-[#8BAE5A] rounded-xl font-medium hover:bg-[#4A5D33] transition-colors"
                >
                  Sluiten
                </button>
                {selectedLog.user_id && (
                  <button
                    onClick={() => {
                      // TODO: Add user management action
                      console.log('User management for:', selectedLog.user_id);
                    }}
                    className="px-6 py-3 bg-[#8BAE5A] text-[#181F17] rounded-xl font-medium hover:bg-[#B6C948] transition-colors"
                  >
                    Gebruiker Beheren
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailLogsPage;
