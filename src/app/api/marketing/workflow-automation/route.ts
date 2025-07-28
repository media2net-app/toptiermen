import { NextRequest, NextResponse } from 'next/server';

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
  config: {
    alertType?: string;
    metric?: string;
    threshold?: number;
    schedule?: string; // cron expression
    webhookUrl?: string;
  };
}

interface WorkflowAction {
  id: string;
  type: 'notification' | 'email' | 'slack' | 'webhook' | 'api_call' | 'report' | 'dashboard_update';
  config: {
    recipients?: string[];
    message?: string;
    channel?: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  };
  delay?: number; // seconds
  retryCount?: number;
  retryDelay?: number;
}

interface WorkflowCondition {
  id: string;
  type: 'if' | 'and' | 'or' | 'not';
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not_contains';
  value: any;
  children?: WorkflowCondition[];
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger: any;
  input: any;
  output: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  actions: WorkflowActionExecution[];
}

interface WorkflowActionExecution {
  id: string;
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  retryCount: number;
}

// Mock data
const workflows: Workflow[] = [
  {
    id: '1',
    name: 'High Spend Response',
    description: 'Automatically respond to high competitor spend with budget adjustment recommendations',
    isActive: true,
    triggers: [
      {
        id: '1',
        type: 'alert',
        config: {
          alertType: 'high_spend',
          threshold: 200
        }
      }
    ],
    actions: [
      {
        id: '1',
        type: 'notification',
        config: {
          recipients: ['marketing@company.com'],
          message: 'High competitor spend detected. Consider budget adjustment.'
        },
        delay: 0
      },
      {
        id: '2',
        type: 'report',
        config: {
          recipients: ['analytics@company.com'],
          message: 'Detailed spend analysis report generated'
        },
        delay: 300 // 5 minutes
      }
    ],
    conditions: [
      {
        id: '1',
        type: 'if',
        field: 'competitor.spend',
        operator: 'gt',
        value: 10000
      }
    ],
    priority: 'high',
    category: 'response',
    createdAt: new Date().toISOString(),
    lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    executionCount: 12,
    successRate: 95.8
  },
  {
    id: '2',
    name: 'Performance Drop Alert',
    description: 'Monitor competitor performance drops and generate optimization suggestions',
    isActive: true,
    triggers: [
      {
        id: '2',
        type: 'metric',
        config: {
          metric: 'ctr',
          threshold: 0.02
        }
      }
    ],
    actions: [
      {
        id: '3',
        type: 'slack',
        config: {
          channel: '#marketing-alerts',
          message: 'Competitor performance drop detected. Opportunity for market share gain.'
        }
      },
      {
        id: '4',
        type: 'api_call',
        config: {
          url: '/api/marketing/optimization-suggestions',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { type: 'performance_opportunity' }
        }
      }
    ],
    conditions: [
      {
        id: '2',
        type: 'if',
        field: 'competitor.ctr',
        operator: 'lt',
        value: 0.02
      }
    ],
    priority: 'medium',
    category: 'monitoring',
    createdAt: new Date().toISOString(),
    lastExecuted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    executionCount: 8,
    successRate: 87.5
  },
  {
    id: '3',
    name: 'Weekly Competitive Report',
    description: 'Generate and send weekly competitive intelligence report',
    isActive: true,
    triggers: [
      {
        id: '3',
        type: 'schedule',
        config: {
          schedule: '0 9 * * 1' // Every Monday at 9 AM
        }
      }
    ],
    actions: [
      {
        id: '5',
        type: 'report',
        config: {
          recipients: ['executives@company.com', 'marketing@company.com'],
          message: 'Weekly competitive intelligence report attached'
        }
      },
      {
        id: '6',
        type: 'dashboard_update',
        config: {
          url: '/api/dashboard/update-competitive-metrics',
          method: 'POST'
        }
      }
    ],
    conditions: [],
    priority: 'low',
    category: 'reporting',
    createdAt: new Date().toISOString(),
    lastExecuted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    executionCount: 52,
    successRate: 100
  }
];

const executions: WorkflowExecution[] = [
  {
    id: '1',
    workflowId: '1',
    status: 'completed',
    trigger: { type: 'alert', alertType: 'high_spend', competitor: 'De Nieuwe Lichting' },
    input: { spend: 15000, threshold: 10000 },
    output: { recommendations: ['Increase budget by 20%', 'Focus on high-performing ads'] },
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
    duration: 30,
    actions: [
      {
        id: '1',
        actionId: '1',
        status: 'completed',
        input: { message: 'High competitor spend detected' },
        output: { sent: true, recipients: 3 },
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000).toISOString(),
        retryCount: 0
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'workflows':
        return NextResponse.json({
          success: true,
          data: workflows,
          count: workflows.length
        });

      case 'executions':
        const workflowId = searchParams.get('workflowId');
        const filteredExecutions = workflowId 
          ? executions.filter(e => e.workflowId === workflowId)
          : executions;
        
        return NextResponse.json({
          success: true,
          data: filteredExecutions,
          count: filteredExecutions.length
        });

      case 'stats':
        const stats = {
          totalWorkflows: workflows.length,
          activeWorkflows: workflows.filter(w => w.isActive).length,
          totalExecutions: executions.length,
          successfulExecutions: executions.filter(e => e.status === 'completed').length,
          averageSuccessRate: workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length,
          recentExecutions: executions.filter(e => {
            const executionTime = new Date(e.startedAt).getTime();
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            return executionTime > oneDayAgo;
          }).length
        };

        return NextResponse.json({
          success: true,
          data: stats
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            workflows: workflows.length,
            executions: executions.length,
            categories: ['monitoring', 'response', 'optimization', 'reporting']
          }
        });
    }
  } catch (error) {
    console.error('Workflow automation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflow data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflow, execution } = body;

    switch (action) {
      case 'create_workflow':
        const newWorkflow: Workflow = {
          id: `wf-${Date.now()}`,
          name: workflow.name,
          description: workflow.description,
          isActive: workflow.isActive || true,
          triggers: workflow.triggers || [],
          actions: workflow.actions || [],
          conditions: workflow.conditions || [],
          priority: workflow.priority || 'medium',
          category: workflow.category || 'monitoring',
          createdAt: new Date().toISOString(),
          executionCount: 0,
          successRate: 100
        };

        workflows.push(newWorkflow);

        return NextResponse.json({
          success: true,
          data: newWorkflow,
          message: 'Workflow created successfully'
        });

      case 'execute_workflow':
        const workflowToExecute = workflows.find(w => w.id === execution.workflowId);
        if (!workflowToExecute) {
          return NextResponse.json(
            { success: false, error: 'Workflow not found' },
            { status: 404 }
          );
        }

        const newExecution: WorkflowExecution = {
          id: `exec-${Date.now()}`,
          workflowId: execution.workflowId,
          status: 'running',
          trigger: execution.trigger,
          input: execution.input,
          output: {},
          startedAt: new Date().toISOString(),
          actions: workflowToExecute.actions.map(action => ({
            id: `action-${Date.now()}-${action.id}`,
            actionId: action.id,
            status: 'pending',
            input: {},
            output: {},
            startedAt: new Date().toISOString(),
            retryCount: 0
          }))
        };

        executions.push(newExecution);

        // Simulate workflow execution
        setTimeout(() => {
          newExecution.status = 'completed';
          newExecution.completedAt = new Date().toISOString();
          newExecution.duration = Date.now() - new Date(newExecution.startedAt).getTime();
          newExecution.output = {
            success: true,
            actionsCompleted: newExecution.actions.length,
            recommendations: generateRecommendations(execution.input)
          };

          // Update workflow stats
          const workflow = workflows.find(w => w.id === execution.workflowId);
          if (workflow) {
            workflow.executionCount++;
            workflow.lastExecuted = new Date().toISOString();
          }
        }, 2000);

        return NextResponse.json({
          success: true,
          data: newExecution,
          message: 'Workflow execution started'
        });

      case 'update_workflow':
        const workflowIndex = workflows.findIndex(w => w.id === workflow.id);
        if (workflowIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Workflow not found' },
            { status: 404 }
          );
        }

        workflows[workflowIndex] = { ...workflows[workflowIndex], ...workflow };

        return NextResponse.json({
          success: true,
          data: workflows[workflowIndex],
          message: 'Workflow updated successfully'
        });

      case 'delete_workflow':
        const deleteIndex = workflows.findIndex(w => w.id === workflow.id);
        if (deleteIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Workflow not found' },
            { status: 404 }
          );
        }

        workflows.splice(deleteIndex, 1);

        return NextResponse.json({
          success: true,
          message: 'Workflow deleted successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Workflow automation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process workflow request' },
      { status: 500 }
    );
  }
}

function generateRecommendations(input: any): string[] {
  const recommendations = [];

  if (input.spend && input.spend > 10000) {
    recommendations.push('Consider increasing budget allocation for high-performing campaigns');
    recommendations.push('Monitor competitor spend patterns for strategic insights');
  }

  if (input.ctr && input.ctr < 0.02) {
    recommendations.push('Review and optimize ad creative elements');
    recommendations.push('Consider A/B testing different targeting strategies');
  }

  if (input.competitor) {
    recommendations.push('Analyze competitor creative strategies for inspiration');
    recommendations.push('Monitor competitor campaign launches for opportunities');
  }

  return recommendations.length > 0 ? recommendations : ['Continue monitoring competitive landscape'];
} 