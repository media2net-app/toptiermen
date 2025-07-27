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
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  details: string;
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
      return { text: 'In behandeling', color: 'text-yellow-400', bg: 'bg-yellow-900/50' };
    case 'investigating':
      return { text: 'Onderzoek', color: 'text-orange-400', bg: 'bg-orange-900/50' };
    case 'resolved':
      return { text: 'Opgelost', color: 'text-green-400', bg: 'bg-green-900/50' };
    case 'dismissed':
      return { text: 'Afgewezen', color: 'text-gray-400', bg: 'bg-gray-700/50' };
    default:
      return { text: 'Onbekend', color: 'text-gray-500', bg: 'bg-gray-800' };
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
      setLoading(true);
      setError(null);

      // Fetch data from database with fallback to mock data
      const [reportsResponse, logsResponse, statsResponse] = await Promise.allSettled([
        fetch('/api/admin/forum-reports'),
        fetch('/api/admin/forum-moderation-logs'),
        fetch('/api/admin/forum-stats')
      ]);

      // Handle reports
      if (reportsResponse.status === 'fulfilled' && reportsResponse.value.ok) {
        const data = await reportsResponse.value.json();
        setReports(data.reports || []);
      } else {
        console.log('Using mock reports data');
        // Fallback to mock data
        const mockReports: ForumReport[] = [
          {
            id: '1',
            postTitle: 'Hoe bereik ik mijn fitness doelen?',
            postContent: 'Ik wil graag 10kg afvallen en meer spieren kweken...',
            reporterName: 'Jan Jansen',
            reason: 'Spam',
            description: 'Dit lijkt op spam content',
            status: 'pending',
            reportDate: '2024-01-20T10:30:00',
            lastActivity: '2024-01-20T10:30:00'
          },
          {
            id: '2',
            postTitle: 'Mijn ervaring met intermittent fasting',
            postContent: 'Ik heb al 3 maanden IF gedaan en...',
            reporterName: 'Piet Pietersen',
            reason: 'Inappropriate Content',
            description: 'Ongepaste taal en inhoud',
            status: 'investigating',
            reportDate: '2024-01-19T15:45:00',
            lastActivity: '2024-01-20T09:15:00'
          },
          {
            id: '3',
            postTitle: 'Brotherhood meetup feedback',
            postContent: 'Geweldige ervaring gisteren!...',
            reporterName: 'Klaas Klaassen',
            reason: 'Harassment',
            description: 'Pesterij van andere gebruiker',
            status: 'resolved',
            reportDate: '2024-01-18T14:20:00',
            lastActivity: '2024-01-19T16:30:00'
          }
        ];
        setReports(mockReports);
      }

      // Handle logs
      if (logsResponse.status === 'fulfilled' && logsResponse.value.ok) {
        const data = await logsResponse.value.json();
        setLogs(data.logs || []);
      } else {
        console.log('Using mock logs data');
        // Fallback to mock data
        const mockLogs: ModerationLog[] = [
          {
            id: '1',
            moderatorName: 'Admin Rick',
            action: 'Post verwijderd',
            targetType: 'Post',
            targetId: 'post-123',
            timestamp: '2024-01-20T11:00:00',
            details: 'Spam content verwijderd'
          },
          {
            id: '2',
            moderatorName: 'Admin Rick',
            action: 'Gebruiker gewaarschuwd',
            targetType: 'Gebruiker',
            targetId: 'user-456',
            timestamp: '2024-01-19T16:30:00',
            details: 'Waarschuwing voor ongepast gedrag'
          },
          {
            id: '3',
            moderatorName: 'Admin Rick',
            action: 'Report afgehandeld',
            targetType: 'Report',
            targetId: 'report-789',
            timestamp: '2024-01-18T15:45:00',
            details: 'Report gemarkeerd als opgelost'
          }
        ];
        setLogs(mockLogs);
      }

      // Handle stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const data = await statsResponse.value.json();
        setStats(data.stats);
      } else {
        console.log('Using mock stats data');
        // Fallback to mock data
        setStats({
          totalReports: 3,
          pendingReports: 1,
          investigatingReports: 1,
          resolvedReports: 1,
          dismissedReports: 0,
          totalLogs: 3,
          totalFlags: 0,
          recentReports: 3,
          reportsByReason: {
            'Spam': 1,
            'Inappropriate Content': 1,
            'Harassment': 1
          }
        });
      }

    } catch (error) {
      console.error('Error fetching forum data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumData();
  }, []);

  const handleStatusUpdate = async (reportId: string, newStatus: ForumReport['status']) => {
    try {
      const response = await fetch(`/api/admin/forum-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus, lastActivity: new Date().toISOString() }
            : report
        ));
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      // Fallback to local state update
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, lastActivity: new Date().toISOString() }
          : report
      ));
    }
  };

  const filteredReports = reports.filter(report =>
    report.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.moderatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#8BAE5A] text-xl">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminCard>
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <AdminButton onClick={fetchForumData} variant="primary">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Opnieuw Proberen
          </AdminButton>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Forum Moderatie</h1>
          <p className="text-[#B6C948] mt-2">Beheer forum reports en moderatie activiteiten.</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          icon={<ShieldExclamationIcon className="w-6 h-6" />}
          value={stats?.totalReports || 0}
          title="Totaal Reports"
          color="red"
        />
        <AdminStatsCard
          icon={<ClockIcon className="w-6 h-6" />}
          value={stats?.pendingReports || 0}
          title="In Behandeling"
          color="orange"
        />
        <AdminStatsCard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          value={stats?.resolvedReports || 0}
          title="Opgelost"
          color="green"
        />
        <AdminStatsCard
          icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
          value={stats?.totalLogs || 0}
          title="Moderatie Acties"
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 max-w-md">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Moderatie Logs
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Zoek in reports of logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
        />
      </div>

      {activeTab === 'reports' && (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Post</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Reporter</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Reden</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Datum</th>
                  <th className="px-4 py-3 text-center text-[#8BAE5A] font-semibold">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {filteredReports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  return (
                    <tr key={report.id} className="hover:bg-[#181F17] transition-colors duration-200">
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{report.postTitle}</span>
                        <p className="text-[#B6C948] text-xs max-w-xs truncate">{report.postContent}</p>
                      </td>
                      <td className="px-4 py-3 text-white">{report.reporterName}</td>
                      <td className="px-4 py-3">
                        <span className="text-white">{report.reason}</span>
                        <p className="text-[#B6C948] text-xs">{report.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bg}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {new Date(report.reportDate).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          {report.status === 'pending' && (
                            <>
                              <AdminButton
                                onClick={() => handleStatusUpdate(report.id, 'investigating')}
                                variant="secondary"
                                size="sm"
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                Onderzoek
                              </AdminButton>
                              <AdminButton
                                onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                                variant="danger"
                                size="sm"
                              >
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                Afwijzen
                              </AdminButton>
                            </>
                          )}
                          {report.status === 'investigating' && (
                            <>
                              <AdminButton
                                onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                variant="primary"
                                size="sm"
                              >
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Oplossen
                              </AdminButton>
                              <AdminButton
                                onClick={() => handleStatusUpdate(report.id, 'dismissed')}
                                variant="danger"
                                size="sm"
                              >
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                Afwijzen
                              </AdminButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {activeTab === 'logs' && (
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Moderator</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Actie</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Target</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Details</th>
                  <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Tijdstip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4D23]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#181F17] transition-colors duration-200">
                    <td className="px-4 py-3 text-white font-medium">{log.moderatorName}</td>
                    <td className="px-4 py-3 text-white">{log.action}</td>
                    <td className="px-4 py-3 text-white">{log.targetType}</td>
                    <td className="px-4 py-3 text-[#B6C948] text-sm">{log.details}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(log.timestamp).toLocaleString('nl-NL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
} 