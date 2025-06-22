'use client';

import React, { useState } from 'react';
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
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';

interface Announcement {
  id: string;
  title: string;
  content: string;
  style: 'info' | 'success' | 'warning' | 'error';
  status: 'active' | 'scheduled' | 'draft';
  startDate: string;
  endDate: string;
  ctaText?: string;
  ctaLink?: string;
  views: number;
  clicks: number;
  createdAt: string;
}

const mockActiveAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Lancering Brotherhood 2.0',
    content: 'Ontdek de nieuwe Brotherhood features met verbeterde groepen en evenementen!',
    style: 'success',
    status: 'active',
    startDate: '2024-01-15T10:00:00',
    endDate: '2024-01-22T23:59:59',
    ctaText: 'Ontdek de nieuwe features',
    ctaLink: '/dashboard/brotherhood/social-feed',
    views: 1247,
    clicks: 89,
    createdAt: '2024-01-14T15:30:00'
  },
  {
    id: '2',
    title: 'Gepland Onderhoud - 25 Januari',
    content: 'Het platform zal op 25 januari van 02:00-04:00 uur niet beschikbaar zijn voor gepland onderhoud.',
    style: 'warning',
    status: 'scheduled',
    startDate: '2024-01-24T10:00:00',
    endDate: '2024-01-26T23:59:59',
    ctaText: 'Meer informatie',
    ctaLink: '/dashboard/help/maintenance',
    views: 0,
    clicks: 0,
    createdAt: '2024-01-20T09:15:00'
  },
  {
    id: '3',
    title: 'Nieuwe Voedingsplannen Beschikbaar',
    content: 'We hebben 10 nieuwe voedingsplannen toegevoegd voor verschillende doelen en voorkeuren.',
    style: 'info',
    status: 'draft',
    startDate: '2024-01-28T09:00:00',
    endDate: '2024-02-04T23:59:59',
    ctaText: 'Bekijk de plannen',
    ctaLink: '/dashboard/voedingsplannen',
    views: 0,
    clicks: 0,
    createdAt: '2024-01-22T14:20:00'
  }
];

const mockArchivedAnnouncements: Announcement[] = [
  {
    id: '4',
    title: 'Welkom bij Top Tier Men',
    content: 'Welkom bij de Top Tier Men community! Start je reis naar excellentie.',
    style: 'success',
    status: 'active',
    startDate: '2024-01-01T00:00:00',
    endDate: '2024-01-08T23:59:59',
    ctaText: 'Start je reis',
    ctaLink: '/dashboard/academy',
    views: 2156,
    clicks: 342,
    createdAt: '2023-12-30T10:00:00'
  },
  {
    id: '5',
    title: 'Holiday Schedule Update',
    content: 'Tijdens de feestdagen zijn onze support tijden aangepast. Check de nieuwe tijden.',
    style: 'info',
    status: 'active',
    startDate: '2023-12-20T00:00:00',
    endDate: '2023-12-27T23:59:59',
    ctaText: 'Bekijk tijden',
    ctaLink: '/dashboard/help/schedule',
    views: 1892,
    clicks: 156,
    createdAt: '2023-12-19T15:45:00'
  }
];

const styleOptions = [
  { value: 'info', label: 'Informatie (Blauw)', color: 'bg-blue-500', icon: InformationCircleIcon },
  { value: 'success', label: 'Succes / Nieuwe Feature (Groen)', color: 'bg-green-500', icon: CheckCircleIcon },
  { value: 'warning', label: 'Waarschuwing (Oranje)', color: 'bg-orange-500', icon: ExclamationTriangleIcon },
  { value: 'error', label: 'Alarm / Kritiek Onderhoud (Rood)', color: 'bg-red-500', icon: ExclamationTriangleIcon }
];

const getStatusInfo = (status: Announcement['status']) => {
  switch (status) {
    case 'active':
      return { text: 'Actief', color: 'text-green-400', bg: 'bg-green-900/50' };
    case 'scheduled':
      return { text: 'Gepland', color: 'text-yellow-400', bg: 'bg-yellow-900/50' };
    case 'draft':
      return { text: 'Concept', color: 'text-gray-400', bg: 'bg-gray-700/50' };
    default:
      return { text: 'Onbekend', color: 'text-gray-500', bg: 'bg-gray-800' };
  }
};

const StatCard = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
    <div className="bg-[#232D1A] p-4 rounded-xl flex items-center gap-4 border border-[#3A4D23]">
        <div className="p-3 rounded-lg bg-[#8BAE5A]/20">
            <Icon className="w-6 h-6 text-[#8BAE5A]" />
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-[#B6C948]">{label}</p>
        </div>
    </div>
);

export default function AnnouncementsManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockActiveAnnouncements);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>(mockArchivedAnnouncements);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    style: 'info' as Announcement['style'],
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    ctaText: '',
    ctaLink: ''
  });

  const handleCreateNew = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      style: 'info',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      ctaText: '',
      ctaLink: ''
    });
    setShowForm(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      style: announcement.style,
      startDate: announcement.startDate.split('T')[0],
      startTime: announcement.startDate.split('T')[1].substring(0, 5),
      endDate: announcement.endDate.split('T')[0],
      endTime: announcement.endDate.split('T')[1].substring(0, 5),
      ctaText: announcement.ctaText || '',
      ctaLink: announcement.ctaLink || ''
    });
    setShowForm(true);
  };

  const handleSave = (action: 'draft' | 'publish' | 'schedule') => {
    const newAnnouncement: Announcement = {
      id: editingAnnouncement?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      style: formData.style,
      status: action === 'draft' ? 'draft' : action === 'publish' ? 'active' : 'scheduled',
      startDate: `${formData.startDate}T${formData.startTime}:00`,
      endDate: `${formData.endDate}T${formData.endTime}:59`,
      ctaText: formData.ctaText || undefined,
      ctaLink: formData.ctaLink || undefined,
      views: editingAnnouncement?.views || 0,
      clicks: editingAnnouncement?.clicks || 0,
      createdAt: editingAnnouncement?.createdAt || new Date().toISOString()
    };

    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? newAnnouncement : a));
    } else {
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    }

    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleDeactivate = (id: string) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'draft' as const } : a
    ));
  };

  const handleDuplicate = (announcement: Announcement) => {
    const duplicated = {
      ...announcement,
      id: Date.now().toString(),
      status: 'draft' as const,
      views: 0,
      clicks: 0,
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [duplicated, ...prev]);
    setActiveTab('active');
  };

  const filteredArchived = archivedAnnouncements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = announcements.filter(a => a.status === 'active').length;
  const scheduledCount = announcements.filter(a => a.status === 'scheduled').length;
  const totalClicks = announcements.reduce((acc, a) => acc + a.clicks, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Aankondigingen Beheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer platform-brede aankondigingen en communiceer direct met alle gebruikers.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nieuwe Aankondiging
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={MegaphoneIcon} value={activeCount} label="Actieve Aankondigingen" />
        <StatCard icon={CalendarDaysIcon} value={scheduledCount} label="Geplande Aankondigingen" />
        <StatCard icon={CursorArrowRaysIcon} value={totalClicks.toLocaleString()} label="Totale Kliks" />
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
            const statusInfo = getStatusInfo(announcement.status);
            const styleInfo = styleOptions.find(s => s.value === announcement.style);
            const Icon = styleInfo?.icon || InformationCircleIcon;

            return (
              <div
                key={announcement.id}
                className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                      <Icon className="w-6 h-6 text-[#8BAE5A]" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} ${statusInfo.bg}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#8BAE5A] mb-2">{announcement.title}</h3>
                  <p className="text-[#B6C948] text-sm mb-4">{announcement.content}</p>
                  
                  <div className="space-y-3 text-sm border-t border-[#3A4D23] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Zichtbaar van:</span>
                      <span className="text-white font-semibold">{new Date(announcement.startDate).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B6C948]">Zichtbaar tot:</span>
                      <span className="text-white font-semibold">{new Date(announcement.endDate).toLocaleString('nl-NL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#B6C948]">Weergaven / Kliks:</span>
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <EyeIcon className="w-4 h-4 text-[#B6C948]" />
                            {announcement.views.toLocaleString()}
                            <span>/</span>
                            <CheckCircleIcon className="w-4 h-4 text-[#B6C948]" />
                            {announcement.clicks.toLocaleString()}
                        </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A] transition flex items-center justify-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Bewerk
                  </button>
                  {announcement.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(announcement.id)}
                      className="p-2 rounded-xl bg-[#181F17] text-orange-400 border border-[#3A4D23] hover:bg-[#232D1A] transition"
                      title="Deactiveer Nu"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 rounded-xl bg-[#181F17] text-red-400 border border-[#3A4D23] hover:bg-[#232D1A] transition"
                    title="Verwijder"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'archive' && (
         <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
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
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Periode</th>
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Weergaven</th>
                      <th className="px-4 py-3 text-left text-[#8BAE5A] font-semibold">Kliks</th>
                      <th className="px-4 py-3 text-center text-[#8BAE5A] font-semibold">Actie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A4D23]">
                    {filteredArchived.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-[#181F17] transition-colors duration-200">
                        <td className="px-4 py-3">
                          <span className="text-white font-medium">{announcement.title}</span>
                          <p className="text-[#B6C948] text-xs max-w-xs truncate">{announcement.content}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(announcement.startDate).toLocaleDateString('nl-NL')} - {' '}
                          {new Date(announcement.endDate).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="px-4 py-3 text-white">{announcement.views.toLocaleString()}</td>
                        <td className="px-4 py-3 text-white">{announcement.clicks.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDuplicate(announcement)}
                            className="inline-flex items-center px-3 py-1 bg-[#181F17] text-[#8BAE5A] rounded-lg text-sm font-medium hover:bg-[#3A4D23] transition-colors border border-[#3A4D23]"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                            Dupliceer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
        </div>
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
                        Visuele Stijl
                      </label>
                      <select
                        value={formData.style}
                        onChange={(e) => setFormData({ ...formData, style: e.target.value as any })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      >
                        {styleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Call-to-Action */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Call-to-Action (Optioneel)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Knop Tekst
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Bijv. Ontdek de nieuwe features"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Knop Link
                      </label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Bijv. /dashboard/brotherhood/social-feed"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Timing & Publication */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Timing & Publicatie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Startdatum
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Starttijd
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Einddatum
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Eindtijd
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-[#3A4D23]">
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Opslaan als Concept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('publish')}
                    className="flex-1 px-4 py-3 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg font-medium hover:bg-[#7A9D4A] transition-colors"
                  >
                    Publiceer Nu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('schedule')}
                    className="flex-1 px-4 py-3 bg-[#3A4D23] text-white rounded-lg font-medium hover:bg-[#2A3A1F] transition-colors"
                  >
                    Plan In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 