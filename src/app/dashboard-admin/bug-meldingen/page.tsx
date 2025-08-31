'use client';

import { useState, useEffect } from 'react';
import { 
  BugAntIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { AdminCard, AdminButton } from '@/components/admin';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface BugReport {
  id: string;
  test_user_id: string;
  type: 'bug' | 'improvement' | 'general';
  page_url: string;
  element_selector?: string;
  area_selection?: { x: number; y: number; width: number; height: number } | null;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  screenshot_url?: string;
  created_at: string;
  updated_at?: string;
  source?: 'database' | 'localStorage';
}

interface UserInfo {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}

export default function BugMeldingen() {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<{ [key: string]: UserInfo }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'bug' | 'improvement' | 'general'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  console.log('🔍 BugMeldingen component rendering');

  // Fetch data from database and localStorage
  useEffect(() => {
    console.log('🔍 Bug meldingen component mounted');
    fetchBugReports();
  }, []);

  const fetchUserInfo = async (userIds: string[]) => {
    try {
      if (userIds.length === 0) return {};
      
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching user info:', error);
        return {};
      }

      const userMap: { [key: string]: UserInfo } = {};
      users?.forEach(user => {
        userMap[user.id] = {
          id: user.id,
          full_name: user.full_name || 'Unknown User',
          email: user.email || 'No email',
          role: user.role
        };
      });

      return userMap;
    } catch (error) {
      console.error('Error in fetchUserInfo:', error);
      return {};
    }
  };

  const fetchBugReports = async () => {
    console.log('🔍 Starting fetchBugReports');
    setLoading(true);
    setError(null);
    
    // Force loading to false after 10 seconds as fallback
    const timeoutId = setTimeout(() => {
      console.log('🔍 Timeout fallback - setting loading to false');
      setLoading(false);
      if (bugReports.length === 0) {
        setError('Timeout bij ophalen van data. Probeer de pagina te verversen.');
      }
    }, 10000);

    try {
      const reports: BugReport[] = [];

      // Try API route first (faster and more reliable)
      try {
        console.log('🔍 Fetching from API...');
        const response = await fetch('/api/test-notes-simple', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('🔍 API response:', result);
        
        if (result.success && result.notes) {
          reports.push(...result.notes.map((report: any) => ({ ...report, source: 'database' as const })));
          console.log('🔍 Added API reports:', result.notes.length);
        }
      } catch (apiError) {
        console.error('API fetch failed:', apiError);
        
        // Fallback: try direct database
        try {
          console.log('🔍 Trying direct database...');
          const { data: dbReports, error: dbError } = await supabase
            .from('test_notes')
            .select('*')
            .order('created_at', { ascending: false });

          console.log('🔍 Database response:', { dbReports, dbError });

          if (dbError) {
            console.error('Database error:', dbError);
            throw new Error(`Database error: ${dbError.message}`);
          }

          if (dbReports) {
            reports.push(...dbReports.map(report => ({ ...report, source: 'database' as const })));
            console.log('🔍 Added database reports:', dbReports.length);
          }
        } catch (dbError) {
          console.error('Direct database fetch also failed:', dbError);
        }
      }

      // If no reports found, add a test report for debugging
      if (reports.length === 0) {
        console.log('🔍 No reports found, adding test report');
        reports.push({
          id: 'test-123',
          test_user_id: 'test-user',
          type: 'bug',
          page_url: '/dashboard',
          element_selector: undefined,
          area_selection: { x: 100, y: 100, width: 200, height: 150 },
          description: 'Test bug melding - database connectie werkt niet',
          priority: 'medium',
          status: 'open',
          screenshot_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: 'database'
        });
      }

      // Get from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        try {
          console.log('🔍 Fetching from localStorage...');
          const localReports = JSON.parse(localStorage.getItem('test_notes') || '[]');
          if (localReports.length > 0) {
            reports.push(...localReports.map((report: any) => ({ ...report, source: 'localStorage' as const })));
            console.log('🔍 Added localStorage reports:', localReports.length);
          }
        } catch (error) {
          console.warn('localStorage fetch failed:', error);
        }
      }

      // Sort by created_at
      reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('🔍 Final reports:', reports);
      setBugReports(reports);
      
      // Fetch user information for all unique user IDs
      const uniqueUserIds = [...new Set(reports.map(report => report.test_user_id))];
      console.log('🔍 Fetching user info for:', uniqueUserIds);
      
      const userInfo = await fetchUserInfo(uniqueUserIds);
      setUserInfoMap(userInfo);
      
      if (reports.length === 0) {
        console.log('🔍 No reports found');
      }
      
    } catch (error) {
      console.error('Error fetching bug reports:', error);
      setError(`Fout bij ophalen van bug meldingen: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
      console.log('🔍 Setting loading to false');
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      // Try to update in database first
      const { error: dbError } = await supabase
        .from('test_notes')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (dbError) {
        console.warn('Database update failed:', dbError);
      }

      // Update local state
      setBugReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, updated_at: new Date().toISOString() }
          : report
      ));

      toast.success('Status bijgewerkt');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Fout bij bijwerken van status');
    }
  };

  const handleViewDetails = (report: BugReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
    setShowScreenshot(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-500 bg-red-100';
      case 'in_progress': return 'text-yellow-500 bg-yellow-100';
      case 'resolved': return 'text-green-500 bg-green-100';
      case 'closed': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'text-red-600 bg-red-100';
      case 'improvement': return 'text-blue-600 bg-blue-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredReports = bugReports.filter(report => {
    const matchesSearch = (report.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.page_url || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesUser = userFilter === 'all' || report.test_user_id === userFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesUser;
  });

  if (loading) {
    console.log('🔍 Showing loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#B6C948]">Laden van bug meldingen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🔍 Showing error state:', error);
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Bug Meldingen</h1>
            <p className="text-[#B6C948]">Overzicht van alle bug meldingen van test gebruikers</p>
          </div>
          
          <AdminButton
            onClick={fetchBugReports}
            icon={<ArrowPathIcon className="w-4 h-4" />}
            variant="secondary"
          >
            Vernieuwen
          </AdminButton>
        </div>

        {/* Error Message */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Fout bij laden</h3>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <div className="flex space-x-3">
            <AdminButton onClick={fetchBugReports} icon={<ArrowPathIcon className="w-4 h-4" />}>
              Opnieuw Proberen
            </AdminButton>
            <AdminButton 
              onClick={() => window.location.reload()} 
              icon={<ArrowPathIcon className="w-4 h-4" />}
              variant="secondary"
            >
              Pagina Verversen
            </AdminButton>
          </div>
        </div>

        {/* Show any existing reports even if there was an error */}
        {bugReports.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Beschikbare meldingen ({bugReports.length})</h3>
            {bugReports.map((report) => (
              <div key={report.id} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#8BAE5A]">
                        {report.type === 'bug' ? '🐛' : report.type === 'improvement' ? '💡' : '📝'} {(report.description || 'Geen beschrijving').substring(0, 60)}...
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                      {report.source && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.source === 'database' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                        }`}>
                          {report.source}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-2">{report.description}</p>
                                      <div className="flex items-center space-x-4 text-sm">
                    <span className="text-[#B6C948]">📄 {report.page_url}</span>
                    <span className="text-[#B6C948]">📅 {new Date(report.created_at).toLocaleDateString()}</span>
                    {userInfoMap[report.test_user_id] && (
                      <span className="text-[#B6C948]">👤 {userInfoMap[report.test_user_id].full_name}</span>
                    )}
                    {report.area_selection && (
                      <span className="text-[#B6C948]">📍 Area: {report.area_selection.width}x{report.area_selection.height}</span>
                    )}
                  </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <AdminButton
                      onClick={() => handleViewDetails(report)}
                      icon={<EyeIcon className="w-4 h-4" />}
                      variant="secondary"
                      size="sm"
                    >
                      Details
                    </AdminButton>
                    
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as any)}
                      className="px-3 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  console.log('🔍 Rendering main component');
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Bug Meldingen</h1>
          <p className="text-[#B6C948]">Overzicht van alle bug meldingen van test gebruikers</p>
        </div>
        
        <AdminButton
          onClick={fetchBugReports}
          icon={<ArrowPathIcon className="w-4 h-4" />}
          variant="secondary"
        >
          Vernieuwen
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Totaal Meldingen</p>
              <p className="text-2xl font-bold text-white">{bugReports.length}</p>
            </div>
            <BugAntIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Open Issues</p>
              <p className="text-2xl font-bold text-white">
                {bugReports.filter(r => r.status === 'open').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Critical Issues</p>
              <p className="text-2xl font-bold text-white">
                {bugReports.filter(r => r.priority === 'critical').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#B6C948]">Database</p>
              <p className="text-2xl font-bold text-white">
                {bugReports.filter(r => r.source === 'database').length}
              </p>
            </div>
            <ComputerDesktopIcon className="w-8 h-8 text-[#8BAE5A]" />
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Zoeken</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek in meldingen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="all">Alle Statussen</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Prioriteit</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            >
              <option value="all">Alle Prioriteiten</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
                      <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="all">Alle Types</option>
                <option value="bug">Bug</option>
                <option value="improvement">Improvement</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#8BAE5A] mb-2">Gebruiker</label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full px-4 py-2 bg-[#232D1A] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="all">Alle Gebruikers</option>
                {Object.values(userInfoMap).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
        </div>
      </div>

      {/* Bug Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <BugAntIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Geen bug meldingen gevonden</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#8BAE5A]">
                      {report.type === 'bug' ? '🐛' : report.type === 'improvement' ? '💡' : '📝'} {(report.description || 'Geen beschrijving').substring(0, 60)}...
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status || 'open')}`}>
                      {(report.status || 'open').replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority || 'medium')}`}>
                      {report.priority || 'medium'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type || 'bug')}`}>
                      {report.type || 'bug'}
                    </span>
                    {report.source && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.source === 'database' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                      }`}>
                        {report.source}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-2">{report.description || 'Geen beschrijving'}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-[#B6C948]">📄 {report.page_url}</span>
                    <span className="text-[#B6C948]">📅 {new Date(report.created_at).toLocaleDateString()}</span>
                    {userInfoMap[report.test_user_id] && (
                      <span className="text-[#B6C948]">👤 {userInfoMap[report.test_user_id].full_name}</span>
                    )}
                    {report.area_selection && (
                      <span className="text-[#B6C948]">📍 Area: {report.area_selection.width}x{report.area_selection.height}</span>
                    )}
                    {report.screenshot_url && (
                      <span className="text-[#B6C948]">📸 Screenshot beschikbaar</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <AdminButton
                    onClick={() => handleViewDetails(report)}
                    icon={<EyeIcon className="w-4 h-4" />}
                    variant="secondary"
                    size="sm"
                  >
                    Details
                  </AdminButton>
                  
                  {report.screenshot_url && (
                    <AdminButton
                      onClick={() => {
                        setSelectedReport(report);
                        setShowScreenshot(true);
                      }}
                      icon={<CameraIcon className="w-4 h-4" />}
                      variant="secondary"
                      size="sm"
                    >
                      Bekijk Screenshot
                    </AdminButton>
                  )}
                  
                  <select
                    value={report.status || 'open'}
                    onChange={(e) => handleStatusChange(report.id, e.target.value as any)}
                    className="px-3 py-1 bg-[#232D1A] border border-[#3A4D23] rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Screenshot Modal */}
      {showScreenshot && selectedReport && selectedReport.screenshot_url && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Screenshot - {selectedReport.description}</h2>
              <button
                onClick={() => setShowScreenshot(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={selectedReport.screenshot_url} 
                  alt="Bug screenshot"
                  className="max-w-full h-auto rounded-lg border border-[#3A4D23]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#B6C948] font-semibold">Pagina:</span>
                  <p className="text-gray-300">{selectedReport.page_url}</p>
                </div>
                <div>
                  <span className="text-[#B6C948] font-semibold">Datum:</span>
                  <p className="text-gray-300">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                {selectedReport.area_selection && (
                  <div className="col-span-2">
                    <span className="text-[#B6C948] font-semibold">Geselecteerd gebied:</span>
                    <p className="text-gray-300">
                      X: {selectedReport.area_selection.x}, Y: {selectedReport.area_selection.y}, 
                      Breedte: {selectedReport.area_selection.width}, Hoogte: {selectedReport.area_selection.height}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-3 pt-4">
                <AdminButton
                  onClick={() => window.open(selectedReport.screenshot_url, '_blank')}
                  icon={<EyeIcon className="w-4 h-4" />}
                  variant="secondary"
                >
                  Open in Nieuw Tabblad
                </AdminButton>
                <AdminButton
                  onClick={() => setShowScreenshot(false)}
                  variant="secondary"
                >
                  Sluiten
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#8BAE5A]">Bug Melding Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Beschrijving</h3>
                <p className="text-gray-300">{selectedReport.description || 'Geen beschrijving'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Type</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedReport.type || 'bug')}`}>
                    {selectedReport.type || 'bug'}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Prioriteit</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedReport.priority || 'medium')}`}>
                    {selectedReport.priority || 'medium'}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status || 'open')}`}>
                    {(selectedReport.status || 'open').replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Bron</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedReport.source === 'database' ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                  }`}>
                    {selectedReport.source || 'Onbekend'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Pagina</h3>
                <p className="text-gray-300">{selectedReport.page_url}</p>
              </div>
              
              {userInfoMap[selectedReport.test_user_id] && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Gemeld door</h3>
                  <div className="bg-[#232D1A] border border-[#3A4D23] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{userInfoMap[selectedReport.test_user_id].full_name}</p>
                        <p className="text-gray-400 text-sm">{userInfoMap[selectedReport.test_user_id].email}</p>
                      </div>
                      {userInfoMap[selectedReport.test_user_id].role && (
                        <span className="px-2 py-1 bg-[#8BAE5A]/20 text-[#8BAE5A] rounded-full text-xs font-medium">
                          {userInfoMap[selectedReport.test_user_id].role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReport.screenshot_url && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Screenshot</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-300">Screenshot beschikbaar</span>
                    <AdminButton
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowScreenshot(true);
                      }}
                      icon={<CameraIcon className="w-4 h-4" />}
                      variant="secondary"
                      size="sm"
                    >
                      Bekijk Screenshot
                    </AdminButton>
                  </div>
                </div>
              )}
              
              {selectedReport.element_selector && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Element Selector</h3>
                  <code className="text-gray-300 bg-[#232D1A] px-2 py-1 rounded text-sm">
                    {selectedReport.element_selector}
                  </code>
                </div>
              )}
              
              {selectedReport.area_selection && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Area Selection</h3>
                  <p className="text-gray-300">
                    X: {selectedReport.area_selection.x}, Y: {selectedReport.area_selection.y}, 
                    Width: {selectedReport.area_selection.width}, Height: {selectedReport.area_selection.height}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-white mb-2">Datum</h3>
                <p className="text-gray-300">{new Date(selectedReport.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 