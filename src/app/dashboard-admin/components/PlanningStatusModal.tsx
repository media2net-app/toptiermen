'use client';
import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface PlanningStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlanningStatus {
  totalEstimatedHours: number;
  totalActualHours: number;
  completedTasks: number;
  totalTasks: number;
  daysUntilDeadline: number;
  isOnSchedule: boolean;
  hasHourOverrun: boolean;
  criticalTasksRemaining: number;
  averageCompletionTime: number;
  projectedCompletionDate: string;
}

export default function PlanningStatusModal({ isOpen, onClose }: PlanningStatusModalProps) {
  const [status, setStatus] = useState<PlanningStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPlanningStatus();
    }
  }, [isOpen]);

  const fetchPlanningStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch todo statistics
      const statsResponse = await fetch('/api/admin/todo-statistics');
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        const stats = statsData.statistics;
        
        // Calculate planning status
        const now = new Date();
        const deadline = new Date('2025-09-01');
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const totalEstimatedHours = stats.total_estimated_hours;
        const totalActualHours = stats.total_actual_hours;
        const completedTasks = stats.completed_tasks;
        const totalTasks = stats.total_tasks;
        const criticalTasksRemaining = stats.tasks_by_priority?.critical || 0;
        const averageCompletionTime = stats.average_completion_time || 0;
        
        // Calculate if we're on schedule
        const progressPercentage = (completedTasks / totalTasks) * 100;
        const expectedProgress = ((30 - daysUntilDeadline) / 30) * 100; // Assuming 30 days total
        const isOnSchedule = progressPercentage >= expectedProgress;
        
        // Check for hour overrun
        const hasHourOverrun = totalActualHours > totalEstimatedHours;
        
        // Calculate projected completion date
        const remainingTasks = totalTasks - completedTasks;
        const remainingHours = totalEstimatedHours - totalActualHours;
        const projectedDays = remainingHours / (averageCompletionTime || 8); // 8 hours per day default
        const projectedDate = new Date(now.getTime() + (projectedDays * 24 * 60 * 60 * 1000));
        
        setStatus({
          totalEstimatedHours,
          totalActualHours,
          completedTasks,
          totalTasks,
          daysUntilDeadline,
          isOnSchedule,
          hasHourOverrun,
          criticalTasksRemaining,
          averageCompletionTime,
          projectedCompletionDate: projectedDate.toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error fetching planning status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = () => {
    if (status?.hasHourOverrun && !status?.isOnSchedule) return 'red';
    if (status?.hasHourOverrun || !status?.isOnSchedule) return 'yellow';
    return 'green';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    if (color === 'red') return <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />;
    if (color === 'yellow') return <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />;
    return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (status?.hasHourOverrun && !status?.isOnSchedule) {
      return '⚠️ Kritieke Status: Uren overschreden EN achter op schema!';
    }
    if (status?.hasHourOverrun) {
      return '⚠️ Waarschuwing: Uren overschreden';
    }
    if (!status?.isOnSchedule) {
      return '⚠️ Waarschuwing: Achter op schema';
    }
    return '✅ Project loopt volgens planning';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h2 className="text-2xl font-bold text-white">Planning Status</h2>
              <p className="text-gray-400">Project voortgang tot 1 September 2025</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A]"></div>
          </div>
        ) : status ? (
          <div className="space-y-6">
            {/* Status Alert */}
            <div className={`p-4 rounded-xl border ${
              getStatusColor() === 'red' ? 'bg-red-900/20 border-red-500/30' :
              getStatusColor() === 'yellow' ? 'bg-yellow-900/20 border-yellow-500/30' :
              'bg-green-900/20 border-green-500/30'
            }`}>
              <p className={`font-semibold ${
                getStatusColor() === 'red' ? 'text-red-300' :
                getStatusColor() === 'yellow' ? 'text-yellow-300' :
                'text-green-300'
              }`}>
                {getStatusMessage()}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#252525] p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-[#8BAE5A]" />
                  <span className="text-gray-400 text-sm">Uren Status</span>
                </div>
                <div className="space-y-1">
                  <p className="text-white font-semibold">
                    {status.totalActualHours}h / {status.totalEstimatedHours}h
                  </p>
                  <p className={`text-sm ${
                    status.hasHourOverrun ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {status.hasHourOverrun 
                      ? `+${status.totalActualHours - status.totalEstimatedHours}h overschreden`
                      : `${status.totalEstimatedHours - status.totalActualHours}h resterend`
                    }
                  </p>
                </div>
              </div>

              <div className="bg-[#252525] p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5 text-[#8BAE5A]" />
                  <span className="text-gray-400 text-sm">Schema Status</span>
                </div>
                <div className="space-y-1">
                  <p className="text-white font-semibold">
                    {status.completedTasks} / {status.totalTasks} taken
                  </p>
                  <p className={`text-sm ${
                    status.isOnSchedule ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {Math.round((status.completedTasks / status.totalTasks) * 100)}% voltooid
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="bg-[#252525] p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <ChartBarIcon className="w-5 h-5 text-[#8BAE5A]" />
                <span className="text-gray-400 font-medium">Timeline Overzicht</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Dagen tot deadline:</p>
                  <p className={`font-semibold ${
                    status.daysUntilDeadline <= 7 ? 'text-red-400' :
                    status.daysUntilDeadline <= 14 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {status.daysUntilDeadline} dagen
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Projected voltooiing:</p>
                  <p className={`font-semibold ${
                    new Date(status.projectedCompletionDate) > new Date('2025-09-01') 
                      ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {new Date(status.projectedCompletionDate).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
            </div>

            {/* Critical Tasks Warning */}
            {status.criticalTasksRemaining > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-semibold">Kritieke Taken</span>
                </div>
                <p className="text-red-200 text-sm">
                  Er zijn nog {status.criticalTasksRemaining} kritieke taken open die voor 1 September afgerond moeten zijn.
                </p>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-[#252525] p-4 rounded-xl">
              <h3 className="text-white font-semibold mb-3">Aanbevelingen</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {status.hasHourOverrun && (
                  <li>• Herzie tijdsschattingen voor resterende taken</li>
                )}
                {!status.isOnSchedule && (
                  <li>• Versnel uitvoering van kritieke taken</li>
                )}
                {status.criticalTasksRemaining > 0 && (
                  <li>• Prioriteer kritieke taken boven nice-to-have features</li>
                )}
                {status.daysUntilDeadline <= 14 && (
                  <li>• Overweeg extra resources of scope reductie</li>
                )}
                {!status.hasHourOverrun && status.isOnSchedule && (
                  <li>• Project loopt goed - blijf het huidige tempo aanhouden</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Kon planning status niet laden
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-[#333]">
          <button
            onClick={onClose}
            className="bg-[#8BAE5A] text-[#181F17] px-6 py-2 rounded-xl font-semibold hover:bg-[#7A9F4A] transition-colors"
          >
            Begrepen
          </button>
        </div>
      </div>
    </div>
  );
} 