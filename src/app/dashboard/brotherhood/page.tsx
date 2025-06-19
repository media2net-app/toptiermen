"use client";
import ClientLayout from '../../components/ClientLayout';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { FaUsers, FaTrophy, FaCalendarAlt, FaComments } from 'react-icons/fa';
import BrotherhoodSubNav from "./SubNav";

// Mock data for the new community dashboard
const myGroups = [
  { id: 1, name: "Crypto & DeFi Pioniers", logo: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Mindset Masters", logo: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 3, name: "Fitness Tribe", logo: "https://randomuser.me/api/portraits/men/12.jpg" }
];

const myConnections = [
  { id: 1, name: "Rick", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Sven", avatar: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 3, name: "Teun", avatar: "https://randomuser.me/api/portraits/men/12.jpg" }
];

const upcomingEvents = [
  { id: 1, title: "Finance Mastermind Call", date: "Morgen 20:00", type: "Online Workshop", attendees: 12 },
  { id: 2, title: "Mindset Workshop", date: "Overmorgen 19:00", type: "Fysieke Meetup (Amsterdam)", attendees: 8 },
  { id: 3, title: "Crypto Meetup", date: "Volgende week", type: "Online Workshop", attendees: 15 }
];

const recentTopics = [
  { id: 1, title: "Hoe investeer je je eerste €1000?", author: "Mark V.", time: "2u geleden" },
  { id: 2, title: "Welk boek over mindset heeft jouw leven veranderd?", author: "Jeroen D.", time: "1u geleden" },
  { id: 3, title: "Ik zoek een accountability partner voor sporten.", author: "Rick", time: "10m geleden" }
];

const featuredGroups = [
  { id: 1, name: "Crypto & DeFi Pioniers", mission: "Samen de wereld van decentralized finance verkennen en kansen spotten.", members: 8, logo: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Mindset Masters", mission: "Groeien door mindset en persoonlijke ontwikkeling.", members: 6, logo: "https://randomuser.me/api/portraits/men/65.jpg" },
  { id: 3, name: "Fitness Tribe", mission: "Samen fitter en sterker worden.", members: 10, logo: "https://randomuser.me/api/portraits/men/12.jpg" }
];

const events = [
  {
    id: 1,
    title: 'Weekend Retreat',
    date: '15-17 maart 2024',
    location: 'Ardennen, België',
    spots: 12,
    price: '€495',
    image: '/images/brotherhood/ardennen.png',
  },
  {
    id: 2,
    title: 'Mastermind Avond',
    date: '28 maart 2024',
    location: 'Amsterdam',
    spots: 8,
    price: '€95',
    image: '/images/brotherhood/mastermind.png',
  },
  {
    id: 3,
    title: 'Online Q&A met Rick',
    date: '5 april 2024',
    location: 'Zoom',
    spots: 25,
    price: 'Gratis',
    image: '/images/brotherhood/qena.png',
  },
];

const challenges = [
  {
    id: 1,
    title: '30 Dagen Discipline',
    participants: 45,
    progress: 75,
    endDate: '15 maart 2024',
  },
  {
    id: 2,
    title: 'Fysieke Transformatie',
    participants: 32,
    progress: 60,
    endDate: '1 april 2024',
  },
  {
    id: 3,
    title: 'Mindset Mastery',
    participants: 28,
    progress: 40,
    endDate: '15 april 2024',
  },
];

export default function Brotherhood() {
  return (
    <ClientLayout>
      {/* Recente Activiteit Widget */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-2">Wat gebeurt er in de Brotherhood?</h2>
        <div className="bg-[#232D1A]/80 rounded-2xl p-4 border border-[#3A4D23]/40 text-[#8BAE5A]">
          <p className="italic">Recente posts uit de Social Feed komen hier...</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8BAE5A]/20 flex items-center justify-center">
              <FaUsers className="text-[#8BAE5A] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">248</div>
              <div className="text-[#8BAE5A] text-sm">Brothers</div>
            </div>
          </div>
        </div>
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8BAE5A]/20 flex items-center justify-center">
              <FaTrophy className="text-[#8BAE5A] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-[#8BAE5A] text-sm">Challenges</div>
            </div>
          </div>
        </div>
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8BAE5A]/20 flex items-center justify-center">
              <FaCalendarAlt className="text-[#8BAE5A] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">8</div>
              <div className="text-[#8BAE5A] text-sm">Events</div>
            </div>
          </div>
        </div>
        <div className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#8BAE5A]/20 flex items-center justify-center">
              <FaComments className="text-[#8BAE5A] text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">1.2k</div>
              <div className="text-[#8BAE5A] text-sm">Interacties</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Aankomende Events</h2>
          <Link
            href="/dashboard/brotherhood/evenementen"
            className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
          >
            Bekijk alle evenementen
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-[#232D1A]/80 rounded-2xl overflow-hidden shadow-xl border border-[#3A4D23]/40">
              <div className="relative h-48">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#232D1A] to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <div className="text-[#8BAE5A] text-sm mb-4">
                  <div>{event.date}</div>
                  <div>{event.location}</div>
                  <div>{event.spots} spots beschikbaar</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#FFD700] font-bold">{event.price}</span>
                  <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">Inschrijven</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Actieve Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="bg-[#232D1A]/80 rounded-2xl p-6 shadow-xl border border-[#3A4D23]/40">
              <h3 className="text-xl font-bold text-white mb-4">{challenge.title}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[#8BAE5A] text-sm mb-1">
                    <span>Voortgang</span>
                    <span>{challenge.progress}%</span>
                  </div>
                  <div className="h-2 bg-[#3A4D23]/40 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] rounded-full" style={{ width: `${challenge.progress}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-[#8BAE5A] text-sm">
                  <span>{challenge.participants} deelnemers</span>
                  <span>Eindigt: {challenge.endDate}</span>
                </div>
                <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all">Join Challenge</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
} 