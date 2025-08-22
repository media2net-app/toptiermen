'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TaskNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipient: string;
  task_id?: string;
  status: 'unread' | 'read';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  due_date: string;
  created_at: string;
}

export default function TaskNotificationWidget() {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchTasks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/task-notifications?recipient=Chiel&status=unread');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/todo-tasks');
      const data = await response.json();
      
      if (data.success) {
        const chielTasks = (data.tasks || []).filter((task: Task) => 
          task.assigned_to === 'Chiel' && task.status === 'pending'
        );
        setTasks(chielTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update notification status in database
      const response = await fetch('/api/admin/task-notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
          status: 'read'
        })
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'high': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'medium': return <ClockIcon className="w-4 h-4" />;
      case 'low': return <CheckCircleIcon className="w-4 h-4" />;
      default: return <BellIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-3 bg-[#2D3748] hover:bg-[#3A4D23] rounded-lg transition-colors duration-200"
      >
        <BellIcon className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#1A1F2E] border border-[#2D3748] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-[#2D3748]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notificaties</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-2">
              {notifications.length === 0 && tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-400">Geen nieuwe notificaties</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Task Notifications */}
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} cursor-pointer hover:bg-[#2D3748]/50 transition-colors`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getPriorityIcon(notification.priority)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <p className="text-xs opacity-80 mt-1">{notification.message}</p>
                            <p className="text-xs opacity-60 mt-2">
                              {new Date(notification.created_at).toLocaleString('nl-NL')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pending Tasks */}
                  {tasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2D3748]">
                      <h4 className="text-sm font-medium text-white mb-3">Openstaande Taken ({tasks.length})</h4>
                      {tasks.slice(0, 3).map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 rounded-lg bg-[#2D3748]/50 border border-[#3A4D23]/30 hover:bg-[#2D3748] transition-colors cursor-pointer"
                          onClick={() => window.open('/dashboard-admin/taken', '_blank')}
                        >
                          <div className="flex items-start space-x-3">
                            <UserIcon className="w-4 h-4 text-[#8BAE5A] mt-0.5" />
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-white">{task.title}</h5>
                              <p className="text-xs text-gray-400 mt-1">
                                Prioriteit: {task.priority} • Deadline: {new Date(task.due_date).toLocaleDateString('nl-NL')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {tasks.length > 3 && (
                        <p className="text-xs text-gray-400 text-center mt-2">
                          +{tasks.length - 3} meer taken
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
