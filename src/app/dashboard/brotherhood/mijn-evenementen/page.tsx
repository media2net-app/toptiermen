'use client';
import ClientLayout from '../../../components/ClientLayout';
import Link from 'next/link';
import { useEvents } from '../evenementen/EventsContext';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

export default function MijnEvenementenPage() {
  const { getUserEvents, cancelRsvp } = useEvents();
  const userEvents = getUserEvents();

  const handleCancelRSVP = (eventId: number) => {
    if (confirm('Weet je zeker dat je je aanmelding wilt annuleren?')) {
      cancelRsvp(eventId);
    }
  };

  return (
    <ClientLayout>
      <div className="p-6 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Mijn Evenementen</h1>
          <p className="text-[#8BAE5A] text-lg">Overzicht van alle evenementen waar je voor bent aangemeld</p>
        </div>

        {userEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-[#8BAE5A] mb-4">Nog geen evenementen</h2>
            <p className="text-[#B6C948] mb-6">Je hebt je nog niet aangemeld voor evenementen.</p>
            <Link
              href="/dashboard/brotherhood/evenementen"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-bold hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
            >
              Ontdek evenementen
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userEvents.map(event => (
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
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {event.host}
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/dashboard/brotherhood/evenementen/${event.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] text-[#181F17] font-semibold hover:from-[#B6C948] hover:to-[#8BAE5A] transition"
                      >
                        Bekijk Details
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleCancelRSVP(event.id)}
                        className="px-4 py-2 rounded-xl bg-[#181F17] text-red-400 font-semibold border border-red-400/30 hover:bg-red-400/10 transition"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <h3 className="text-lg font-bold text-[#8BAE5A] mb-4">Snelle Acties</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/dashboard/brotherhood/evenementen"
              className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
            >
              Ontdek nieuwe evenementen
            </Link>
            <Link
              href="/dashboard/brotherhood"
              className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
            >
              Terug naar Brotherhood
            </Link>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 