'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CogIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  UserGroupIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'monitoring' | 'response' | 'optimization' | 'reporting';
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
  successRate: number;
}

interface WorkflowTrigger {
  id: string;
  type: 'alert' | 'metric' | 'schedule' | 'manual' | 'webhook';
  config: any;
}

interface WorkflowAction {
  id: string;
  type: 'notification' | 'email' | 'slack' | 'webhook' | 'api_call' | 'report' | 'dashboard_update';
  config: any;
  delay?: number;
}

interface WorkflowCondition {
  id: string;
  type: 'if' | 'and' | 'or' | 'not';
  field: string;
  operator: string;
  value: any;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger: any;
  input: any;
  output: any;
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

export default function WorkflowAutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'monitoring' | 'response' | 'optimization' | 'reporting'>('all');

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  const fetchWorkflowData = async () => {
    try {
      // Fetch workflows
      const workflowsResponse = await fetch('/api/marketing/workflow-automation?action=workflows');
      const workflowsData = await workflowsResponse.json();
      
      // Fetch executions
      const executionsResponse = await fetch('/api/marketing/workflow-automation?action=executions');
      const executionsData = await executionsResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch('/api/marketing/workflow-automation?action=stats');
      const statsData = await statsResponse.json();

      setWorkflows(workflowsData.data || []);
      setExecutions(executionsData.data || []);
      setStats(statsData.data || {});
    } catch (error) {
      console.error('Error fetching workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const updatedWorkflow = { ...workflow, isActive: !workflow.isActive };
    
    try {
      const response = await fetch('/api/marketing/workflow-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_workflow',
          workflow: updatedWorkflow
        })
      });

      if (response.ok) {
        setWorkflows(prev => prev.map(w => w.id === workflowId ? updatedWorkflow : w));
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/marketing/workflow-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_workflow',
          workflow: { id: workflowId }
        })
      });

      if (response.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/marketing/workflow-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_workflow',
          execution: {
            workflowId,
            trigger: { type: 'manual' },
            input: { timestamp: new Date().toISOString() }
          }
        })
      });

      if (response.ok) {
        // Refresh data after execution
        setTimeout(fetchWorkflowData, 3000);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monitoring': return <EyeIcon className="w-5 h-5" />;
      case 'response': return <BoltIcon className="w-5 h-5" />;
      case 'optimization': return <WrenchScrewdriverIcon className="w-5 h-5" />;
      case 'reporting': return <DocumentTextIcon className="w-5 h-5" />;
      default: return <CogIcon className="w-5 h-5" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'notification': return <BellIcon className="w-4 h-4" />;
      case 'email': return <EnvelopeIcon className="w-4 h-4" />;
      case 'slack': return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      case 'webhook': return <GlobeAltIcon className="w-4 h-4" />;
      case 'api_call': return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'report': return <DocumentTextIcon className="w-4 h-4" />;
      case 'dashboard_update': return <ChartBarIcon className="w-4 h-4" />;
      default: return <CogIcon className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'running': return <ArrowPathIcon className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed': return <XCircleIcon className="w-4 h-4 text-red-400" />;
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      default: return <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    if (filter === 'active') return workflow.isActive;
    if (filter === 'monitoring') return workflow.category === 'monitoring';
    if (filter === 'response') return workflow.category === 'response';
    if (filter === 'optimization') return workflow.category === 'optimization';
    if (filter === 'reporting') return workflow.category === 'reporting';
    return true;
  });

  const recentExecutions = executions
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-8 h-8 text-[#8BAE5A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflow Automation</h1>
          <p className="text-gray-400 mt-1">Automate competitive intelligence responses and actions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Workflow
        </button>
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
              <p className="text-gray-400 text-sm">Total Workflows</p>
              <p className="text-xl font-bold text-white">{stats.totalWorkflows || 0}</p>
            </div>
            <CogIcon className="w-6 h-6 text-[#8BAE5A]" />
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
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-xl font-bold text-white">{stats.activeWorkflows || 0}</p>
            </div>
            <PlayIcon className="w-6 h-6 text-green-500" />
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
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-xl font-bold text-white">{stats.averageSuccessRate?.toFixed(1) || 0}%</p>
            </div>
            <StarIcon className="w-6 h-6 text-yellow-500" />
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
              <p className="text-gray-400 text-sm">Today's Executions</p>
              <p className="text-xl font-bold text-white">{stats.recentExecutions || 0}</p>
            </div>
            <FireIcon className="w-6 h-6 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-[#2D3748] border border-[#4A5568] text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Workflows</option>
          <option value="active">Active Only</option>
          <option value="monitoring">Monitoring</option>
          <option value="response">Response</option>
          <option value="optimization">Optimization</option>
          <option value="reporting">Reporting</option>
        </select>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getCategoryIcon(workflow.category)}
                <div>
                  <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                  <p className="text-gray-400 text-sm">{workflow.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(workflow.priority)}`}>
                  {workflow.priority}
                </span>
                <button
                  onClick={() => toggleWorkflow(workflow.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    workflow.isActive 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                  title={workflow.isActive ? 'Pause workflow' : 'Activate workflow'}
                >
                  {workflow.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Triggers */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Triggers</h4>
              <div className="space-y-2">
                {workflow.triggers.map((trigger) => (
                  <div key={trigger.id} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="capitalize">{trigger.type}</span>
                    {trigger.config.alertType && (
                      <span>• {trigger.config.alertType}</span>
                    )}
                    {trigger.config.schedule && (
                      <span>• {trigger.config.schedule}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Actions</h4>
              <div className="space-y-2">
                {workflow.actions.map((action) => (
                  <div key={action.id} className="flex items-center gap-2 text-xs text-gray-400">
                    {getActionIcon(action.type)}
                    <span className="capitalize">{action.type}</span>
                    {action.delay && (
                      <span>• {action.delay}s delay</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <span>Executions: {workflow.executionCount}</span>
              <span>Success: {workflow.successRate.toFixed(1)}%</span>
              {workflow.lastExecuted && (
                <span>Last: {new Date(workflow.lastExecuted).toLocaleDateString('nl-NL')}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => executeWorkflow(workflow.id)}
                className="bg-[#8BAE5A] hover:bg-[#7A9D49] text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Execute Now
              </button>
              <button
                onClick={() => setSelectedWorkflow(workflow)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => deleteWorkflow(workflow.id)}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Executions */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Executions</h3>
        <div className="space-y-3">
          {recentExecutions.map((execution) => (
            <div key={execution.id} className="flex items-center justify-between p-3 bg-[#2D3748] rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(execution.status)}
                <div>
                  <p className="text-white text-sm">
                    Workflow: {workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(execution.startedAt).toLocaleString('nl-NL')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="capitalize">{execution.status}</span>
                {execution.duration && (
                  <span>{execution.duration}ms</span>
                )}
              </div>
            </div>
          ))}
          {recentExecutions.length === 0 && (
            <p className="text-gray-400 text-center py-4">No recent executions</p>
          )}
        </div>
      </div>

      {/* Create Workflow Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1A1F2E] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-[#2D3748]">
                <h3 className="text-xl font-semibold text-white">Create New Workflow</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#2D3748] rounded-lg transition-colors"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-gray-400 mb-4">
                  Workflow creation interface will be implemented here. This will include:
                </p>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Drag-and-drop workflow builder</li>
                  <li>• Trigger configuration</li>
                  <li>• Action selection and setup</li>
                  <li>• Condition builder</li>
                  <li>• Testing and validation</li>
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 