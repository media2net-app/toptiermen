'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface WeektakenTask {
  id: string;
  title: string;
  day: string;
  day_order: number;
  task_order: number;
  completed: boolean;
}

export default function WeektakenPage() {
  const [tasks, setTasks] = useState<WeektakenTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from database
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/weektaken');
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
        console.log(`✅ Weektaken loaded: ${data.tasks.length} (Source: ${data.source})`);
      } else {
        setError(data.error || 'Failed to load tasks');
        console.error('Error fetching weektaken:', data.error);
      }
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Error fetching weektaken:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/weektaken', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          completed: !currentStatus
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, completed: !currentStatus }
            : task
        ));
        console.log('✅ Task status updated');
      } else {
        console.error('Error updating task:', data.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const Section = ({ title, dayKey, badge }: { title: string; dayKey: string; badge?: string }) => {
    const dayTasks = tasks.filter(task => task.day === dayKey);
    
    return (
      <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {badge && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3A4D23] text-[#8BAE5A] border border-[#4A5D33]">
              {badge}
            </span>
          )}
        </div>
        <ul className="space-y-3">
          {dayTasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 group">
              <button
                onClick={() => toggleTask(task.id, task.completed)}
                aria-pressed={task.completed}
                aria-label={`Markeer taak: ${task.title}`}
                className={`mt-0.5 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center shrink-0 flex-none ${
                  task.completed ? 'border-blue-400 bg-blue-500/20' : 'border-gray-500'
                }`}
              >
                {task.completed && <span className="w-2 h-2 rounded-full bg-blue-400" />}
              </button>
              <button
                onClick={() => toggleTask(task.id, task.completed)}
                className={`text-left text-sm sm:text-base leading-relaxed transition-colors ${
                  task.completed ? 'text-[#8BB9FF]' : 'text-[#E5E5E5]'
                }`}
              >
                {task.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-[#8BAE5A] text-lg">Laden van weektaken...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-lg">Fout bij laden: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics for this week vs planning
  const thisWeekTasks = tasks.filter(task => task.day !== 'volgendeWeek');
  const planningTasks = tasks.filter(task => task.day === 'volgendeWeek');
  
  // This week statistics
  const thisWeekTotal = thisWeekTasks.length;
  const thisWeekCompleted = thisWeekTasks.filter(task => task.completed).length;
  const thisWeekPending = thisWeekTotal - thisWeekCompleted;
  const thisWeekPercentage = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;
  
  // Planning statistics
  const planningTotal = planningTasks.length;
  const planningCompleted = planningTasks.filter(task => task.completed).length;
  const planningPending = planningTotal - planningCompleted;
  const planningPercentage = planningTotal > 0 ? Math.round((planningCompleted / planningTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#181F17] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#8BAE5A] mb-1">Weektaken</h1>
            <p className="text-[#B6C948]">Overzicht per dag met to-do punten</p>
          </div>
          <Link href="/dashboard-admin/taken" className="px-4 py-2 rounded-lg bg-[#B6C948] text-[#181F17] font-semibold hover:bg-[#8BAE5A] transition-colors">
            Naar Taken Beheer
          </Link>
        </div>

        {/* Summary Cards - Deze Week */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📅 Deze Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Deze Week</p>
                  <p className="text-2xl font-bold text-white">{thisWeekTotal}</p>
                </div>
                <div className="w-12 h-12 bg-[#3A4D23] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Afgerond</p>
                  <p className="text-2xl font-bold text-[#8BAE5A]">{thisWeekCompleted}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Openstaand</p>
                  <p className="text-2xl font-bold text-[#F59E0B]">{thisWeekPending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Voortgang</p>
                  <p className="text-2xl font-bold text-[#8BAE5A]">{thisWeekPercentage}%</p>
                </div>
                <div className="w-12 h-12 bg-[#3A4D23] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Planning */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📋 Planning (Volgende Week)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23] opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Planning</p>
                  <p className="text-2xl font-bold text-white">{planningTotal}</p>
                </div>
                <div className="w-12 h-12 bg-[#3A4D23] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23] opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Afgerond</p>
                  <p className="text-2xl font-bold text-[#8BAE5A]">{planningCompleted}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23] opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Openstaand</p>
                  <p className="text-2xl font-bold text-[#F59E0B]">{planningPending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#232D1A] p-6 rounded-2xl border border-[#3A4D23] opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#B6C948] text-sm font-medium">Voortgang</p>
                  <p className="text-2xl font-bold text-[#8BAE5A]">{planningPercentage}%</p>
                </div>
                <div className="w-12 h-12 bg-[#3A4D23] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#8BAE5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Woensdag" dayKey="woensdag" />
          <Section title="Donderdag" dayKey="donderdag" />
          <Section title="Vrijdag" dayKey="vrijdag" />
          <Section title="Volgende week" dayKey="volgendeWeek" badge="Planning" />
        </div>
      </div>
    </div>
  );
}
