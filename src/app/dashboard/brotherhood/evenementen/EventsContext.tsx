'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
  id: number;
  title: string;
  type: 'Online Workshop' | 'Fysieke Meetup' | 'Mastermind Call';
  date: string;
  time: string;
  location: string;
  image: string;
  attendees: number;
  attendeesList: Array<{
    id: number;
    name: string;
    avatar: string;
  }>;
  description: string;
  host: string;
  hostId: number;
  status: 'upcoming' | 'past';
  agenda: string[];
  doelgroep: string;
  leerdoelen: string[];
}

interface EventsContextType {
  events: Event[];
  userRsvps: Set<number>;
  rsvpToEvent: (eventId: number) => void;
  cancelRsvp: (eventId: number) => void;
  isUserRsvped: (eventId: number) => boolean;
  getUserEvents: () => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const events: Event[] = [
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
  },
  {
    id: 3,
    title: 'Mastermind Call: Financiële Groei',
    type: 'Mastermind Call',
    date: '2024-02-25',
    time: '20:00-21:30',
    location: 'Online via Teams',
    image: '/images/brotherhood/qena.png',
    attendees: 15,
    attendeesList: [
      { id: 1, name: 'Rick', avatar: '/profielfoto.png' },
      { id: 7, name: 'Mike', avatar: '/profielfoto.png' },
      { id: 8, name: 'David', avatar: '/profielfoto.png' },
    ],
    description: 'Een diepgaande discussie over investeringsstrategieën en passief inkomen.',
    host: 'Mark Johnson',
    hostId: 3,
    status: 'upcoming',
    agenda: [
      'Welkom & introductie',
      'Huidige marktanalyse',
      'Investeringsstrategieën',
      'Q&A sessie',
      'Afsluiting'
    ],
    doelgroep: 'Leden die geïnteresseerd zijn in financiële groei en investeringen.',
    leerdoelen: [
      'Begrijpen van markttrends',
      'Investeringsstrategieën ontwikkelen',
      'Risicomanagement',
      'Passief inkomen opbouwen'
    ]
  },
  {
    id: 4,
    title: 'Workshop: Mindset & Discipline',
    type: 'Online Workshop',
    date: '2024-01-30',
    time: '19:00-21:00',
    location: 'Online via Zoom',
    image: '/images/brotherhood/mastermind.png',
    attendees: 20,
    attendeesList: [],
    description: 'Een workshop over het ontwikkelen van een onwankelbare mindset en dagelijkse discipline.',
    host: 'Rick Cuijpers',
    hostId: 1,
    status: 'past',
    agenda: [
      'Introductie mindset',
      'Discipline principes',
      'Praktische oefeningen',
      'Afsluiting'
    ],
    doelgroep: 'Iedereen die zijn mindset en discipline wil verbeteren.',
    leerdoelen: [
      'Mindset principes begrijpen',
      'Discipline ontwikkelen',
      'Dagelijkse routines opbouwen'
    ]
  }
];

export function EventsProvider({ children }: { children: ReactNode }) {
  const [userRsvps, setUserRsvps] = useState<Set<number>>(new Set());

  const rsvpToEvent = (eventId: number) => {
    setUserRsvps(prev => new Set([...prev, eventId]));
  };

  const cancelRsvp = (eventId: number) => {
    setUserRsvps(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const isUserRsvped = (eventId: number) => {
    return userRsvps.has(eventId);
  };

  const getUserEvents = () => {
    return events.filter(event => userRsvps.has(event.id));
  };

  return (
    <EventsContext.Provider value={{
      events,
      userRsvps,
      rsvpToEvent,
      cancelRsvp,
      isUserRsvped,
      getUserEvents
    }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
} 