'use client';
import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigned_to: string;
  due_date: string;
  estimated_hours: number;
  progress_percentage: number;
  created_at: string;
}

interface UserTasksWidgetProps {
  userName: string;
}

export default function UserTasksWidget({ userName }: UserTasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchUserTasks();
  }, [userName]);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/todo-tasks');
      const data = await response.json();
      
      if (data.success) {
        // Filter tasks for this specific user
        const userTasks = data.tasks.filter((task: Task) => 
          task.assigned_to === userName && task.status !== 'completed'
        );
        
        // Sort by priority and due date
        const sortedTasks = userTasks.sort((a: Task, b: Task) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          
          if (priorityDiff !== 0) return priorityDiff;
          
          // If same priority, sort by due date
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        
        setTasks(sortedTasks);
      }
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      toast.error('Fout bij het laden van taken');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} dagen te laat`, color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Vandaag', color: 'text-orange-400' };
    if (diffDays === 1) return { text: 'Morgen', color: 'text-yellow-400' };
    if (diffDays <= 3) return { text: `${diffDays} dagen`, color: 'text-yellow-400' };
    return { text: `${diffDays} dagen`, color: 'text-green-400' };
  };

  const displayedTasks = showAll ? tasks : tasks.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[#3A4D23]/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#3A4D23]/20 rounded"></div>
            <div className="h-4 bg-[#3A4D23]/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
        <div className="text-center">
          <CheckCircleIcon className="w-8 h-8 text-[#8BAE5A] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Geen Openstaande Taken</h3>
          <p className="text-gray-400 text-sm">Je hebt momenteel geen taken die aandacht nodig hebben.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#181F17] to-[#232D1A] border border-[#3A4D23]/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Mijn Taken</h3>
        <span className="text-sm text-[#8BAE5A] bg-[#8BAE5A]/10 px-2 py-1 rounded-full">
          {tasks.length} openstaand{tasks.length !== 1 ? 'e' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {displayedTasks.map((task) => {
          const dueInfo = getDaysUntilDue(task.due_date);
          
          return (
            <div key={task.id} className="bg-[#0F1411]/50 border border-[#3A4D23]/20 rounded-lg p-4 hover:border-[#8BAE5A]/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium text-sm leading-tight">{task.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </span>
              </div>
              
              <p className="text-gray-400 text-xs mb-3 line-clamp-2">{task.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className={`${dueInfo.color}`}>
                  {dueInfo.text}
                </span>
                <span className="text-gray-400">
                  {task.estimated_hours}h
                </span>
              </div>
              
              {task.progress_percentage > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Voortgang</span>
                    <span>{task.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#3A4D23]/40 rounded-full">
                    <div 
                      className="h-1 bg-[#8BAE5A] rounded-full transition-all duration-300"
                      style={{ width: `${task.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tasks.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 text-[#8BAE5A] text-sm font-medium hover:text-[#8BAE5A]/80 transition-colors"
        >
          {showAll ? 'Toon minder' : `Toon alle ${tasks.length} taken`}
        </button>
      )}
    </div>
  );
}
