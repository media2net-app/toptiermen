'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FireIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellSlashIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  competitorId?: string;
  competitorName?: string;
  metric?: string;
  value?: number;
  threshold?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'spend' | 'creative' | 'timing' | 'market' | 'anomaly';
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  expiresAt?: string;
  actions?: AlertAction[];
  aiPriority: number; // 0-100, AI-determined priority
  confidence: number; // 0-100, AI confidence in alert
}

interface AlertAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: AlertCondition[];
  actions: AlertRuleAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'spend' | 'creative' | 'timing' | 'market' | 'anomaly';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertCondition {
  id: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'not_contains';
  value: number | string;
  timeframe?: string; // e.g., '1h', '24h', '7d'
}

interface AlertRuleAction {
  id: string;
  type: 'notification' | 'email' | 'slack' | 'webhook' | 'dashboard';
  config: any;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'sms' | 'webhook' | 'dashboard';
  isActive: boolean;
  config: any;
  lastUsed?: string;
}

export default function CompetitorAlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'performance' | 'spend'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'severity'>('time');

  // Mock data
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'critical',
        title: 'High Spend Anomaly Detected',
        message: 'De Nieuwe Lichting increased ad spend by 340% in the last 24 hours',
        competitorId: '1',
        competitorName: 'De Nieuwe Lichting',
        metric: 'spend',
        value: 15000,
        threshold: 5000,
        severity: 'critical',
        category: 'spend',
        isRead: false,
        isDismissed: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        aiPriority: 95,
        confidence: 92,
        actions: [
          {
            id: '1',
            label: 'Investigate',
            type: 'primary',
            action: () => console.log('Investigate spend anomaly')
          },
          {
            id: '2',
            label: 'Dismiss',
            type: 'secondary',
            action: () => dismissAlert('1')
          }
        ]
      },
      {
        id: '2',
        type: 'warning',
        title: 'Performance Drop Alert',
        message: 'FitnessPro Nederland CTR dropped 25% below average',
        competitorId: '2',
        competitorName: 'FitnessPro Nederland',
        metric: 'ctr',
        value: 0.015,
        threshold: 0.02,
        severity: 'high',
        category: 'performance',
        isRead: false,
        isDismissed: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        aiPriority: 78,
        confidence: 85,
        actions: [
          {
            id: '3',
            label: 'Analyze',
            type: 'primary',
            action: () => console.log('Analyze performance drop')
          }
        ]
      },
      {
        id: '3',
        type: 'info',
        title: 'New Campaign Detected',
        message: 'MindfulLife Coaching launched 3 new video ads',
        competitorId: '3',
        competitorName: 'MindfulLife Coaching',
        metric: 'campaigns',
        value: 3,
        severity: 'medium',
        category: 'creative',
        isRead: true,
        isDismissed: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        aiPriority: 45,
        confidence: 88
      }
    ];

    const mockRules: AlertRule[] = [
      {
        id: '1',
        name: 'High Spend Alert',
        description: 'Alert when competitor spend increases by more than 200%',
        isActive: true,
        conditions: [
          {
            id: '1',
            metric: 'spend',
            operator: 'gt',
            value: 200,
            timeframe: '24h'
          }
        ],
        actions: [
          {
            id: '1',
            type: 'notification',
            config: { channel: 'dashboard' }
          },
          {
            id: '2',
            type: 'email',
            config: { recipients: ['marketing@company.com'] }
          }
        ],
        priority: 'critical',
        category: 'spend',
        createdAt: new Date().toISOString(),
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        triggerCount: 5
      },
      {
        id: '2',
        name: 'Performance Drop',
        description: 'Alert when CTR drops below 2%',
        isActive: true,
        conditions: [
          {
            id: '2',
            metric: 'ctr',
            operator: 'lt',
            value: 0.02,
            timeframe: '24h'
          }
        ],
        actions: [
          {
            id: '3',
            type: 'notification',
            config: { channel: 'dashboard' }
          }
        ],
        priority: 'high',
        category: 'performance',
        createdAt: new Date().toISOString(),
        lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        triggerCount: 3
      }
    ];

    const mockChannels: NotificationChannel[] = [
      {
        id: '1',
        name: 'Dashboard Notifications',
        type: 'dashboard',
        isActive: true,
        config: {},
        lastUsed: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Email Alerts',
        type: 'email',
        isActive: true,
        config: { recipients: ['marketing@company.com'] },
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Slack Channel',
        type: 'slack',
        isActive: false,
        config: { channel: '#marketing-alerts' }
      }
    ];

    setAlerts(mockAlerts);
    setAlertRules(mockRules);
    setNotificationChannels(mockChannels);
  }, []);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isDismissed: true } : alert
    ));
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />;
      case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      default: return <BellIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-500/5';
      case 'high': return 'border-orange-500/50 bg-orange-500/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      case 'low': return 'border-blue-500/50 bg-blue-500/5';
      default: return 'border-gray-500/50 bg-gray-500/5';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <ChartBarIcon className="w-4 h-4" />;
      case 'spend': return <CurrencyDollarIcon className="w-4 h-4" />;
      case 'creative': return <FireIcon className="w-4 h-4" />;
      case 'timing': return <ClockIcon className="w-4 h-4" />;
      case 'market': return <UserGroupIcon className="w-4 h-4" />;
      case 'anomaly': return <StarIcon className="w-4 h-4" />;
      default: return <BellIcon className="w-4 h-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'critical') return alert.severity === 'critical';
    if (filter === 'performance') return alert.category === 'performance';
    if (filter === 'spend') return alert.category === 'spend';
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return b.aiPriority - a.aiPriority;
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
      case 'time':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.isDismissed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Alert System</h1>
          <p className="text-gray-400 mt-1">AI-powered competitive intelligence alerts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <BellIcon className="w-6 h-6 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-1 text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{criticalCount} Critical</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCreateRule(true)}
            className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Alert Rule
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <CogIcon className="w-5 h-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-xl font-bold text-white">{alerts.length}</p>
            </div>
            <BellIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unread</p>
              <p className="text-xl font-bold text-white">{unreadCount}</p>
            </div>
            <BellAlertIcon className="w-6 h-6 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-xl font-bold text-white">{criticalCount}</p>
            </div>
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Rules</p>
              <p className="text-xl font-bold text-white">{alertRules.filter(r => r.isActive).length}</p>
            </div>
            <CogIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Alerts</option>
            <option value="unread">Unread</option>
            <option value="critical">Critical</option>
            <option value="performance">Performance</option>
            <option value="spend">Spend</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="time">Sort by Time</option>
            <option value="priority">Sort by AI Priority</option>
            <option value="severity">Sort by Severity</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-[#1A1F2E] border rounded-lg p-6 transition-all duration-200 ${
                getSeverityColor(alert.severity)
              } ${!alert.isRead ? 'ring-2 ring-[#8BAE5A]/20' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      {!alert.isRead && (
                        <span className="px-2 py-1 bg-[#8BAE5A] text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {getCategoryIcon(alert.category)}
                        <span className="capitalize">{alert.category}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{alert.message}</p>
                    
                    {alert.competitorName && (
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="text-gray-400">
                          Competitor: <span className="text-white">{alert.competitorName}</span>
                        </span>
                        {alert.metric && alert.value && (
                          <span className="text-gray-400">
                            {alert.metric.toUpperCase()}: <span className="text-white">{alert.value}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>AI Priority: {alert.aiPriority}%</span>
                      <span>Confidence: {alert.confidence}%</span>
                      <span>{new Date(alert.createdAt).toLocaleString('nl-NL')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Mark as read"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Dismiss alert"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {alert.actions && alert.actions.length > 0 && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                  {alert.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        action.type === 'primary'
                          ? 'bg-[#8BAE5A] text-white hover:bg-[#7A9D49]'
                          : action.type === 'danger'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BellSlashIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No alerts found</h3>
            <p className="text-gray-500">All caught up! No new alerts match your current filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 