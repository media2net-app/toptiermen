'use client';
import ClientLayout from '../../../../components/ClientLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, UserIcon, ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEvents } from '../EventsContext';
import { downloadICSFile, generateGoogleCalendarUrl, generateOutlookUrl } from '../utils/calendarUtils';

// Mock events data (should be shared in real app)
const events = [
  {
    id: 1,
    title: 'Online Workshop: Onderhandelen als een Pro',
    type: 'Online Workshop',
    date: '2024-02-15',
    time: '19:00-21:00',
    location: 'Online via Zoom',
    image: '/images/brotherhood/mastermind.png',
    attendees: 12,
    attendeesList: [
      { id: 1, name: 'Rick', avatar: '/profielfoto.png' },
      { id: 2, name: 'Daniel', avatar: '/profielfoto.png' },
      { id: 3, name: 'Mark', avatar: '/profielfoto.png' },
      { id: 4, name: 'Tom', avatar: '/profielfoto.png' },
    ],
    description: 'Leer de kunst van effectief onderhandelen in zowel zakelijke als persoonlijke situaties.',
    host: 'Rick Cuijpers',
    hostId: 1,
    status: 'upcoming',
    agenda: [
      'Introductie & welkom',
      'Theorie: Onderhandelingsprincipes',
      'Praktijk: Rollenspellen',
      'Q&A',
      'Afronding & netwerk'
    ],
    doelgroep: 'Iedereen die zijn onderhandelingsvaardigheden wil verbeteren, zowel zakelijk als privé.',
    leerdoelen: [
      'De 3 gouden regels van onderhandelen',
      'Hoe je zelfverzekerd een deal sluit',
      'Veelgemaakte fouten voorkomen',
      'Praktische tips direct toepassen'
    ]
  },
  {
    id: 2,
    title: 'Fysieke Meetup: Amsterdam Brotherhood',
    type: 'Fysieke Meetup',
    date: '2024-02-20',
    time: '18:30-22:00',
    location: 'Amsterdam Centrum',
    image: '/images/brotherhood/ardennen.png',
    attendees: 8,
    attendeesList: [
      { id: 1, name: 'Rick', avatar: '/profielfoto.png' },
      { id: 5, name: 'Alex', avatar: '/profielfoto.png' },
      { id: 6, name: 'Sam', avatar: '/profielfoto.png' },
    ],
    description: 'Een avond vol netwerken, kennis delen en broederschap in het hart van Amsterdam.',
    host: 'Daniel Koster',
    hostId: 2,
    status: 'upcoming',
    agenda: [
      'Inloop & welkom',
      'Korte presentaties',
      'Netwerkborrel',
      'Afsluiting'
    ],
    doelgroep: 'Leden uit regio Amsterdam en omstreken.',
    leerdoelen: [
      'Nieuwe broeders leren kennen',
      'Kennis delen',
      'Samenwerkingen opzetten'
    ]
  }
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export default function EventDetailPage() {
  const params = useParams() || {};
  const router = useRouter();
  const eventId = Number((params as any).id);
  const { events, isUserRsvped, rsvpToEvent, cancelRsvp } = useEvents();
  const event = events.find(e => e.id === eventId);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  if (!event) return (
    <ClientLayout>
      <div className="p-12 text-center text-[#8BAE5A]">Evenement niet gevonden.</div>
    </ClientLayout>
  );

  const isRsvped = isUserRsvped(event.id);

  const handleRSVP = () => {
    if (isRsvped) {
      cancelRsvp(event.id);
    } else {
      rsvpToEvent(event.id);
    }
  };

  const handleCalendarAction = (action: string) => {
    setShowCalendarDropdown(false);
    
    switch (action) {
      case 'google':
        window.open(generateGoogleCalendarUrl(event), '_blank');
        break;
      case 'outlook':
        window.open(generateOutlookUrl(event), '_blank');
        break;
      case 'ics':
        downloadICSFile(event);
        break;
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-10">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-64 shadow-xl">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 bg-[#181F17]/80 text-[#8BAE5A] p-2 rounded-full hover:bg-[#232D1A] border border-[#8BAE5A]"
            aria-label="Terug"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Kerninformatie */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-[#8BAE5A] text-sm mb-2">
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
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                <Link href={`/dashboard/brotherhood/leden/${event.hostId}`} className="underline hover:text-[#B6C948]">{event.host}</Link>
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${
            event.type === 'Online Workshop' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : event.type === 'Fysieke Meetup'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {event.type}
          </span>
        </div>

        {/* RSVP & Agenda */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <button
            onClick={handleRSVP}
            className={`flex-1 px-6 py-3 rounded-xl font-bold text-lg transition border-2 ${
              isRsvped
                ? 'bg-[#8BAE5A] text-[#181F17] border-[#8BAE5A] hover:bg-[#B6C948]'
                : 'bg-[#181F17] text-[#8BAE5A] border-[#8BAE5A] hover:bg-[#232D1A]'
            }`}
          >
            {isRsvped ? '✓ Jij bent aanwezig' : '+ Ik ben aanwezig (RSVP)'}
          </button>
          
          {/* Calendar Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold border border-[#8BAE5A] hover:from-[#B6C948] hover:to-[#8BAE5A] transition flex items-center justify-center gap-2"
            >
              Voeg toe aan Agenda
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            {showCalendarDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#232D1A] border border-[#3A4D23] rounded-xl shadow-xl z-10">
                <button
                  onClick={() => handleCalendarAction('google')}
                  className="w-full px-4 py-3 text-left text-[#8BAE5A] hover:bg-[#181F17] transition rounded-t-xl"
                >
                  Google Calendar
                </button>
                <button
                  onClick={() => handleCalendarAction('outlook')}
                  className="w-full px-4 py-3 text-left text-[#8BAE5A] hover:bg-[#181F17] transition"
                >
                  Outlook
                </button>
                <button
                  onClick={() => handleCalendarAction('ics')}
                  className="w-full px-4 py-3 text-left text-[#8BAE5A] hover:bg-[#181F17] transition rounded-b-xl"
                >
                  Download .ics bestand
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Linkerkolom: Over dit evenement */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">Over dit evenement</h2>
              <p className="text-[#B6C948] mb-4">{event.description}</p>
              <div className="mb-2">
                <span className="font-semibold text-[#8BAE5A]">Voor wie:</span> <span className="text-[#B6C948]">{event.doelgroep}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-[#8BAE5A]">Wat ga je leren?</span>
                <ul className="list-disc ml-6 text-[#B6C948]">
                  {event.leerdoelen.map((ld, i) => <li key={i}>{ld}</li>)}
                </ul>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-[#8BAE5A]">Agenda:</span>
                <ul className="list-decimal ml-6 text-[#B6C948]">
                  {event.agenda.map((ag, i) => <li key={i}>{ag}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Rechterkolom: Attendees */}
          <div>
            <h2 className="text-xl font-bold text-[#8BAE5A] mb-2">Wie gaan er nog meer?</h2>
            <div className="flex flex-wrap gap-3">
              {event.attendeesList.length === 0 && (
                <span className="text-[#B6C948]">Nog geen aanmeldingen</span>
              )}
              {event.attendeesList.map(att => (
                <Link
                  key={att.id}
                  href={`/dashboard/brotherhood/leden/${att.id}`}
                  className="flex flex-col items-center gap-1 hover:scale-105 transition"
                >
                  <img src={att.avatar} alt={att.name} className="w-12 h-12 rounded-full border-2 border-[#8BAE5A]" />
                  <span className="text-[#8BAE5A] text-xs font-semibold">{att.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-[#8BAE5A] text-sm">Totaal: {event.attendees} broeders</div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 