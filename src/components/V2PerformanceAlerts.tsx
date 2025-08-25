'use client';

import React, { useState, useEffect } from 'react';
import { useV2Monitoring } from '@/hooks/useV2Monitoring';
import { useV2State } from '@/hooks/useV2State';

// V2.0: Performance Alerts Component
export default function V2PerformanceAlerts() {
  const { trackFeatureUsage } = useV2Monitoring();
  const { state, addNotification } = useV2State();
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>>([]);

  useEffect(() => {
    // Track component usage
    trackFeatureUsage('performance-alerts-view', state.user.profile?.id);
    
    // Simulate performance monitoring
    const interval = setInterval(() => {
      checkPerformance();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [trackFeatureUsage, state.user.profile?.id, addNotification]);

  const checkPerformance = () => {
    // Simulate performance metrics
    const apiResponseTime = Math.random() * 300 + 50;
    const errorRate = Math.random() * 5;
    const memoryUsage = Math.random() * 100;
    const cpuUsage = Math.random() * 100;

    const newAlerts: typeof alerts = [];

    // Check API response time
    if (apiResponseTime > 250) {
      newAlerts.push({
        id: `api-slow-${Date.now()}`,
        type: apiResponseTime > 400 ? 'critical' : 'warning',
        message: `API response time is ${apiResponseTime.toFixed(0)}ms (threshold: 250ms)`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check error rate
    if (errorRate > 3) {
      newAlerts.push({
        id: `error-rate-${Date.now()}`,
        type: errorRate > 4 ? 'critical' : 'error',
        message: `Error rate is ${errorRate.toFixed(2)}% (threshold: 3%)`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check memory usage
    if (memoryUsage > 80) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: memoryUsage > 90 ? 'critical' : 'warning',
        message: `Memory usage is ${memoryUsage.toFixed(1)}% (threshold: 80%)`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Check CPU usage
    if (cpuUsage > 85) {
      newAlerts.push({
        id: `cpu-${Date.now()}`,
        type: cpuUsage > 95 ? 'critical' : 'warning',
        message: `CPU usage is ${cpuUsage.toFixed(1)}% (threshold: 85%)`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Add new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
      
      // Add notifications for critical alerts
      newAlerts.forEach(alert => {
        if (alert.type === 'critical') {
          addNotification({
            type: 'error',
            message: `🚨 Critical: ${alert.message}`,
            read: false
          });
        }
      });
    }

    // Auto-resolve old alerts (older than 5 minutes)
    setAlerts(prev => prev.filter(alert => {
      const age = Date.now() - alert.timestamp.getTime();
      return age < 5 * 60 * 1000; // 5 minutes
    }));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🔴';
      case 'error': return '🟠';
      case 'warning': return '🟡';
      default: return '⚪';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'error': return 'border-orange-500 bg-orange-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-800';
      case 'error': return 'text-orange-800';
      case 'warning': return 'text-yellow-800';
      default: return 'text-gray-800';
    }
  };

  if (alerts.length === 0) {
    return null; // Don't render if no alerts
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="space-y-2">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 rounded-r-lg shadow-lg transition-all duration-300 ${
              alert.resolved ? 'opacity-50' : ''
            } ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-xl">{getAlertIcon(alert.type)}</span>
                <div className="flex-1">
                  <p className={`font-medium ${getAlertTextColor(alert.type)}`}>
                    {alert.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {!alert.resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
