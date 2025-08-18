'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SessionLog {
  id: string;
  user_id: string;
  user_email: string;
  session_start: string;
  last_activity: string;
  page_visits: number;
  cache_hits: number;
  cache_misses: number;
  loop_detections: number;
  error_count: number;
  status: 'active' | 'stuck' | 'error' | 'normal';
  current_page: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
}

interface UserActivity {
  user_id: string;
  email: string;
  last_seen: string;
  session_duration: number;
  page_count: number;
  status: 'online' | 'stuck' | 'offline';
  current_location: string;
}

export default function UserSessionLogsPage() {
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real-time monitoring
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSessionLogs();
        fetchUserActivities();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    fetchSessionLogs();
    fetchUserActivities();
    setIsLoading(false);
  }, []);

  const fetchSessionLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_session_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching session logs:', error);
        return;
      }

      setSessionLogs(data || []);
    } catch (error) {
      console.error('Error fetching session logs:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching user activities:', error);
        return;
      }

      setUserActivities(data || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  const createSessionLogsTable = async () => {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS user_session_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            user_email TEXT,
            session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            page_visits INTEGER DEFAULT 0,
            cache_hits INTEGER DEFAULT 0,
            cache_misses INTEGER DEFAULT 0,
            loop_detections INTEGER DEFAULT 0,
            error_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'normal',
            current_page TEXT,
            user_agent TEXT,
            ip_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON user_session_logs(user_id);
          CREATE INDEX IF NOT EXISTS idx_session_logs_status ON user_session_logs(status);
          CREATE INDEX IF NOT EXISTS idx_session_logs_created_at ON user_session_logs(created_at);

          -- Enable RLS
          ALTER TABLE user_session_logs ENABLE ROW LEVEL SECURITY;

          -- RLS Policies
          CREATE POLICY "Admins can view all session logs" ON user_session_logs
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
              )
            );

          CREATE POLICY "Users can view their own session logs" ON user_session_logs
            FOR SELECT USING (user_id = auth.uid());

          CREATE POLICY "System can insert session logs" ON user_session_logs
            FOR INSERT WITH CHECK (true);

          CREATE POLICY "System can update session logs" ON user_session_logs
            FOR UPDATE USING (true);
        `
      });

      if (error) {
        console.error('Error creating session logs table:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating session logs table:', error);
      return false;
    }
  };

  const createUserActivitiesTable = async () => {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS user_activities (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            session_duration INTEGER DEFAULT 0,
            page_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'online',
            current_location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_activities_status ON user_activities(status);
          CREATE INDEX IF NOT EXISTS idx_user_activities_last_seen ON user_activities(last_seen);

          -- Enable RLS
          ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

          -- RLS Policies
          CREATE POLICY "Admins can view all user activities" ON user_activities
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
              )
            );

          CREATE POLICY "Users can view their own activities" ON user_activities
            FOR SELECT USING (user_id = auth.uid());

          CREATE POLICY "System can insert user activities" ON user_activities
            FOR INSERT WITH CHECK (true);

          CREATE POLICY "System can update user activities" ON user_activities
            FOR UPDATE USING (true);
        `
      });

      if (error) {
        console.error('Error creating user activities table:', error);
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error creating user activities table:', error);
      return false;
    }
  };

  const clearStuckSessions = async () => {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          UPDATE user_session_logs 
          SET status = 'normal', 
              loop_detections = 0,
              error_count = 0,
              updated_at = NOW()
          WHERE status = 'stuck' OR loop_detections > 5;
        `
      });

      if (error) {
        console.error('Error clearing stuck sessions:', error);
        return;
      }

      fetchSessionLogs();
      fetchUserActivities();
    } catch (error) {
      console.error('Error clearing stuck sessions:', error);
    }
  };

  const forceLogoutUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.signOut({
        scope: 'global'
      });

      if (error) {
        console.error('Error forcing logout:', error);
        return;
      }

      // Update session log
      await supabase
        .from('user_session_logs')
        .update({
          status: 'normal',
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      fetchSessionLogs();
      fetchUserActivities();
    } catch (error) {
      console.error('Error forcing logout:', error);
    }
  };

  const filteredLogs = sessionLogs.filter(log => {
    if (selectedUser !== 'all' && log.user_id !== selectedUser) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    return true;
  });

  const stuckUsers = sessionLogs.filter(log => 
    log.status === 'stuck' || log.loop_detections > 3
  );

  const rickUser = sessionLogs.filter(log => 
    log.user_email?.includes('rick') || log.user_email?.includes('Rick')
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Session Monitoring
        </h1>
        <p className="text-gray-600">
          Real-time monitoring van gebruikerssessies en cache problemen
        </p>
      </div>

      {/* Setup Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Database Setup
        </h2>
        <div className="flex gap-2">
          <button
            onClick={createSessionLogsTable}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Create Session Logs Table
          </button>
          <button
            onClick={createUserActivitiesTable}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Create User Activities Table
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto Refresh
            </label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refresh Interval (ms)
            </label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Users</option>
              {Array.from(new Set(sessionLogs.map(log => log.user_id))).map(userId => (
                <option key={userId} value={userId}>
                  {sessionLogs.find(log => log.user_id === userId)?.user_email || userId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Status</option>
              <option value="normal">Normal</option>
              <option value="stuck">Stuck</option>
              <option value="error">Error</option>
              <option value="active">Active</option>
            </select>
          </div>

          <button
            onClick={() => {
              fetchSessionLogs();
              fetchUserActivities();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Now
          </button>

          <button
            onClick={clearStuckSessions}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Stuck Sessions
          </button>
        </div>
      </div>

      {/* Alerts */}
      {stuckUsers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            ⚠️ Stuck Users Detected ({stuckUsers.length})
          </h3>
          <div className="space-y-2">
            {stuckUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <span className="text-red-700">
                  {user.user_email} - {user.current_page} (Loops: {user.loop_detections})
                </span>
                <button
                  onClick={() => forceLogoutUser(user.user_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Force Logout
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {rickUser.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-2">
            🔍 Rick's Session Activity
          </h3>
          <div className="space-y-2">
            {rickUser.map(user => (
              <div key={user.id} className="text-orange-700">
                <strong>Status:</strong> {user.status} | 
                <strong>Page:</strong> {user.current_page} | 
                <strong>Loops:</strong> {user.loop_detections} | 
                <strong>Errors:</strong> {user.error_count} |
                <strong>Last Activity:</strong> {new Date(user.last_activity).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900">Total Sessions</h3>
          <p className="text-3xl font-bold text-blue-600">{sessionLogs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900">Stuck Sessions</h3>
          <p className="text-3xl font-bold text-red-600">{stuckUsers.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          <p className="text-3xl font-bold text-green-600">
            {userActivities.filter(u => u.status === 'online').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900">Total Errors</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {sessionLogs.reduce((sum, log) => sum + log.error_count, 0)}
          </p>
        </div>
      </div>

      {/* Session Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Session Logs ({filteredLogs.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={log.status === 'stuck' ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.user_email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.user_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.status === 'stuck' ? 'bg-red-100 text-red-800' :
                      log.status === 'error' ? 'bg-yellow-100 text-yellow-800' :
                      log.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.current_page || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={log.loop_detections > 3 ? 'text-red-600 font-bold' : ''}>
                      {log.loop_detections}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={log.error_count > 0 ? 'text-yellow-600 font-bold' : ''}>
                      {log.error_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.last_activity).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => forceLogoutUser(log.user_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Force Logout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Activities */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            User Activities ({userActivities.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userActivities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.user_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.status === 'online' ? 'bg-green-100 text-green-800' :
                      activity.status === 'stuck' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.last_seen).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(activity.session_duration / 60)} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.page_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.current_location || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
