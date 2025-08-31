'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  CursorArrowRaysIcon,
  ArrowPathIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPinned: boolean;
  isFeatured: boolean;
  publishAt?: string;
  expiresAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  announcementCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementStats {
  totalAnnouncements: number;
  publishedAnnouncements: number;
  draftAnnouncements: number;
  pinnedAnnouncements: number;
  totalViews: number;
  totalCategories: number;
  recentAnnouncements: number;
}

const styleOptions = [
  { value: 'info', label: 'Informatie (Blauw)', color: 'bg-blue-500', icon: InformationCircleIcon },
  { value: 'success', label: 'Succes / Nieuwe Feature (Groen)', color: 'bg-green-500', icon: CheckCircleIcon },
  { value: 'warning', label: 'Waarschuwing (Oranje)', color: 'bg-orange-500', icon: ExclamationTriangleIcon },
  { value: 'error', label: 'Alarm / Kritiek Onderhoud (Rood)', color: 'bg-red-500', icon: ExclamationTriangleIcon }
];



export default function AnnouncementsManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<AnnouncementCategory[]>([]);
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    priority: 'normal' as Announcement['priority'],
    isPinned: false,
    isFeatured: false,
    publishAt: '',
    expiresAt: ''
  });

  const [isSendingTest, setIsSendingTest] = useState(false);

  // Fetch announcements data
  const fetchAnnouncementsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from database with fallback to mock data
      const [announcementsResponse, categoriesResponse, statsResponse] = await Promise.allSettled([
        fetch('/api/admin/announcements'),
        fetch('/api/admin/announcement-categories'),
        fetch('/api/admin/announcement-stats')
      ]);

      // Handle announcements
      if (announcementsResponse.status === 'fulfilled' && announcementsResponse.value.ok) {
        const data = await announcementsResponse.value.json();
        setAnnouncements(data.announcements || []);
      } else {
        console.error('Failed to fetch announcements:', announcementsResponse.status === 'rejected' ? announcementsResponse.reason : 'API error');
        setAnnouncements([]);
      }

      // Handle categories
      if (categoriesResponse.status === 'fulfilled' && categoriesResponse.value.ok) {
        const data = await categoriesResponse.value.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.status === 'rejected' ? categoriesResponse.reason : 'API error');
        setCategories([]);
      }

      // Handle stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const data = await statsResponse.value.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats:', statsResponse.status === 'rejected' ? statsResponse.reason : 'API error');
        setStats({
          totalAnnouncements: 0,
          publishedAnnouncements: 0,
          draftAnnouncements: 0,
          pinnedAnnouncements: 0,
          totalViews: 0,
          totalCategories: 0,
          recentAnnouncements: 0
        });
      }

    } catch (error) {
      console.error('Error fetching announcements data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementsData();
  }, []);

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      categoryId: '',
      priority: 'normal',
      isPinned: false,
      isFeatured: false,
      publishAt: '',
      expiresAt: ''
    });
    setShowForm(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      categoryId: categories.find(c => c.name === announcement.category)?.id || '',
      priority: announcement.priority,
      isPinned: announcement.isPinned,
      isFeatured: announcement.isFeatured,
      publishAt: announcement.publishAt?.split('T')[0] || '',
      expiresAt: announcement.expiresAt?.split('T')[0] || ''
    });
    setShowForm(true);
  };

  const handleSave = async (action: 'draft' | 'publish') => {
    try {
      const announcementData = {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        status: action === 'draft' ? 'draft' : 'published',
        priority: formData.priority,
        isPinned: formData.isPinned,
        isFeatured: formData.isFeatured,
        publishAt: formData.publishAt || null,
        expiresAt: formData.expiresAt || null
      };

      if (editingAnnouncement) {
        // Update existing announcement
        const response = await fetch(`/api/admin/announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementData)
        });

        if (response.ok) {
          const data = await response.json();
          setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? data.announcement : a));
        }
      } else {
        // Create new announcement
        const response = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementData)
        });

        if (response.ok) {
          const data = await response.json();
          setAnnouncements(prev => [data.announcement, ...prev]);
        }
      }

      setShowForm(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Er is een fout opgetreden bij het opslaan van de aankondiging');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen van de aankondiging');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' })
      });

      if (response.ok) {
        setAnnouncements(prev => prev.map(a => 
          a.id === id ? { ...a, status: 'draft' } : a
        ));
      }
    } catch (error) {
      console.error('Error deactivating announcement:', error);
      // Fallback to local state update
      setAnnouncements(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'draft' } : a
      ));
    }
  };

  const handleDuplicate = (announcement: Announcement) => {
    const duplicated = {
      ...announcement,
      id: Date.now().toString(),
      status: 'draft' as const,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAnnouncements(prev => [duplicated, ...prev]);
    setActiveTab('active');
  };

  const handleTestNotification = async () => {
    try {
      setIsSendingTest(true);
      
      // Get all push subscriptions first
      const subscriptionsResponse = await fetch('/api/admin/push-subscriptions');
      const subscriptionsData = await subscriptionsResponse.json();
      
      if (!subscriptionsData.subscriptions || subscriptionsData.subscriptions.length === 0) {
        alert('❌ Geen push abonnementen gevonden! Gebruikers moeten eerst push notificaties activeren.');
        return;
      }

      // Send test notification to all subscriptions
      const testNotification = {
        userIds: subscriptionsData.subscriptions.map((sub: any) => sub.user_id),
        title: "🧪 Test Push Notificatie",
        body: "Dit is een test notificatie vanuit het admin dashboard!",
        icon: "/logo_white-full.svg",
        badge: "/badge-no-excuses.png",
        data: { 
          url: "/dashboard",
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch('/api/push/send', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNotification)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Test notificatie succesvol verzonden naar ${subscriptionsData.subscriptions.length} abonnement(en)!`);
      } else {
        alert(`❌ Fout bij verzenden: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('❌ Fout bij verzenden van test notificatie');
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const publishedCount = announcements.filter(a => a.status === 'published').length;
  const draftCount = announcements.filter(a => a.status === 'draft').length;
  const totalViews = announcements.reduce((acc, a) => acc + a.viewCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#8BAE5A] text-xl">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <AdminCard>
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error: {error}</div>
          <AdminButton onClick={fetchAnnouncementsData} variant="primary">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Opnieuw Proberen
          </AdminButton>
        </div>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Aankondigingen Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer platform-brede aankondigingen en communiceer direct met alle gebruikers.</p>
        </div>
        <div className="flex gap-3">
          <AdminButton onClick={handleTestNotification} variant="secondary" disabled={isSendingTest}>
            <BellIcon className="w-5 h-5 mr-2" />
            {isSendingTest ? 'Verzenden...' : '🧪 Test Notificatie'}
          </AdminButton>
          <AdminButton onClick={handleCreateNew} variant="primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Nieuwe Aankondiging
          </AdminButton>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatsCard
          icon={<MegaphoneIcon className="w-6 h-6" />}
          value={stats?.publishedAnnouncements || publishedCount}
          title="Gepubliceerde Aankondigingen"
          color="green"
        />
        <AdminStatsCard
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          value={stats?.draftAnnouncements || draftCount}
          title="Concept Aankondigingen"
          color="orange"
        />
        <AdminStatsCard
          icon={<CursorArrowRaysIcon className="w-6 h-6" />}
          value={stats?.totalViews || totalViews}
          title="Totale Weergaven"
          color="blue"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 max-w-md">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Actief & Gepland
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'archive'
              ? 'bg-[#8BAE5A] text-[#0A0F0A]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Archief
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement) => {
            const getStatusInfo = (status: Announcement['status']) => {
              switch (status) {
                case 'published':
                  return { text: 'Gepubliceerd', color: 'text-green-400', bg: 'bg-green-900/50' };
                case 'draft':
                  return { text: 'Concept', color: 'text-yellow-400', bg: 'bg-yellow-900/50' };
                case 'archived':
                  return { text: 'Gearchiveerd', color: 'text-gray-400', bg: 'bg-gray-700/50' };
                default:
                  return { text: 'Onbekend', color: 'text-gray-500', bg: 'bg-gray-800' };
              }
            };

            const statusInfo = getStatusInfo(announcement.status);

            return (
              <AdminCard key={announcement.id}>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${announcement.categoryColor}20` }}>
                        <span className="text-2xl">{announcement.categoryIcon}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bg}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[#8BAE5A] mb-2">{announcement.title}</h3>
                    <p className="text-[#B6C948] text-sm mb-4">{announcement.content}</p>
                    
                    <div className="space-y-3 text-sm border-t border-[#3A4D23] pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#B6C948]">Categorie:</span>
                        <span className="text-white font-semibold">{announcement.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#B6C948]">Auteur:</span>
                        <span className="text-white font-semibold">{announcement.author}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#B6C948]">Prioriteit:</span>
                        <span className="text-white font-semibold capitalize">{announcement.priority}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#B6C948]">Weergaven:</span>
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <EyeIcon className="w-4 h-4 text-[#B6C948]" />
                          {announcement.viewCount.toLocaleString()}
                        </div>
                      </div>
                      {announcement.isPinned && (
                        <div className="flex items-center gap-2 text-[#FFD700]">
                          <span className="text-sm">📌 Vastgepind</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <AdminButton
                      onClick={() => handleEdit(announcement)}
                      variant="secondary"
                      className="flex-1"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Bewerk
                    </AdminButton>
                    {announcement.status === 'published' && (
                      <AdminButton
                        onClick={() => handleDeactivate(announcement.id)}
                        variant="secondary"
                        size="sm"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </AdminButton>
                    )}
                    <AdminButton
                      onClick={() => handleDelete(announcement.id)}
                      variant="danger"
                      size="sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            )
          })}
        </div>
      )}

      {activeTab === 'archive' && (
         <AdminCard>
            <div className="mb-6">
              <div className="relative max-w-sm">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Zoek in archief op trefwoord..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                  <thead className="bg-[#181F17] border-b border-[#3A4D23]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Titel</th>
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Categorie</th>
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Weergaven</th>
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Status</th>
                      <th className="px-4 py-3 text-center text-[#8BAE5A] font-semibold">Actie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {filteredAnnouncements.filter(a => a.status === 'archived').map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-[#181F17] transition-colors duration-200">
                        <td className="px-4 py-3">
                          <span className="text-white font-medium">{announcement.title}</span>
                          <p className="text-[#B6C948] text-xs max-w-xs truncate">{announcement.content}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {announcement.category}
                        </td>
                        <td className="px-4 py-3 text-white">{announcement.viewCount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-white capitalize">{announcement.status}</td>
                        <td className="px-4 py-3 text-center">
                          <AdminButton
                            onClick={() => handleDuplicate(announcement)}
                            variant="secondary"
                            size="sm"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                            Dupliceer
                          </AdminButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
        </AdminCard>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#8BAE5A]">
                  {editingAnnouncement ? 'Bewerk Aankondiging' : 'Nieuwe Aankondiging'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-6">
                {/* Section 1: Content */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Inhoud</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Titel (intern gebruik)
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Bijv. Lancering Brotherhood 2.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Content / Tekst van de Banner
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={3}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Hou het kort en krachtig..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Categorie
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      >
                        <option value="">Selecteer een categorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Prioriteit
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      >
                        <option value="low">Laag</option>
                        <option value="normal">Normaal</option>
                        <option value="high">Hoog</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isPinned}
                          onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-300">Vastpinnen</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-300">Uitgelicht</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 2: Timing & Publication */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Timing & Publicatie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Publicatiedatum (Optioneel)
                      </label>
                      <input
                        type="date"
                        value={formData.publishAt}
                        onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Vervaldatum (Optioneel)
                      </label>
                      <input
                        type="date"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-[#3A4D23]">
                  <AdminButton
                    onClick={() => handleSave('draft')}
                    variant="secondary"
                    className="flex-1"
                  >
                    Opslaan als Concept
                  </AdminButton>
                  <AdminButton
                    onClick={() => handleSave('publish')}
                    variant="primary"
                    className="flex-1"
                  >
                    Publiceer Nu
                  </AdminButton>
                  <AdminButton
                    onClick={() => handleSave('draft')}
                    variant="secondary"
                    className="flex-1"
                  >
                    Opslaan als Concept
                  </AdminButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 