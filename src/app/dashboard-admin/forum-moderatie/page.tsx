'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldExclamationIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

interface ForumReport {
  id: string;
  postTitle: string;
  postContent: string;
  reporterName: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  reportDate: string;
  lastActivity: string;
}

interface ModerationLog {
  id: string;
  moderatorName: string;
  actionType: string;
  targetType: string;
  reason: string;
  duration?: number;
  createdAt: string;
}

interface ForumStats {
  totalReports: number;
  pendingReports: number;
  investigatingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  totalLogs: number;
  totalFlags: number;
  recentReports: number;
  reportsByReason: Record<string, number>;
}

const getStatusInfo = (status: ForumReport['status']) => {
  switch (status) {
    case 'pending':
      return { label: 'In behandeling', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'investigating':
      return { label: 'Onderzoek', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'resolved':
      return { label: 'Opgelost', color: 'text-green-500', bg: 'bg-green-500/10' };
    case 'dismissed':
      return { label: 'Afgewezen', color: 'text-gray-500', bg: 'bg-gray-500/10' };
    default:
      return { label: 'Onbekend', color: 'text-gray-500', bg: 'bg-gray-800' };
  }
};

export default function ForumModeration() {
  const [activeTab, setActiveTab] = useState<'reports' | 'logs'>('reports');
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [stats, setStats] = useState<ForumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch forum moderation data
  const fetchForumData = async () => {
    try {
      console.log('🔄 Fetching forum moderation data...');
      setLoading(true);
      setError(null);

      // Fetch data from database
      const [reportsResponse, logsResponse, statsResponse] = await Promise.allSettled([
        fetch('/api/admin/forum-reports'),
        fetch('/api/admin/forum-moderation-logs'),
        fetch('/api/admin/forum-stats')
      ]);

      console.log('📊 API responses received');

      // Handle reports
      if (reportsResponse.status === 'fulfilled' && reportsResponse.value.ok) {
        const data = await reportsResponse.value.json();
        console.log('✅ Reports data:', data);
        setReports(data.reports || []);
      } else {
        console.log('❌ Reports API failed, using empty array');
        setReports([]);
      }

      // Handle logs
      if (logsResponse.status === 'fulfilled' && logsResponse.value.ok) {
        const data = await logsResponse.value.json();
        console.log('✅ Logs data:', data);
        setLogs(data.logs || []);
      } else {
        console.log('❌ Logs API failed, using empty array');
        setLogs([]);
      }

      // Handle stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const data = await statsResponse.value.json();
        console.log('✅ Stats data:', data);
        setStats(data.stats || {
          totalReports: 0,
          pendingReports: 0,
          investigatingReports: 0,
          resolvedReports: 0,
          dismissedReports: 0,
          totalLogs: 0,
          totalFlags: 0,
          recentReports: 0,
          reportsByReason: {}
        });
      } else {
        console.log('❌ Stats API failed, using default stats');
        setStats({
          totalReports: 0,
          pendingReports: 0,
          investigatingReports: 0,
          resolvedReports: 0,
          dismissedReports: 0,
          totalLogs: 0,
          totalFlags: 0,
          recentReports: 0,
          reportsByReason: {}
        });
      }

    } catch (error) {
      console.error('❌ Error fetching forum data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumData();
  }, []);

  const handleReportAction = async (reportId: string, action: 'investigate' | 'resolve' | 'dismiss') => {
    try {
      console.log(`🔄 Taking action on report ${reportId}: ${action}`);
      
      const response = await fetch(`/api/admin/forum-reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        console.log('✅ Report action successful');
        // Refresh data
        fetchForumData();
      } else {
        console.error('❌ Report action failed');
      }
    } catch (error) {
      console.error('❌ Error taking report action:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const filteredReports = reports.filter(report =>
    report.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(log =>
    log.moderatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Forum Moderatie</h1>
          <p className="text-gray-400">Beheer forum reports en moderatie activiteiten.</p>
        </div>
        <button
          onClick={fetchForumData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Debug Info */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <p className="text-gray-400 text-sm">
          Debug: Reports: {reports.length} | Logs: {logs.length} | Stats: {stats ? 'Loaded' : 'Not loaded'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AdminStatsCard
          title="Totaal Reports"
          value={stats?.totalReports || 0}
          icon={ShieldExclamationIcon}
          color="red"
          change={stats?.recentReports || 0}
          changeLabel="nieuwe deze week"
        />
        <AdminStatsCard
          title="In Behandeling"
          value={stats?.pendingReports || 0}
          icon={ClockIcon}
          color="orange"
        />
        <AdminStatsCard
          title="Opgelost"
          value={stats?.resolvedReports || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <AdminStatsCard
          title="Moderatie Acties"
          value={stats?.totalLogs || 0}
          icon={ChatBubbleLeftRightIcon}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Moderatie Logs
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek in reports of logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'reports' ? (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Post</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Reporter</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Reden</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Datum</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      {searchTerm ? 'Geen reports gevonden voor deze zoekopdracht.' : 'Geen forum reports gevonden.'}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const statusInfo = getStatusInfo(report.status);
                    return (
                      <tr key={report.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-white">{report.postTitle}</div>
                            <div className="text-sm text-gray-400 mt-1">
                              {report.postContent.substring(0, 100)}...
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white">{report.reporterName}</td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-white">{report.reason}</div>
                            {report.description && (
                              <div className="text-sm text-gray-400 mt-1">{report.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{formatDate(report.reportDate)}</td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {report.status === 'pending' && (
                              <>
                                <AdminButton
                                  onClick={() => handleReportAction(report.id, 'investigate')}
                                  variant="success"
                                  size="sm"
                                  icon={EyeIcon}
                                >
                                  Onderzoek
                                </AdminButton>
                                <AdminButton
                                  onClick={() => handleReportAction(report.id, 'dismiss')}
                                  variant="danger"
                                  size="sm"
                                  icon={XCircleIcon}
                                >
                                  Afwijzen
                                </AdminButton>
                              </>
                            )}
                            {report.status === 'investigating' && (
                              <AdminButton
                                onClick={() => handleReportAction(report.id, 'resolve')}
                                variant="success"
                                size="sm"
                                icon={CheckCircleIcon}
                              >
                                Oplossen
                              </AdminButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      ) : (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Moderator</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Actie</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Reden</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Duur</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      {searchTerm ? 'Geen logs gevonden voor deze zoekopdracht.' : 'Geen moderatie logs gevonden.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4 px-4 text-white">{log.moderatorName}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{log.targetType}</td>
                      <td className="py-4 px-4 text-gray-300">{log.reason}</td>
                      <td className="py-4 px-4 text-gray-300">
                        {log.duration ? `${log.duration} dagen` : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-gray-300">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
} 