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
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface LoginLog {
  id: string;
  user_id: string | null;
  email: string;
  success: boolean;
  error_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  session_id: string | null;
  login_method: string;
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

interface LoginStats {
  total: number;
  successful: number;
  failed: number;
  success_rate: number;
}

const LoginLogsPage = () => {
  const { user, profile, isAdmin } = useSupabaseAuth();
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [stats, setStats] = useState<LoginStats>({ total: 0, successful: 0, failed: 0, success_rate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [startDate, setStartDate] = useState('2024-09-10');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchLoginLogs();
    }
  }, [user, isAdmin, startDate, endDate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLoginLogs();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, startDate, endDate]);

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/login-logs?start_date=${startDate}&end_date=${endDate}&limit=100`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch login logs');
      }

      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || { total: 0, successful: 0, failed: 0, success_rate: 0 });
      } else {
        throw new Error(data.error || 'Failed to fetch login logs');
      }
    } catch (err: any) {
      console.error('Error fetching login logs:', err);
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

  const getBrowserInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
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
              <h1 className="text-3xl font-bold text-white mb-2">Login Logs</h1>
              <p className="text-[#8BAE5A]">Monitor alle inlogpogingen vanaf 10 september 2024</p>
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
                onClick={fetchLoginLogs}
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
                <p className="text-[#8BAE5A] text-sm">Totaal Logins</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <UserIcon className="w-8 h-8 text-[#8BAE5A]" />
            </div>
          </div>
          
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#8BAE5A] text-sm">Succesvol</p>
                <p className="text-2xl font-bold text-green-400">{stats.successful}</p>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mr-3" />
              <div>
                <h3 className="text-red-400 font-semibold">Fout bij ophalen login logs</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Logs Table */}
        <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] overflow-hidden">
          <div className="p-6 border-b border-[#3A4D23]">
            <h2 className="text-xl font-semibold text-white">Login Logs</h2>
            <p className="text-[#8BAE5A] text-sm mt-1">
              {loading ? 'Laden...' : `${logs.length} logs gevonden`}
            </p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-[#8BAE5A]">Login logs laden...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <UserIcon className="w-12 h-12 text-[#8BAE5A] mx-auto mb-4" />
              <p className="text-[#8BAE5A]">Geen login logs gevonden voor de geselecteerde periode.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181F17]">
                  <tr>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Gebruiker</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Email</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Tijd</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">IP Adres</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Browser</th>
                    <th className="px-6 py-4 text-left text-[#8BAE5A] font-medium">Foutmelding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#181F17]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {log.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Succesvol
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Gefaald
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#3A4D23] rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="w-4 h-4 text-[#8BAE5A]" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {log.profiles?.full_name || log.profiles?.username || 'Onbekend'}
                            </p>
                            {log.profiles?.role && (
                              <p className="text-[#8BAE5A] text-xs">{log.profiles.role}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{log.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#8BAE5A] text-sm">{formatDate(log.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <GlobeAltIcon className="w-4 h-4 text-[#8BAE5A] mr-2" />
                          <p className="text-[#8BAE5A] text-sm">{log.ip_address || 'Onbekend'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <ComputerDesktopIcon className="w-4 h-4 text-[#8BAE5A] mr-2" />
                          <div>
                            <p className="text-[#8BAE5A] text-sm">{getBrowserInfo(log.user_agent)}</p>
                            <p className="text-[#8BAE5A] text-xs">{getDeviceInfo(log.user_agent)}</p>
                          </div>
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginLogsPage;
