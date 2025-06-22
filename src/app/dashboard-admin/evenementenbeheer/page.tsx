'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  VideoCameraIcon,
  UsersIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Types
interface Event {
  id: string;
  name: string;
  type: 'online' | 'physical';
  date: string;
  time: string;
  host: string;
  location: {
    type: 'online' | 'physical';
    url?: string;
    name?: string;
    address?: string;
    city?: string;
    mapsEmbed?: string;
  };
  description: string;
  agenda: string;
  headerImage?: string;
  status: 'draft' | 'published' | 'archived';
  maxParticipants?: number;
  visibility: 'public' | 'veteran_plus';
  currentParticipants: number;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  rank: string;
  avatar: string;
  registrationDate: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
}

// Mock data
const events: Event[] = [
  {
    id: '1',
    name: 'Online Workshop: Onderhandelen als een Pro',
    type: 'online',
    date: '2024-02-15',
    time: '19:00',
    host: 'Rick van der Berg',
    location: {
      type: 'online',
      url: 'https://zoom.us/j/123456789'
    },
    description: 'Leer de kunst van effectief onderhandelen in deze interactieve workshop.',
    agenda: '19:00 - Welkom en introductie\n19:15 - Basis onderhandelingstechnieken\n20:00 - Praktijkoefeningen\n20:45 - Q&A sessie\n21:00 - Afsluiting',
    status: 'published',
    maxParticipants: 50,
    visibility: 'public',
    currentParticipants: 35,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Fysieke Meetup: Amsterdam Brotherhood',
    type: 'physical',
    date: '2024-02-20',
    time: '18:30',
    host: 'Mike Anderson',
    location: {
      type: 'physical',
      name: 'The Hub Amsterdam',
      address: 'Herengracht 123',
      city: 'Amsterdam'
    },
    description: 'Een avond vol connecties, inspiratie en groei.',
    agenda: '18:30 - Inloop en netwerken\n19:00 - Welkom en introductie\n19:30 - Inspiratie sessie\n20:30 - Open discussie\n21:30 - Netwerken en afsluiting',
    status: 'published',
    maxParticipants: 25,
    visibility: 'veteran_plus',
    currentParticipants: 18,
    createdAt: '2024-01-10'
  }
];

const participants: Participant[] = [
  {
    id: '1',
    name: 'Mark van der Berg',
    email: 'mark@example.com',
    rank: 'Veteran',
    avatar: '/api/placeholder/40/40',
    registrationDate: '2024-01-16',
    status: 'confirmed'
  },
  {
    id: '2',
    name: 'Lucas de Vries',
    email: 'lucas@example.com',
    rank: 'Elite',
    avatar: '/api/placeholder/40/40',
    registrationDate: '2024-01-17',
    status: 'confirmed'
  }
];

export default function EventManagement() {
  const [activeTab, setActiveTab] = useState<'events' | 'participants'>('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: { start: '', end: '' }
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    type: 'online' as 'online' | 'physical',
    date: '',
    time: '',
    host: '',
    location: {
      type: 'online' as 'online' | 'physical',
      url: '',
      name: '',
      address: '',
      city: '',
      mapsEmbed: ''
    } as Event['location'],
    description: '',
    agenda: '',
    headerImage: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    maxParticipants: '',
    visibility: 'public' as 'public' | 'veteran_plus'
  });

  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      name: '',
      type: 'online',
      date: '',
      time: '',
      host: '',
      location: {
        type: 'online',
        url: '',
        name: '',
        address: '',
        city: '',
        mapsEmbed: ''
      },
      description: '',
      agenda: '',
      headerImage: '',
      status: 'draft',
      maxParticipants: '',
      visibility: 'public'
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      type: event.type,
      date: event.date,
      time: event.time,
      host: event.host,
      location: event.location,
      description: event.description,
      agenda: event.agenda,
      headerImage: event.headerImage || '',
      status: event.status,
      maxParticipants: event.maxParticipants?.toString() || '',
      visibility: event.visibility
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    console.log('Saving event:', eventForm);
    // TODO: Implement save logic
    setShowEventModal(false);
  };

  const handleSendEmail = () => {
    console.log('Sending email:', emailData);
    // TODO: Implement email sending logic
    setShowEmailModal(false);
  };

  const handleExportParticipants = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Rank,Registration Date,Status\n"
      + participants.map(p => `${p.name},${p.email},${p.rank},${p.registrationDate},${p.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participants-${selectedEvent}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600 text-white';
      case 'draft': return 'bg-yellow-600 text-white';
      case 'archived': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? <VideoCameraIcon className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#8BAE5A] mb-2">Evenementenbeheer</h1>
        <p className="text-[#B6C948]">Evenementenbureau van Top Tier Men - Organiseer en beheer workshops en meetups</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'events'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          Evenementen Overzicht
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'participants'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <UsersIcon className="w-5 h-5" />
          Deelnemersbeheer
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Action Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleCreateEvent}
              className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              Nieuw Evenement Aanmaken
            </button>
          </div>

          {/* Events Table */}
          <div className="bg-[#232D1A] rounded-lg overflow-hidden border border-[#3A4D23]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181F17]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Datum & Tijd</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Naam Evenement</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Aanmeldingen</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A4D23]">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-[#181F17]/50">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white font-medium">{new Date(event.date).toLocaleDateString('nl-NL')}</div>
                          <div className="text-[#B6C948]">{event.time}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{event.name}</div>
                          <div className="text-sm text-[#B6C948]">Host: {event.host}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(event.type)}
                          <span className="text-[#B6C948]">
                            {event.type === 'online' ? 'Online Workshop' : 'Fysieke Meetup'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status === 'published' ? 'Gepubliceerd' : 
                           event.status === 'draft' ? 'Concept' : 'Gearchiveerd'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="text-white">{event.currentParticipants}</span>
                          {event.maxParticipants && (
                            <span className="text-[#B6C948]"> / {event.maxParticipants}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditEvent(event)}
                            className="p-1 text-[#8BAE5A] hover:text-white transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[#8BAE5A] hover:text-white transition-colors">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-[#8BAE5A] hover:text-white transition-colors">
                            <DocumentDuplicateIcon className="w-4 h-4" />
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

      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* Event Selection */}
          <div className="bg-[#232D1A] rounded-lg p-6 border border-[#3A4D23]">
            <div className="flex items-center gap-4">
              <label className="text-[#B6C948] font-medium">Selecteer een evenement:</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="flex-1 bg-[#181F17] border border-[#3A4D23] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
              >
                <option value="">Kies een evenement...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date).toLocaleDateString('nl-NL')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEvent && (
            <>
              {/* Bulk Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  E-mail alle deelnemers
                </button>
                <button
                  onClick={handleExportParticipants}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Exporteer Lijst (CSV)
                </button>
              </div>

              {/* Participants Table */}
              <div className="bg-[#232D1A] rounded-lg overflow-hidden border border-[#3A4D23]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#181F17]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Deelnemer</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Rang</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">E-mailadres</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Aanmelddatum</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3A4D23]">
                      {participants.map((participant) => (
                        <tr key={participant.id} className="hover:bg-[#181F17]/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={participant.avatar} 
                                alt={participant.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <span className="font-medium text-white">{participant.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[#B6C948]">{participant.rank}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[#B6C948]">{participant.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[#B6C948]">
                              {new Date(participant.registrationDate).toLocaleDateString('nl-NL')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              participant.status === 'confirmed' ? 'bg-green-600 text-white' :
                              participant.status === 'waitlist' ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {participant.status === 'confirmed' ? 'Bevestigd' :
                               participant.status === 'waitlist' ? 'Wachtlijst' : 'Geannuleerd'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                {editingEvent ? 'Bewerk Evenement' : 'Nieuw Evenement'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Section 1: Core Information */}
              <div>
                <h3 className="text-[#8BAE5A] font-semibold mb-4">Kerninformatie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Naam Evenement</label>
                    <input
                      type="text"
                      value={eventForm.name}
                      onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="Bijv. Online Workshop: Onderhandelen als een Pro"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Type Evenement</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm(prev => ({ 
                        ...prev, 
                        type: e.target.value as 'online' | 'physical',
                        location: { ...prev.location, type: e.target.value as 'online' | 'physical' }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="online">Online</option>
                      <option value="physical">Fysiek</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Datum</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Tijd</label>
                    <input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[#B6C948] text-sm mb-1">Host / Spreker</label>
                    <input
                      type="text"
                      value={eventForm.host}
                      onChange={(e) => setEventForm(prev => ({ ...prev, host: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="Naam van de host of spreker"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Location */}
              <div>
                <h3 className="text-[#8BAE5A] font-semibold mb-4">Locatie</h3>
                {eventForm.type === 'online' ? (
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Online URL</label>
                    <input
                      type="url"
                      value={eventForm.location.url}
                      onChange={(e) => setEventForm(prev => ({ 
                        ...prev, 
                        location: { ...prev.location, url: e.target.value }
                      }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#B6C948] text-sm mb-1">Locatienaam</label>
                      <input
                        type="text"
                        value={eventForm.location.name}
                        onChange={(e) => setEventForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, name: e.target.value }
                        }))}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Bijv. The Hub Amsterdam"
                      />
                    </div>
                    <div>
                      <label className="block text-[#B6C948] text-sm mb-1">Stad</label>
                      <input
                        type="text"
                        value={eventForm.location.city}
                        onChange={(e) => setEventForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, city: e.target.value }
                        }))}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Amsterdam"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#B6C948] text-sm mb-1">Adres</label>
                      <input
                        type="text"
                        value={eventForm.location.address}
                        onChange={(e) => setEventForm(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, address: e.target.value }
                        }))}
                        className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        placeholder="Herengracht 123"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Content & Media */}
              <div>
                <h3 className="text-[#8BAE5A] font-semibold mb-4">Content & Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Header Afbeelding</label>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-[#B6C948] hover:bg-[#232D1A] transition-colors">
                      <PhotoIcon className="w-4 h-4" />
                      Upload Afbeelding
                    </button>
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Volledige Omschrijving</label>
                    <textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-32 resize-none"
                      placeholder="Beschrijf het evenement in detail..."
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Agenda / Programma</label>
                    <textarea
                      value={eventForm.agenda}
                      onChange={(e) => setEventForm(prev => ({ ...prev, agenda: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-32 resize-none"
                      placeholder="19:00 - Welkom en introductie&#10;19:15 - Hoofdprogramma&#10;20:30 - Q&A sessie&#10;21:00 - Afsluiting"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Settings & Rules */}
              <div>
                <h3 className="text-[#8BAE5A] font-semibold mb-4">Instellingen & Regels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Publicatiestatus</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'archived' }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="draft">Concept</option>
                      <option value="published">Gepubliceerd</option>
                      <option value="archived">Gearchiveerd</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Maximum Deelnemers</label>
                    <input
                      type="number"
                      value={eventForm.maxParticipants}
                      onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-[#B6C948] text-sm mb-1">Zichtbaarheid</label>
                    <select
                      value={eventForm.visibility}
                      onChange={(e) => setEventForm(prev => ({ ...prev, visibility: e.target.value as 'public' | 'veteran_plus' }))}
                      className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    >
                      <option value="public">Zichtbaar voor iedereen</option>
                      <option value="veteran_plus">Exclusief voor rang Veteran en hoger</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#3A4D23]">
                <button
                  onClick={handleSaveEvent}
                  className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {editingEvent ? 'Bijwerken' : 'Aanmaken'}
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#181F17] border border-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#232D1A] transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">E-mail alle deelnemers</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-[#B6C948] hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#B6C948] text-sm mb-1">Onderwerp</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Belangrijke update over het evenement"
                />
              </div>
              <div>
                <label className="block text-[#B6C948] text-sm mb-1">Bericht</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-[#181F17] border border-[#3A4D23] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-32 resize-none"
                  placeholder="Schrijf je bericht hier..."
                />
              </div>
              <div className="text-sm text-[#B6C948]">
                Dit bericht wordt verzonden naar {participants.length} deelnemer(s).
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-[#3A4D23]">
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-6 py-3 bg-[#8BAE5A] text-black rounded-lg hover:bg-[#B6C948] transition-colors font-semibold"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Versturen
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex items-center gap-2 px-6 py-3 bg-[#181F17] border border-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#232D1A] transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 