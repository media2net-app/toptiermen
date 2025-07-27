'use client';
import ClientLayout from '../../../components/ClientLayout';
import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, CalendarIcon, ListBulletIcon, MapPinIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useEvents } from './EventsContext';

const eventTypes = ['Alles', 'Online Workshop', 'Fysieke Meetup', 'Mastermind Call'];
const statusFilters = ['Aankomend', 'Voorbij'];

export default function EvenementenPage() {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Alles');
  const [selectedStatus, setSelectedStatus] = useState('Aankomend');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Alles' || event.type === selectedType;
    const matchesStatus = (selectedStatus === 'Aankomend' && event.status === 'upcoming') ||
                         (selectedStatus === 'Voorbij' && event.status === 'past');
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <ClientLayout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Community Evenementen</h1>
          <p className="text-[#8BAE5A] text-lg">Ontmoet, leer en groei samen tijdens onze online en offline evenementen.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="w-5 h-5 text-[#8BAE5A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Zoek op naam of trefwoord..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-white placeholder-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] border border-[#3A4D23]"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="text-[#8BAE5A] font-semibold mr-2">Type:</span>
              {eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    selectedType === type
                      ? 'bg-[#8BAE5A] text-[#181F17]'
                      : 'bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-[#8BAE5A] font-semibold mr-2">Status:</span>
              {statusFilters.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    selectedStatus === status
                      ? 'bg-[#8BAE5A] text-[#181F17]'
                      : 'bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[#8BAE5A] font-semibold">Weergave:</span>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-[#8BAE5A] text-[#181F17]'
                  : 'bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A]'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'calendar'
                  ? 'bg-[#8BAE5A] text-[#181F17]'
                  : 'bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#232D1A]'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Events List */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23] hover:border-[#8BAE5A] transition-all duration-200">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Event Image */}
                  <div className="w-full md:w-48 h-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                        <div className="flex items-center gap-4 text-[#8BAE5A] text-sm mb-3">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.type === 'Online Workshop' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : event.type === 'Fysieke Meetup'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {event.type}
                      </span>
                    </div>

                    <p className="text-[#B6C948] mb-4">{event.description}</p>

                    {/* Attendees */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-[#8BAE5A]" />
                        <span className="text-[#8BAE5A] text-sm">{event.attendees} broeders zijn aanwezig</span>
                        {event.attendeesList.length > 0 && (
                          <div className="flex -space-x-2">
                            {event.attendeesList.slice(0, 3).map(attendee => (
                              <img
                                key={attendee.id}
                                src={attendee.avatar}
                                alt={attendee.name}
                                className="w-6 h-6 rounded-full border-2 border-[#232D1A]"
                              />
                            ))}
                            {event.attendeesList.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-[#8BAE5A] text-[#181F17] text-xs flex items-center justify-center border-2 border-[#232D1A]">
                                +{event.attendeesList.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/dashboard/brotherhood/evenementen/${event.id}`}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-semibold hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
                      >
                        Bekijk Details & RSVP
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="text-center text-[#8BAE5A]">
              <p className="text-lg font-semibold mb-2">Kalenderweergave</p>
              <p className="text-sm">Deze functie wordt binnenkort toegevoegd.</p>
              <button
                onClick={() => setViewMode('list')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition"
              >
                Terug naar lijstweergave
              </button>
            </div>
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8BAE5A] text-lg">Geen evenementen gevonden met de huidige filters.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 