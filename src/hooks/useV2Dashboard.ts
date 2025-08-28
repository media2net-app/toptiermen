import { useState, useEffect, useCallback } from 'react';
import { useV2State } from '@/contexts/V2StateContext';
import { useV2Cache } from '@/lib/v2-cache-strategy';
import { useV2ErrorRecovery } from '@/lib/v2-error-recovery';
import { useV2Monitoring } from '@/lib/v2-monitoring';

// 2.0.1: Dashboard data types
export interface DashboardData {
  userProfile: any;
  notifications: any[];
  recentActivity: any[];
  stats: any;
  timestamp: string;
}

export interface DashboardPreferences {
  theme?: 'light' | 'dark' | 'auto';
  sidebarCollapsed?: boolean;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    activityVisibility?: 'public' | 'private' | 'friends';
  };
}

// 2.0.1: Dashboard hook with enhanced functionality
export function useV2Dashboard() {
  const { state } = useV2State();
  const user = state.user.profile;
  const { set, get, clear } = useV2Cache();
  const { handleError } = useV2ErrorRecovery();
  const { trackFeatureUsage, trackApiCall } = useV2Monitoring();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 2.0.1: Fetch dashboard data with caching and error recovery
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // 2.0.1: Try to get from cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = await get<DashboardData>('dashboard-data', 'api-response');
        if (cachedData) {
          setDashboardData(cachedData);
          setLastUpdated(new Date(cachedData.timestamp));
          setLoading(false);
          trackFeatureUsage('dashboard-cache-hit', user.id);
          return;
        }
      }

      // 2.0.1: Fetch fresh data with error recovery
      const startTime = performance.now();
      
      const data = await handleError(
        async () => {
          const response = await fetch('/api/v2/dashboard', {
            headers: {
              'Authorization': `Bearer ${await getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          return result.data.dashboard;
        },
        'Failed to fetch dashboard data',
        'network',
        undefined,
        'dashboard-fetch'
      );

      // 2.0.1: Track API performance
      const endTime = performance.now();
      trackApiCall('/api/v2/dashboard', 'GET', endTime - startTime, 200);

      // 2.0.1: Cache the data
      await set('dashboard-data', data, 'api-response');
      
      setDashboardData(data);
      setLastUpdated(new Date(data.timestamp));
      trackFeatureUsage('dashboard-data-loaded', user.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      trackFeatureUsage('dashboard-error', user.id);
    } finally {
      setLoading(false);
    }
  }, [user?.id, set, get, handleError, trackFeatureUsage, trackApiCall]);

  // 2.0.1: Update dashboard preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<DashboardPreferences>) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const startTime = performance.now();

      const updatedData = await handleError(
        async () => {
          const response = await fetch('/api/v2/dashboard', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${await getAuthToken()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              preferences: newPreferences,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          return result.data.user;
        },
        'Failed to update dashboard preferences',
        'network',
        undefined,
        'dashboard-preferences-update'
      );

      // 2.0.1: Track API performance
      const endTime = performance.now();
      trackApiCall('/api/v2/dashboard', 'PUT', endTime - startTime, 200);

      // 2.0.1: Update local state
      setPreferences(updatedData.preferences);
      
      // 2.0.1: Clear cached data to force refresh
      await clear();
      
      // 2.0.1: Refresh dashboard data
      await fetchDashboardData(true);
      
      trackFeatureUsage('dashboard-preferences-updated', user.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      trackFeatureUsage('dashboard-preferences-error', user.id);
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleError, trackFeatureUsage, trackApiCall, clear, fetchDashboardData]);

  // 2.0.1: Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await handleError(
        async () => {
          const response = await fetch(`/api/v2/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${await getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response.json();
        },
        'Failed to mark notification as read',
        'network',
        undefined,
        'notification-read'
      );

      // 2.0.1: Update local state
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          notifications: dashboardData.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        });
      }

      trackFeatureUsage('notification-marked-read', user.id);

    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [user?.id, dashboardData, handleError, trackFeatureUsage]);

  // 2.0.1: Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      await handleError(
        async () => {
          const response = await fetch('/api/v2/notifications/clear', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${await getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return response.json();
        },
        'Failed to clear notifications',
        'network',
        undefined,
        'notifications-clear'
      );

      // 2.0.1: Update local state
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          notifications: [],
        });
      }

      trackFeatureUsage('notifications-cleared', user.id);

    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, [user?.id, dashboardData, handleError, trackFeatureUsage]);

  // 2.0.1: Refresh dashboard data
  const refresh = useCallback(async () => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  // 2.0.1: Load initial data
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, fetchDashboardData]);

  // 2.0.1: Auto-refresh every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id, fetchDashboardData]);

  // 2.0.1: Get unread notifications count
  const unreadNotificationsCount = dashboardData?.notifications.filter(
    notification => !notification.read
  ).length || 0;

  // 2.0.1: Get recent activity count
  const recentActivityCount = dashboardData?.recentActivity.length || 0;

  // 2.0.1: Get user stats summary
  const statsSummary = {
    totalWorkouts: dashboardData?.stats?.total_workouts || 0,
    totalCalories: dashboardData?.stats?.total_calories || 0,
    streakDays: dashboardData?.stats?.streak_days || 0,
    level: dashboardData?.stats?.level || 1,
  };

  return {
    // Data
    dashboardData,
    preferences,
    loading,
    error,
    lastUpdated,
    
    // Computed values
    unreadNotificationsCount,
    recentActivityCount,
    statsSummary,
    
    // Actions
    fetchDashboardData,
    updatePreferences,
    markNotificationRead,
    clearAllNotifications,
    refresh,
    
    // 2.0.1: Utility functions
    isLoading: loading,
    hasError: !!error,
    getError: error,
    isStale: lastUpdated ? Date.now() - lastUpdated.getTime() > 5 * 60 * 1000 : true, // 5 minutes
  };
}

// 2.0.1: Helper function to get auth token
async function getAuthToken(): Promise<string> {
  // This would typically get the token from your auth context
  // For now, we'll return an empty string and let the API handle auth
  return '';
}

// 2.0.1: Dashboard analytics hook
export function useV2DashboardAnalytics() {
  const { trackFeatureUsage, trackUserAction } = useV2Monitoring();
  const { state } = useV2State();
  const user = state.user.profile;

  // 2.0.1: Track dashboard interactions
  const trackDashboardInteraction = useCallback((action: string, details?: any) => {
    if (!user?.id) return;

    trackUserAction(
      `dashboard-${action}`,
      action,
      user.id,
      undefined,
      { details }
    );
  }, [user?.id, trackUserAction]);

  // 2.0.1: Track feature usage
  const trackFeatureUse = useCallback((feature: string) => {
    if (!user?.id) return;

    trackFeatureUsage(feature, user.id);
  }, [user?.id, trackFeatureUsage]);

  return {
    trackDashboardInteraction,
    trackFeatureUse,
  };
}

// 2.0.1: Dashboard performance monitoring hook
export function useV2DashboardPerformance() {
  const { trackPerformance, trackComponentRender } = useV2Monitoring();

  // 2.0.1: Track dashboard load performance
  const trackDashboardLoad = useCallback((loadTime: number) => {
    trackPerformance('dashboard_load_time', loadTime, 'ms', { component: 'dashboard' });
  }, [trackPerformance]);

  // 2.0.1: Track component render performance
  const trackComponentPerformance = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      trackComponentRender(componentName, renderTime);
    };
  }, [trackComponentRender]);

  return {
    trackDashboardLoad,
    trackComponentPerformance,
  };
}
