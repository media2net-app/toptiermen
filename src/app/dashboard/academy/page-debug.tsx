"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from "@/lib/supabase";

interface Module {
  id: string;
  title: string;
  status: string;
  order_index: number;
}

interface Lesson {
  id: string;
  title: string;
  module_id: string;
}

export default function AcademyDebugPage() {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setDebugLogs(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    if (!user) {
      addLog('No user found, waiting for authentication...');
      return;
    }

    addLog(`Starting academy data fetch for user: ${user.email}`);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        addLog('Fetching modules...');

        // Test 1: Simple modules query
        const { data: modulesData, error: modulesError } = await supabase
          .from('academy_modules')
          .select('id, title, status, order_index')
          .eq('status', 'published')
          .order('order_index');

        if (modulesError) {
          addLog(`Modules query failed: ${modulesError.message}`);
          setError(`Database error: ${modulesError.message}`);
          return;
        }

        addLog(`Successfully fetched ${modulesData?.length || 0} modules`);
        setModules(modulesData || []);

        // Test 2: Simple lessons query
        addLog('Fetching lessons...');
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('academy_lessons')
          .select('id, title, module_id')
          .eq('status', 'published');

        if (lessonsError) {
          addLog(`Lessons query failed: ${lessonsError.message}`);
          setError(`Database error: ${lessonsError.message}`);
          return;
        }

        addLog(`Successfully fetched ${lessonsData?.length || 0} lessons`);
        setLessons(lessonsData || []);

        addLog('All data loaded successfully!');
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        addLog(`Unexpected error: ${errorMsg}`);
        setError(`Unexpected error: ${errorMsg}`);
      } finally {
        setLoading(false);
        addLog('Loading state set to false');
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <PageLayout title="Academy Debug" subtitle="Debugging the academy loading issue">
        <div className="text-center py-12">
          <p className="text-yellow-400">Waiting for user authentication...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Academy Debug" subtitle="Debugging the academy loading issue">
      <div className="space-y-6">
        {/* Debug Panel */}
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">Debug Logs</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {debugLogs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-gray-300">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Current Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Loading:</span>
              <span className={`ml-2 font-semibold ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
                {loading ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">User:</span>
              <span className="ml-2 text-green-400">
                {user ? user.email : 'Not logged in'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Modules:</span>
              <span className="ml-2 text-blue-400">{modules.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Lessons:</span>
              <span className="ml-2 text-blue-400">{lessons.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Error:</span>
              <span className={`ml-2 ${error ? 'text-red-400' : 'text-green-400'}`}>
                {error || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading Display */}
        {loading && (
          <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
              <span className="text-yellow-400 font-semibold">Academy laden...</span>
            </div>
            <p className="text-yellow-300 text-sm mt-2">
              This is where the normal page gets stuck. Check the debug logs above to see what's happening.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 p-4 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-2">Error Detected</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-600 p-4 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">✅ Data Loaded Successfully!</h3>
              <p className="text-green-300">The academy data loaded without issues.</p>
            </div>

            {modules.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Modules ({modules.length})</h3>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <div key={module.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-white">{module.title}</span>
                      <span className="text-gray-400 text-sm">Order: {module.order_index}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lessons.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Lessons ({lessons.length})</h3>
                <div className="space-y-2">
                  {lessons.slice(0, 10).map((lesson) => (
                    <div key={lesson.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-white">{lesson.title}</span>
                      <span className="text-gray-400 text-sm">
                        Module: {modules.find(m => m.id === lesson.module_id)?.title || 'Unknown'}
                      </span>
                    </div>
                  ))}
                  {lessons.length > 10 && (
                    <div className="text-gray-400 text-sm text-center">
                      ... and {lessons.length - 10} more lessons
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
          <Link
            href="/dashboard/academy"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Go to Normal Academy
          </Link>
        </div>
      </div>
    </PageLayout>
  );
} 