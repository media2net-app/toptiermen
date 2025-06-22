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
  MagnifyingGlassIcon
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
  { value: 'info', label: 'Informatie (Blauw)', color: 'bg-blue-500' },
  { value: 'success', label: 'Succes / Nieuwe Feature (Groen)', color: 'bg-green-500' },
  { value: 'warning', label: 'Waarschuwing (Oranje)', color: 'bg-orange-500' },
  { value: 'error', label: 'Alarm / Kritiek Onderhoud (Rood)', color: 'bg-red-500' }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">🟢 Actief</span>;
    case 'scheduled':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">🟠 Gepland</span>;
    case 'draft':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">⚪ Concept</span>;
    default:
      return null;
  }
};

const getStyleBadge = (style: string) => {
  const option = styleOptions.find(opt => opt.value === style);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${option?.color}`}>
      {option?.label.split(' ')[0]}
    </span>
  );
};

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
    style: 'info' as const,
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

  return (
    <div className="min-h-screen bg-[#0A0F0A] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Aankondigingen Beheer</h1>
          <p className="text-gray-400">
            Beheer platform-brede aankondigingen en communiceer direct met alle gebruikers
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-[#8BAE5A] text-[#0A0F0A]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Actieve & Geplande Aankondigingen
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
          <div>
            {/* Action Button */}
            <div className="mb-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg font-medium hover:bg-[#7A9D4A] transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Nieuwe Aankondiging Maken
              </button>
            </div>

            {/* Active Announcements Table */}
            <div className="bg-[#181F17] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2A3A1F]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Titel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Zichtbaar van
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Zichtbaar tot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Weergaven / Kliks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A1F]">
                    {announcements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-[#2A3A1F] transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{announcement.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{announcement.content}</div>
                            <div className="mt-1">{getStyleBadge(announcement.style)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(announcement.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(announcement.startDate).toLocaleDateString('nl-NL')}
                          <br />
                          {new Date(announcement.startDate).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(announcement.endDate).toLocaleDateString('nl-NL')}
                          <br />
                          {new Date(announcement.endDate).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div className="flex items-center space-x-2">
                            <EyeIcon className="w-4 h-4" />
                            <span>{announcement.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>{announcement.clicks.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(announcement)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {announcement.status === 'active' && (
                              <button
                                onClick={() => handleDeactivate(announcement.id)}
                                className="text-orange-400 hover:text-orange-300 transition-colors"
                                title="Deactiveer Nu"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(announcement.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'archive' && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
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

            {/* Archived Announcements Table */}
            <div className="bg-[#181F17] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#2A3A1F]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Titel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tekst van de banner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Periode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Weergaven
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Kliks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3A1F]">
                    {filteredArchived.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-[#2A3A1F] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{announcement.title}</div>
                          <div className="mt-1">{getStyleBadge(announcement.style)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs">
                          {announcement.content}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(announcement.startDate).toLocaleDateString('nl-NL')} t/m{' '}
                          {new Date(announcement.endDate).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {announcement.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {announcement.clicks.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDuplicate(announcement)}
                            className="inline-flex items-center px-3 py-1 bg-[#8BAE5A] text-[#0A0F0A] rounded text-sm font-medium hover:bg-[#7A9D4A] transition-colors"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                            Dupliceer naar Concept
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#181F17] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
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
                          className="w-full bg-[#0A0F0A] border border-[#3A4D23] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-6 border-t border-[#3A4D23]">
                    <button
                      type="button"
                      onClick={() => handleSave('draft')}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      Opslaan als Concept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('publish')}
                      className="flex-1 px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg font-medium hover:bg-[#7A9D4A] transition-colors"
                    >
                      Publiceer Nu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('schedule')}
                      className="flex-1 px-4 py-2 bg-[#3A4D23] text-white rounded-lg font-medium hover:bg-[#2A3A1F] transition-colors"
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
    </div>
  );
} 