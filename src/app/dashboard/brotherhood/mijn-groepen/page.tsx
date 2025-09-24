'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CalendarDaysIcon, UsersIcon, ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BrotherhoodGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  max_members: number;
  is_private: boolean;
  created_at: string;
  brotherhood_group_members: Array<{
    id: string;
    role: string;
    joined_at: string;
    user_id: string;
    profiles: {
      id: string;
      full_name: string;
      email: string;
      avatar_url?: string;
    };
  }>;
  brotherhood_events: Array<{
    id: string;
    title: string;
    description: string;
    event_type: string;
    event_date: string;
    location: string;
    is_online: boolean;
    max_attendees: number;
    status: string;
  }>;
}

interface BrotherhoodEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  is_online: boolean;
  max_attendees: number;
  status: string;
  brotherhood_groups: {
    id: string;
    name: string;
    description: string;
  };
}

export default function MijnGroepenEnEvenementen() {
  const { user } = useSupabaseAuth();
  const [tab, setTab] = useState<'groepen' | 'evenementen'>('groepen');
  const [eventView, setEventView] = useState<'aankomend' | 'voorbij'>('aankomend');
  const [groups, setGroups] = useState<BrotherhoodGroup[]>([]);
  const [events, setEvents] = useState<BrotherhoodEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's groups from database
  useEffect(() => {
    if (!user?.id) return;

    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load groups
        const groupsResponse = await fetch(`/api/brotherhood/groups?userId=${user.id}`);
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setGroups(groupsData.groups || []);
        }

        // Load events
        const eventsResponse = await fetch(`/api/brotherhood/events?userId=${user.id}`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events || []);
        }
      } catch (err) {
        console.error('Error loading brotherhood data:', err);
        setError('Er is een fout opgetreden bij het laden van de gegevens.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Morgen';
    if (diffDays === -1) return 'Gisteren';
    if (diffDays > 1) return `Over ${diffDays} dagen`;
    if (diffDays < -1) return `${Math.abs(diffDays)} dagen geleden`;
    return date.toLocaleDateString('nl-NL');
  };

  const getEventStatus = (event: BrotherhoodEvent) => {
    const eventDate = new Date(event.event_date);
    const now = new Date();
    
    if (eventDate > now) {
      return 'upcoming';
    } else {
      return 'past';
    }
  };

  const upcomingEvents = events.filter(event => getEventStatus(event) === 'upcoming');
  const pastEvents = events.filter(event => getEventStatus(event) === 'past');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <div className="text-white text-lg">Brotherhood data laden...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181F17] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#8BAE5A] text-white px-4 py-2 rounded-lg hover:bg-[#7A9E4A] transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181F17] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#B6C948] mb-2">Mijn Brotherhood</h1>
          <p className="text-gray-300">Je groepen en evenementen</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-[#2A3A1A] p-1 rounded-lg">
          <button
            onClick={() => setTab('groepen')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tab === 'groepen'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <UsersIcon className="w-4 h-4 inline mr-2" />
            Mijn Groepen ({groups.length})
          </button>
          <button
            onClick={() => setTab('evenementen')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              tab === 'evenementen'
                ? 'bg-[#8BAE5A] text-[#181F17]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
            Evenementen ({events.length})
          </button>
        </div>

        {/* Groups Tab */}
        {tab === 'groepen' && (
          <div className="space-y-6">
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Nog geen groepen</h3>
                <p className="text-gray-500 mb-6">Word lid van een groep om te beginnen</p>
                <button className="bg-[#8BAE5A] text-white px-6 py-3 rounded-lg hover:bg-[#7A9E4A] transition-colors">
                  <PlusIcon className="w-4 h-4 inline mr-2" />
                  Groep zoeken
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div key={group.id} className="bg-[#2A3A1A] rounded-lg p-6 border border-[#3A4A2A]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{group.name}</h3>
                        <p className="text-gray-400 text-sm">{group.description}</p>
                      </div>
                      <span className="bg-[#8BAE5A] text-[#181F17] text-xs px-2 py-1 rounded-full">
                        {group.category}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-400 mb-4">
                      <UsersIcon className="w-4 h-4 mr-1" />
                      {group.brotherhood_group_members?.length || 0} leden
                    </div>

                    <div className="space-y-2 mb-4">
                      {group.brotherhood_group_members?.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center text-sm">
                          <div className="w-6 h-6 bg-[#8BAE5A] rounded-full flex items-center justify-center text-[#181F17] text-xs font-semibold mr-2">
                            {member.profiles?.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="text-gray-300">{member.profiles?.full_name || 'Onbekend'}</span>
                          {member.role === 'admin' && (
                            <span className="ml-2 text-[#8BAE5A] text-xs">Admin</span>
                          )}
                        </div>
                      ))}
                      {group.brotherhood_group_members && group.brotherhood_group_members.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{group.brotherhood_group_members.length - 3} andere leden
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/brotherhood/groepen/${group.id}`}
                        className="flex-1 bg-[#8BAE5A] text-[#181F17] text-center py-2 px-4 rounded-lg hover:bg-[#7A9E4A] transition-colors font-medium"
                      >
                        Bekijk Groep
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {tab === 'evenementen' && (
          <div className="space-y-6">
            {/* Event View Toggle */}
            <div className="flex space-x-1 bg-[#2A3A1A] p-1 rounded-lg w-fit">
              <button
                onClick={() => setEventView('aankomend')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  eventView === 'aankomend'
                    ? 'bg-[#8BAE5A] text-[#181F17]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Aankomend ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setEventView('voorbij')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  eventView === 'voorbij'
                    ? 'bg-[#8BAE5A] text-[#181F17]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Voorbij ({pastEvents.length})
              </button>
            </div>

            {/* Events List */}
            {eventView === 'aankomend' ? (
              upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Geen aankomende evenementen</h3>
                  <p className="text-gray-500">Er zijn momenteel geen aankomende evenementen</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-[#2A3A1A] rounded-lg p-6 border border-[#3A4A2A]">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{event.title}</h3>
                          <p className="text-gray-400">{event.description}</p>
                        </div>
                        <span className="bg-[#8BAE5A] text-[#181F17] text-xs px-2 py-1 rounded-full">
                          {event.event_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <CalendarDaysIcon className="w-4 h-4 mr-2" />
                          {formatDate(event.event_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          {event.brotherhood_groups?.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          {event.is_online ? '🌐 Online' : '📍 ' + event.location}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/brotherhood/evenementen/${event.id}`}
                          className="flex-1 bg-[#8BAE5A] text-[#181F17] text-center py-2 px-4 rounded-lg hover:bg-[#7A9E4A] transition-colors font-medium"
                        >
                          Bekijk Evenement
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              pastEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Geen voorbije evenementen</h3>
                  <p className="text-gray-500">Er zijn nog geen voorbije evenementen</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="bg-[#2A3A1A] rounded-lg p-6 border border-[#3A4A2A] opacity-75">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{event.title}</h3>
                          <p className="text-gray-400">{event.description}</p>
                        </div>
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                          Voorbij
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <CalendarDaysIcon className="w-4 h-4 mr-2" />
                          {formatDate(event.event_date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          {event.brotherhood_groups?.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          {event.is_online ? '🌐 Online' : '📍 ' + event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}