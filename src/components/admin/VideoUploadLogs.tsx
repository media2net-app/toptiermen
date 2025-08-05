import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface VideoUploadStep {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  details?: any;
}

interface VideoUploadLog {
  id: string;
  fileName: string;
  fileSize: number;
  startTime: number;
  steps: VideoUploadStep[];
  totalDuration: number;
  success: boolean;
  error?: string;
}

interface VideoUploadStats {
  totalUploads: number;
  averageDuration: number;
  successRate: number;
  averageFileSize: number;
}

export default function VideoUploadLogs() {
  const [logs, setLogs] = useState<VideoUploadLog[]>([]);
  const [stats, setStats] = useState<VideoUploadStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VideoUploadLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/video-upload-logs?action=logs');
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/video-upload-logs?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getPerformanceColor = (duration: number) => {
    if (duration < 1000) return 'text-green-500';
    if (duration < 5000) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSlowestStep = (log: VideoUploadLog) => {
    return log.steps.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
          <h2 className="text-xl font-semibold text-[#8BAE5A]">Video Upload Performance Logs</h2>
        </div>
        <button
          onClick={() => { fetchLogs(); fetchStats(); }}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#8BAE5A] hover:bg-[#B6C948] disabled:bg-[#3A4D23] text-[#0A0F0A] font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="w-5 h-5 text-[#B6C948]" />
              <span className="text-sm text-[#B6C948]">Total Uploads</span>
            </div>
            <div className="text-2xl font-bold text-[#8BAE5A]">{stats.totalUploads}</div>
          </div>

          <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-[#B6C948]" />
              <span className="text-sm text-[#B6C948]">Avg Duration</span>
            </div>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.averageDuration)}`}>
              {formatDuration(stats.averageDuration)}
            </div>
          </div>

          <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-[#B6C948]" />
              <span className="text-sm text-[#B6C948]">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-[#8BAE5A]">{stats.successRate.toFixed(1)}%</div>
          </div>

          <div className="bg-[#181F17] rounded-xl p-4 border border-[#3A4D23]">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="w-5 h-5 text-[#B6C948]" />
              <span className="text-sm text-[#B6C948]">Avg File Size</span>
            </div>
            <div className="text-2xl font-bold text-[#8BAE5A]">{formatFileSize(stats.averageFileSize)}</div>
          </div>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-[#181F17] rounded-xl border border-[#3A4D23]">
        <div className="p-4 border-b border-[#3A4D23]">
          <h3 className="text-lg font-semibold text-[#8BAE5A]">Recent Uploads</h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <DocumentTextIcon className="w-12 h-12 text-[#3A4D23] mx-auto mb-4" />
            <p className="text-[#B6C948]">No upload logs found</p>
            <p className="text-sm text-[#B6C948]/70">Upload a video to see performance data</p>
          </div>
        ) : (
          <div className="divide-y divide-[#3A4D23]">
            {logs.slice(0, 10).map((log) => {
              const slowestStep = getSlowestStep(log);
              return (
                <div 
                  key={log.id} 
                  className="p-4 hover:bg-[#232D1A] cursor-pointer transition-colors"
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#8BAE5A]">{log.fileName}</span>
                        {log.success ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#B6C948]">
                        <span>{formatFileSize(log.fileSize)}</span>
                        <span>•</span>
                        <span className={getPerformanceColor(log.totalDuration)}>
                          {formatDuration(log.totalDuration)}
                        </span>
                        <span>•</span>
                        <span>{new Date(log.startTime).toLocaleString('nl-NL')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#B6C948]">Slowest step:</div>
                      <div className="text-xs text-[#8BAE5A]">{slowestStep.name}</div>
                      <div className="text-xs text-red-400">{formatDuration(slowestStep.duration)}</div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedLog?.id === log.id && (
                    <div className="mt-4 pt-4 border-t border-[#3A4D23]">
                      <h4 className="text-sm font-semibold text-[#8BAE5A] mb-2">Step Breakdown:</h4>
                      <div className="space-y-2">
                        {log.steps.map((step, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-[#B6C948]">{step.name}</span>
                            <span className={getPerformanceColor(step.duration)}>
                              {formatDuration(step.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {log.error && (
                        <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-sm text-red-400">
                          Error: {log.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {logs.length > 0 && (
        <div className="bg-[#181F17] rounded-xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-semibold text-[#8BAE5A] mb-4">Performance Insights</h3>
          
          <div className="space-y-3">
            {logs.filter(log => log.totalDuration > 5000).length > 0 && (
              <div className="flex items-center gap-2 text-yellow-500">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-sm">
                  {logs.filter(log => log.totalDuration > 5000).length} upload(s) took longer than 5 seconds
                </span>
              </div>
            )}
            
            {logs.filter(log => !log.success).length > 0 && (
              <div className="flex items-center gap-2 text-red-500">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-sm">
                  {logs.filter(log => !log.success).length} upload(s) failed
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm">
                Average upload time: {formatDuration(stats?.averageDuration || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 