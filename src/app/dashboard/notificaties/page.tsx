'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  BugAntIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import ClientLayout from '@/app/components/ClientLayout';

interface BugNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  bug_report_id: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

export default function NotificatiesPage() {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<BugNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showNotificationDetails, setShowNotificationDetails] = useState<BugNotification | null>(null);

  // Fetch notifications when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bug-notifications?userId=${user.id}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/admin/bug-notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true
        }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resolved':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'status_update':
        return <ClockIcon className="w-6 h-6 text-blue-500" />;
      case 'closed':
        return <ExclamationTriangleIcon className="w-6 h-6 text-gray-500" />;
      case 'new_bug':
        return <BugAntIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <BugAntIcon className="w-6 h-6 text-orange-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'resolved':
        return 'border-l-green-500 bg-green-50';
      case 'status_update':
        return 'border-l-blue-500 bg-blue-50';
      case 'closed':
        return 'border-l-gray-500 bg-gray-50';
      case 'new_bug':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-orange-500 bg-orange-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Nu';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m geleden`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}u geleden`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d geleden`;
    
    return date.toLocaleDateString('nl-NL');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
            <p className="text-[#B6C948]">Laden...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Notificaties</h1>
          <p className="text-[#B6C948] text-lg">Overzicht van alle notificaties en updates</p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold flex items-center gap-2"
            >
              <CheckIcon className="w-5 h-5" />
              Alles als gelezen markeren
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
          }`}
        >
          Alle ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
          }`}
        >
          Ongelezen ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'read'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'bg-[#232D1A] text-[#8BAE5A] hover:bg-[#3A4D23]'
          }`}
        >
          Gelezen ({notifications.filter(n => n.is_read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
              <p className="text-[#B6C948]">Notificaties laden...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-12 text-center">
            <BellIcon className="w-16 h-16 text-[#8BAE5A]/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? 'Geen notificaties' : filter === 'unread' ? 'Geen ongelezen notificaties' : 'Geen gelezen notificaties'}
            </h3>
            <p className="text-[#B6C948]">
              {filter === 'all' 
                ? 'Je hebt nog geen notificaties ontvangen. Deze verschijnen hier zodra je bug meldingen worden bijgewerkt.'
                : filter === 'unread'
                ? 'Alle notificaties zijn gelezen!'
                : 'Je hebt nog geen notificaties als gelezen gemarkeerd.'
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#232D1A]/80 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                !notification.is_read ? 'ring-2 ring-[#8BAE5A]/50' : ''
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.id);
                }
                setShowNotificationDetails(notification);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      {!notification.is_read && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8BAE5A] text-[#0A0F0A]">
                          Nieuw
                        </span>
                      )}
                      <span className="text-sm text-[#B6C948]">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[#B6C948] leading-relaxed">
                    {notification.message}
                  </p>
                  
                  {notification.metadata && (
                    <div className="mt-3 pt-3 border-t border-[#3A4D23]/40">
                      <div className="flex flex-wrap gap-2">
                        {notification.metadata.old_status && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#232D1A] text-[#8BAE5A]">
                            Van: {notification.metadata.old_status}
                          </span>
                        )}
                        {notification.metadata.new_status && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#8BAE5A] text-[#0A0F0A]">
                            Naar: {notification.metadata.new_status}
                          </span>
                        )}
                        {notification.metadata.priority && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#3A4D23] text-[#8BAE5A]">
                            Prioriteit: {notification.metadata.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Notification Details Modal */}
      <AnimatePresence>
        {showNotificationDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotificationDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#232D1A] rounded-2xl shadow-xl border border-[#3A4D23] max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(showNotificationDetails.type)}
                    <h3 className="text-xl font-semibold text-white">
                      {showNotificationDetails.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNotificationDetails(null)}
                    className="text-[#8BAE5A] hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Bericht</h4>
                    <p className="text-[#B6C948] leading-relaxed">
                      {showNotificationDetails.message}
                    </p>
                  </div>
                  
                  {showNotificationDetails.metadata && (
                    <div>
                      <h4 className="text-sm font-medium text-[#8BAE5A] mb-2">Details</h4>
                      <div className="bg-[#181F17] rounded-lg p-4 space-y-2">
                        {showNotificationDetails.metadata.old_status && (
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Oude status:</span>
                            <span className="text-white">{showNotificationDetails.metadata.old_status}</span>
                          </div>
                        )}
                        {showNotificationDetails.metadata.new_status && (
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Nieuwe status:</span>
                            <span className="text-white">{showNotificationDetails.metadata.new_status}</span>
                          </div>
                        )}
                        {showNotificationDetails.metadata.priority && (
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Prioriteit:</span>
                            <span className="text-white">{showNotificationDetails.metadata.priority}</span>
                          </div>
                        )}
                        {showNotificationDetails.metadata.page_url && (
                          <div className="flex justify-between">
                            <span className="text-[#B6C948]">Pagina:</span>
                            <span className="text-white text-sm truncate max-w-[200px]">
                              {showNotificationDetails.metadata.page_url}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-[#B6C948]">Ontvangen:</span>
                          <span className="text-white">
                            {new Date(showNotificationDetails.created_at).toLocaleString('nl-NL')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#3A4D23]">
                  <button
                    onClick={() => setShowNotificationDetails(null)}
                    className="px-4 py-2 bg-[#3A4D23] text-[#8BAE5A] rounded-lg hover:bg-[#4A5D2E] transition-colors"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}
