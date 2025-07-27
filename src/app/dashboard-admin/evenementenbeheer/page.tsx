'use client';

import { useState, useEffect } from 'react';
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
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import AdminCard from '@/components/admin/AdminCard';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminButton from '@/components/admin/AdminButton';

// Types
interface Event {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  organizer_id: string;
  location?: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  current_participants: number;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_featured: boolean;
  is_public: boolean;
  registration_deadline?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  event_categories?: {
    name: string;
    color: string;
    icon: string;
  };
  organizer?: {
    full_name: string;
    email: string;
  };
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

export default function EventManagement() {
  const [activeTab, setActiveTab] = useState<'events' | 'participants'>('events');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: { start: '', end: '' }
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category_id: '',
    organizer_id: '',
    location: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    is_featured: false,
    is_public: true,
    registration_deadline: '',
    cover_image_url: '',
    status: 'draft' as 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  });

  const [emailData, setEmailData] = useState({
    subject: '',
    message: ''
  });

  // Fetch event management data
  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching events data from database...');

      const response = await fetch('/api/admin/events');
      const data = await response.json();

      if (response.ok && data.success) {
        setEvents(data.events || []);
        console.log('✅ Events data loaded:', data.events?.length || 0, 'events');
      } else {
        throw new Error(data.error || 'Failed to fetch events data');
      }

      // For now, use empty participants array since we'll implement this later
      setParticipants([]);

    } catch (error) {
      console.error('❌ Error loading events data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load events data');
      
      // Fallback to empty arrays
      setEvents([]);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, []);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      category_id: '',
      organizer_id: '',
      location: '',
      start_date: '',
      end_date: '',
      max_participants: '',
      is_featured: false,
      is_public: true,
      registration_deadline: '',
      cover_image_url: '',
      status: 'draft'
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      category_id: event.category_id || '',
      organizer_id: event.organizer_id,
      location: event.location || '',
      start_date: event.start_date,
      end_date: event.end_date,
      max_participants: event.max_participants?.toString() || '',
      is_featured: event.is_featured,
      is_public: event.is_public,
      registration_deadline: event.registration_deadline || '',
      cover_image_url: event.cover_image_url || '',
      status: event.status
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
      case 'upcoming': return 'bg-green-600 text-white';
      case 'ongoing': return 'bg-blue-600 text-white';
      case 'completed': return 'bg-gray-600 text-white';
      case 'cancelled': return 'bg-red-600 text-white';
      case 'draft': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <CalendarIcon className="w-4 h-4" />;
      case 'ongoing': return <ClockIcon className="w-4 h-4" />;
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XMarkIcon className="w-4 h-4" />;
      case 'draft': return <DocumentTextIcon className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEvents = events.filter(event => {
    if (filters.status !== 'all' && event.status !== filters.status) return false;
    if (filters.dateRange.start && new Date(event.start_date) < new Date(filters.dateRange.start)) return false;
    if (filters.dateRange.end && new Date(event.start_date) > new Date(filters.dateRange.end)) return false;
    return true;
  });

  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    ongoingEvents: events.filter(e => e.status === 'ongoing').length,
    totalParticipants: participants.length
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#8BAE5A] text-xl">Laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-xl">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Evenementenbeheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle evenementen en deelnemers</p>
        </div>
        <div className="flex items-center gap-4">
          <AdminButton 
            onClick={fetchEventData} 
            variant="secondary" 
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Vernieuwen
          </AdminButton>
          <AdminButton 
            onClick={handleCreateEvent} 
            variant="primary" 
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Nieuw Evenement
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStatsCard
          icon={<CalendarIcon className="w-6 h-6" />}
          value={stats.totalEvents}
          title="Totaal Evenementen"
          color="blue"
        />
        <AdminStatsCard
          icon={<ClockIcon className="w-6 h-6" />}
          value={stats.upcomingEvents}
          title="Aankomende Events"
          color="green"
        />
        <AdminStatsCard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          value={stats.ongoingEvents}
          title="Lopende Events"
          color="orange"
        />
        <AdminStatsCard
          icon={<UsersIcon className="w-6 h-6" />}
          value={stats.totalParticipants}
          title="Totaal Deelnemers"
          color="purple"
        />
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-[#8BAE5A]" />
            <span className="text-[#8BAE5A] font-medium">Filters:</span>
          </div>
          
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            <option value="all">Alle Statussen</option>
            <option value="draft">Concept</option>
            <option value="upcoming">Aankomend</option>
            <option value="ongoing">Lopend</option>
            <option value="completed">Voltooid</option>
            <option value="cancelled">Geannuleerd</option>
          </select>

          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
            className="px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            placeholder="Start datum"
          />

          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
            className="px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
            placeholder="Eind datum"
          />
        </div>
      </AdminCard>

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
          Evenementen ({filteredEvents.length})
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
          Deelnemers ({participants.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <AdminCard>
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-[#3A4D23] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#8BAE5A] mb-2">Geen evenementen gevonden</h3>
                <p className="text-[#B6C948] mb-6">Er zijn nog geen evenementen aangemaakt of de filters zijn te strikt.</p>
                <AdminButton 
                  onClick={handleCreateEvent} 
                  variant="primary" 
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  Eerste Evenement Aanmaken
                </AdminButton>
              </div>
            </AdminCard>
          ) : (
            filteredEvents.map((event) => (
              <AdminCard key={event.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-[#8BAE5A]">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                        {event.status}
                      </span>
                      {event.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-600 text-white flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />
                          Uitgelicht
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#B6C948] mb-4">{event.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#8BAE5A]">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-[#8BAE5A]">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-[#8BAE5A]">
                        <UsersIcon className="w-4 h-4" />
                        <span>{event.current_participants} / {event.max_participants || '∞'} deelnemers</span>
                      </div>
                    </div>

                    {event.organizer && (
                      <div className="flex items-center gap-2 text-sm text-[#B6C948] mb-4">
                        <UserIcon className="w-4 h-4" />
                        <span>Organisator: {event.organizer.full_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AdminButton 
                      onClick={() => handleEditEvent(event)} 
                      variant="secondary" 
                      icon={<PencilIcon className="w-4 h-4" />}
                    >
                      Bewerken
                    </AdminButton>
                    <AdminButton 
                      onClick={() => setSelectedEvent(event.id)} 
                      variant="secondary" 
                      icon={<EyeIcon className="w-4 h-4" />}
                    >
                      Bekijken
                    </AdminButton>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="space-y-6">
          {participants.length === 0 ? (
            <AdminCard>
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-[#3A4D23] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#8BAE5A] mb-2">Geen deelnemers</h3>
                <p className="text-[#B6C948]">Er zijn nog geen deelnemers geregistreerd voor evenementen.</p>
              </div>
            </AdminCard>
          ) : (
            <div className="space-y-4">
              {participants.map((participant) => (
                <AdminCard key={participant.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={participant.avatar} 
                        alt={participant.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-[#8BAE5A]">{participant.name}</h4>
                        <p className="text-sm text-[#B6C948]">{participant.email}</p>
                        <p className="text-xs text-[#8BAE5A]">{participant.rank}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#B6C948]">
                        {new Date(participant.registrationDate).toLocaleDateString('nl-NL')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}>
                        {participant.status}
                      </span>
                    </div>
                  </div>
                </AdminCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">
                {editingEvent ? 'Evenement Bewerken' : 'Nieuw Evenement'}
              </h2>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-[#8BAE5A] hover:text-[#B6C948]"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Titel</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Beschrijving</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8BAE5A] font-medium mb-2">Start Datum</label>
                  <input
                    type="datetime-local"
                    value={eventForm.start_date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
                <div>
                  <label className="block text-[#8BAE5A] font-medium mb-2">Eind Datum</label>
                  <input
                    type="datetime-local"
                    value={eventForm.end_date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Locatie</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  placeholder="Online URL of fysieke locatie"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8BAE5A] font-medium mb-2">Max Deelnemers</label>
                  <input
                    type="number"
                    value={eventForm.max_participants}
                    onChange={(e) => setEventForm(prev => ({ ...prev, max_participants: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  />
                </div>
                <div>
                  <label className="block text-[#8BAE5A] font-medium mb-2">Status</label>
                  <select
                    value={eventForm.status}
                    onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                  >
                    <option value="draft">Concept</option>
                    <option value="upcoming">Aankomend</option>
                    <option value="ongoing">Lopend</option>
                    <option value="completed">Voltooid</option>
                    <option value="cancelled">Geannuleerd</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[#8BAE5A]">
                  <input
                    type="checkbox"
                    checked={eventForm.is_featured}
                    onChange={(e) => setEventForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="rounded border-[#3A4D23] bg-[#181F17] text-[#8BAE5A] focus:ring-[#8BAE5A]"
                  />
                  <span>Uitgelicht evenement</span>
                </label>
                <label className="flex items-center gap-2 text-[#8BAE5A]">
                  <input
                    type="checkbox"
                    checked={eventForm.is_public}
                    onChange={(e) => setEventForm(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-[#3A4D23] bg-[#181F17] text-[#8BAE5A] focus:ring-[#8BAE5A]"
                  />
                  <span>Publiek zichtbaar</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 mt-6">
              <AdminButton 
                onClick={() => setShowEventModal(false)} 
                variant="secondary"
              >
                Annuleren
              </AdminButton>
              <AdminButton 
                onClick={handleSaveEvent} 
                variant="primary"
              >
                {editingEvent ? 'Bijwerken' : 'Aanmaken'}
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#8BAE5A]">Email Sturen</h2>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-[#8BAE5A] hover:text-[#B6C948]"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Onderwerp</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
              
              <div>
                <label className="block text-[#8BAE5A] font-medium mb-2">Bericht</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 rounded-lg bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4 mt-6">
              <AdminButton 
                onClick={() => setShowEmailModal(false)} 
                variant="secondary"
              >
                Annuleren
              </AdminButton>
              <AdminButton 
                onClick={handleSendEmail} 
                variant="primary"
              >
                Versturen
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 