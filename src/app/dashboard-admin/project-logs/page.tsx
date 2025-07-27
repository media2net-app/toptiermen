'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  CodeBracketIcon,
  CircleStackIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  BoltIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Types
interface ProjectLog {
  id: string;
  date: string;
  day_number: number;
  title: string;
  description: string;
  category: 'feature' | 'bugfix' | 'improvement' | 'database' | 'ui' | 'api' | 'testing' | 'deployment' | 'planning' | 'research';
  priority: 'low' | 'medium' | 'high' | 'critical';
  hours_spent: number;
  status: 'completed' | 'in_progress' | 'blocked' | 'cancelled';
  tags: string[];
  impact_score: number;
  complexity_score: number;
  created_at: string;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completed_date: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  total_hours_estimated: number;
  total_hours_actual: number | null;
  created_at: string;
}

interface ProjectStatistics {
  id: string;
  date: string;
  total_hours_spent: number;
  features_completed: number;
  bugs_fixed: number;
  improvements_made: number;
  lines_of_code_added: number;
  database_tables_created: number;
  api_endpoints_created: number;
  ui_components_created: number;
}

interface StatisticsSummary {
  total_hours: number;
  total_features: number;
  total_bugs_fixed: number;
  total_improvements: number;
  total_lines_of_code: number;
  total_database_tables: number;
  total_api_endpoints: number;
  total_ui_components: number;
  average_hours_per_day: number;
  total_days: number;
}

interface BudgetData {
  total_budget_hours: number;
  total_hours_spent: number;
  total_hours_remaining: number;
  total_hours_overspent: number;
  budget_percentage_used: number;
}

export default function ProjectLogs() {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'milestones' | 'statistics'>('overview');
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [statistics, setStatistics] = useState<ProjectStatistics[]>([]);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch data
  const fetchProjectData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching project data...');
      
      const [logsResponse, milestonesResponse, statsResponse, budgetResponse] = await Promise.all([
        fetch('/api/admin/project-logs'),
        fetch('/api/admin/project-milestones'),
        fetch('/api/admin/project-statistics'),
        fetch('/api/admin/project-budget')
      ]);

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setLogs(logsData.logs || []);
      }

      if (milestonesResponse.ok) {
        const milestonesData = await milestonesResponse.json();
        setMilestones(milestonesData.milestones || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData.statistics || []);
        setSummary(statsData.summary || null);
      }

      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json();
        setBudgetData(budgetData.cumulative || null);
      }

      setError(null);
    } catch (err) {
      console.error('❌ Error fetching project data:', err);
      setError('Fout bij het laden van project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && log.priority !== selectedPriority) return false;
    if (dateRange.from && log.date < dateRange.from) return false;
    if (dateRange.to && log.date > dateRange.to) return false;
    return true;
  });

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature': return <StarIcon className="w-5 h-5" />;
      case 'bugfix': return <WrenchScrewdriverIcon className="w-5 h-5" />;
      case 'improvement': return <ArrowTrendingUpIcon className="w-5 h-5" />;
      case 'database': return <CircleStackIcon className="w-5 h-5" />;
      case 'ui': return <Cog6ToothIcon className="w-5 h-5" />;
      case 'api': return <CodeBracketIcon className="w-5 h-5" />;
      case 'testing': return <CheckCircleIcon className="w-5 h-5" />;
      case 'deployment': return <BoltIcon className="w-5 h-5" />;
      case 'planning': return <CalendarDaysIcon className="w-5 h-5" />;
      case 'research': return <BookOpenIcon className="w-5 h-5" />;
      default: return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in_progress': return 'text-blue-400 bg-blue-900/20';
      case 'blocked': return 'text-red-400 bg-red-900/20';
      case 'cancelled': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  // Get milestone status color
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/20';
      case 'in_progress': return 'text-blue-400 bg-blue-900/20';
      case 'planned': return 'text-yellow-400 bg-yellow-900/20';
      case 'delayed': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Project Logs</h1>
          <p className="text-[#B6C948]">Volledig overzicht van de ontwikkeling van Top Tier Men</p>
        </div>
        <div className="text-center py-12">
          <div className="text-[#8BAE5A]">Laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Project Logs</h1>
          <p className="text-[#B6C948]">Volledig overzicht van de ontwikkeling van Top Tier Men</p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-400">Fout: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Project Logs</h1>
        <p className="text-[#B6C948]">Volledig overzicht van de ontwikkeling van Top Tier Men</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#232D1A] p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Overzicht
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Dagelijkse Logs
          </div>
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'milestones'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <TrophyIcon className="w-5 h-5" />
            Milestones
          </div>
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'statistics'
              ? 'bg-[#8BAE5A] text-[#181F17]'
              : 'text-[#B6C948] hover:text-[#8BAE5A]'
          }`}
        >
                      <div className="flex items-center justify-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              Statistieken
            </div>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Totaal Uren</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_hours.toFixed(1) || 0}h</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Features Voltooid</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_features || 0}</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <WrenchScrewdriverIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Bugs Opgelost</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_bugs_fixed || 0}</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Gemiddeld per Dag</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{(Number(summary?.average_hours_per_day) || 0).toFixed(1)}h</p>
            </div>
          </div>

          {/* Budget Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CurrencyDollarIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Project Budget</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{budgetData?.total_budget_hours || 123}h</p>
              <p className="text-sm text-[#B6C948]">Totaal budget</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ArrowTrendingUpIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Budget Gebruikt</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{(Number(budgetData?.budget_percentage_used) || 0).toFixed(1)}%</p>
              <p className="text-sm text-[#B6C948]">Van totaal budget</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Resterend</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{(Number(budgetData?.total_hours_remaining) || 123).toFixed(1)}h</p>
              <p className="text-sm text-[#B6C948]">Nog beschikbaar</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Over Budget</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{(Number(budgetData?.total_hours_overspent) || 0).toFixed(1)}h</p>
              <p className="text-sm text-[#B6C948]">Extra uren</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recente Activiteit</h3>
            <div className="space-y-4">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-[#181F17] rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-[#232D1A] rounded-lg">
                      {getCategoryIcon(log.category)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#8BAE5A] truncate">{log.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(log.priority)}`}>
                        {log.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[#B6C948] text-sm mb-2">{log.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[#8BAE5A]">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(log.date).toLocaleDateString('nl-NL')}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {log.hours_spent}h
                      </span>
                      <span className="flex items-center gap-1">
                        <FireIcon className="w-4 h-4" />
                        Impact: {log.impact_score}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Dagelijkse Logs ({filteredLogs.length})</h3>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-6 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-[#232D1A] rounded-lg">
                        {getCategoryIcon(log.category)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-[#8BAE5A]">{log.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(log.priority)}`}>
                          {log.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[#B6C948] mb-3">{log.description}</p>
                      <div className="flex items-center gap-6 text-sm text-[#8BAE5A] mb-3">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          Dag {log.day_number} - {new Date(log.date).toLocaleDateString('nl-NL')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {log.hours_spent} uur
                        </span>
                        <span className="flex items-center gap-1">
                          <FireIcon className="w-4 h-4" />
                          Impact: {log.impact_score}/5
                        </span>
                        <span className="flex items-center gap-1">
                          <CpuChipIcon className="w-4 h-4" />
                          Complexiteit: {log.complexity_score}/5
                        </span>
                      </div>
                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {log.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-[#232D1A] text-[#B6C948] text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="p-6 bg-[#181F17] rounded-lg border border-[#3A4D23]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#8BAE5A] mb-2">{milestone.title}</h3>
                      <p className="text-[#B6C948]">{milestone.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[#8BAE5A] font-medium">Target Date:</span>
                      <p className="text-[#B6C948]">{new Date(milestone.target_date).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] font-medium">Estimated Hours:</span>
                      <p className="text-[#B6C948]">{milestone.total_hours_estimated}h</p>
                    </div>
                    <div>
                      <span className="text-[#8BAE5A] font-medium">Actual Hours:</span>
                      <p className="text-[#B6C948]">{milestone.total_hours_actual ? `${milestone.total_hours_actual}h` : 'N/A'}</p>
                    </div>
                  </div>
                  {milestone.completed_date && (
                    <div className="mt-4 pt-4 border-t border-[#3A4D23]">
                      <span className="text-[#8BAE5A] font-medium">Completed:</span>
                      <p className="text-[#B6C948]">{new Date(milestone.completed_date).toLocaleDateString('nl-NL')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Totaal Uren</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_hours.toFixed(1) || 0}h</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Features Voltooid</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_features || 0}</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CircleStackIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">Database Tabellen</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_database_tables || 0}</p>
            </div>
            <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CodeBracketIcon className="w-6 h-6 text-[#8BAE5A]" />
                <h3 className="text-lg font-semibold text-white">API Endpoints</h3>
              </div>
              <p className="text-2xl font-bold text-[#8BAE5A]">{summary?.total_api_endpoints || 0}</p>
            </div>
          </div>

          {/* Daily Statistics */}
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Dagelijkse Statistieken</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3A4D23]">
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Datum</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Uren</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Features</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Bugs</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Verbeteringen</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">Code Lines</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">DB Tabellen</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">API Endpoints</th>
                    <th className="text-left py-3 px-4 text-[#8BAE5A] font-semibold">UI Components</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.map((stat) => (
                    <tr key={stat.id} className="border-b border-[#3A4D23] hover:bg-[#181F17]">
                      <td className="py-3 px-4 text-[#B6C948]">{new Date(stat.date).toLocaleDateString('nl-NL')}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.total_hours_spent}h</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.features_completed}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.bugs_fixed}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.improvements_made}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.lines_of_code_added}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.database_tables_created}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.api_endpoints_created}</td>
                      <td className="py-3 px-4 text-[#B6C948]">{stat.ui_components_created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 