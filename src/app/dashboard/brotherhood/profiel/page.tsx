"use client";
import { useState } from 'react';
import { FaEdit, FaMapMarkerAlt, FaMedal, FaDumbbell, FaFire, FaUserFriends, FaCrown, FaCog, FaUsers, FaTrophy, FaCommentDots, FaHandshake, FaFistRaised } from 'react-icons/fa';
import Image from 'next/image';


// Force dynamic rendering to prevent navigator errors
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const coverUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
const avatarUrl = 'https://randomuser.me/api/portraits/men/32.jpg';
const badges = [
  { icon: <FaCrown className="text-yellow-400" />, name: 'Consistency King', desc: '30 dagen actief' },
  { icon: <FaFire className="text-red-500" />, name: 'Streak Master', desc: '14 dagen op rij getraind' },
  { icon: <FaDumbbell className="text-gray-300" />, name: 'Alpha', desc: 'Niveau Alpha behaald' },
];
const wallPosts = [
  { id: 1, type: 'milestone', content: '14 dagen op rij getraind! 🔥', time: '1u geleden', pinned: true },
  { id: 2, type: 'post', content: 'Vandaag 10.000 stappen gezet en 30 min gelezen.', time: '3u geleden' },
  { id: 3, type: 'ai', content: 'AI Coach: Geweldig werk deze week! Blijf gefocust op je doelen.', time: '1d geleden' },
];
const progress = [
  { label: '10% vetpercentage', value: 68 },
  { label: '75 Hard', value: 40 },
  { label: '6 AM Club', value: 90 },
];

const tabs = [
  { label: 'Wall', icon: <FaCommentDots /> },
  { label: 'Progressie', icon: <FaTrophy /> },
  { label: 'Badges', icon: <FaMedal /> },
  { label: 'Squad', icon: <FaUsers /> },
  { label: 'Instellingen', icon: <FaCog /> },
];

export default function Profiel() {
  const [activeTab, setActiveTab] = useState('Wall');

  return (
    <div className="min-h-screen bg-[#18122B] text-[#E1CBB3]">
      {/* Hero block */}
      <div className="relative w-full h-56 md:h-72 bg-[#232042] rounded-b-3xl overflow-hidden shadow-xl">
        <Image src={coverUrl} alt="cover" className="object-cover w-full h-full opacity-80" width={1200} height={288} />
        <div className="absolute top-4 right-4">
          <button className="bg-[#232042]/80 p-2 rounded-full text-white hover:bg-[#393053] shadow-lg"><FaEdit size={22} /></button>
        </div>
        <div className="absolute left-8" style={{ top: '100%', transform: 'translateY(-50%)' }}>
          <div className="relative">
            <Image src={avatarUrl} alt="avatar" className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-[#E1CBB3] shadow-xl object-cover" width={112} height={112} />
          </div>
        </div>
      </div>

      {/* Basisgegevens */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mt-16 md:mt-10 px-4 md:px-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-bold text-white">Rick</span>
            <span className="text-sm text-[#A3AED6] italic">Discipline equals freedom.</span>
          </div>
          <div className="flex gap-4 text-xs text-[#A3AED6] mb-2">
            <span>1.234 volgers</span>
            <span>321 gevolgd</span>
            <span className="flex items-center gap-1"><FaMapMarkerAlt /> Amsterdam</span>
            <span className="flex items-center gap-1"><FaUsers /> Squad: Elite</span>
          </div>
          <div className="flex gap-2 mt-2">
            {badges.map((b, i) => (
              <span key={i} className="group relative flex items-center">
                <span className="text-2xl">{b.icon}</span>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-[#232042] text-xs text-white px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">{b.name}: {b.desc}</span>
              </span>
            ))}
            <span className="ml-2 px-2 py-1 rounded bg-gradient-to-r from-yellow-400 to-gray-400 text-xs font-bold text-[#232042] shadow">Alpha</span>
          </div>
        </div>
        <div className="flex gap-2 md:gap-4 mt-4 md:mt-0">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#635985] to-[#443C68] text-white font-semibold shadow hover:from-[#443C68] hover:to-[#635985] flex items-center gap-2"><FaUserFriends /> Volgen</button>
          <button className="px-4 py-2 rounded-xl bg-[#232042] text-white font-semibold shadow hover:bg-[#393053] flex items-center gap-2"><FaHandshake /> Buddy</button>
          <button className="px-4 py-2 rounded-xl bg-[#393053] text-white font-semibold shadow hover:bg-[#232042] flex items-center gap-2"><FaFistRaised /> Uitdagen</button>
          <button className="px-4 py-2 rounded-xl bg-[#E1CBB3] text-[#232042] font-semibold shadow hover:bg-[#f0a14f] flex items-center gap-2">Respect</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 px-4 md:px-12 flex gap-2 md:gap-6 border-b border-[#393053]/60">
        {tabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-all ${activeTab === tab.label ? 'bg-gradient-to-r from-[#443C68] to-[#635985] text-white shadow' : 'text-[#A3AED6] hover:bg-[#232042]'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 md:px-12 py-8 flex flex-col md:flex-row gap-8">
        {/* Wall */}
        {activeTab === 'Wall' && (
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-4">Mijn Wall</h3>
            <div className="flex flex-col gap-4">
              {wallPosts.map(post => (
                <div key={post.id} className={`bg-[#232042]/80 rounded-2xl p-5 shadow-xl border border-[#393053]/40 ${post.pinned ? 'ring-2 ring-yellow-400' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {post.pinned && <span className="text-yellow-400 text-lg mr-2">📌</span>}
                    <span className="text-sm text-[#A3AED6]">{post.time}</span>
                  </div>
                  <div className="text-white text-base mb-1">{post.content}</div>
                  {post.type === 'ai' && <div className="text-xs text-[#f0a14f] italic mt-1">AI Coach</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Progressie */}
        {activeTab === 'Progressie' && (
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-4">Progressie</h3>
            <div className="flex flex-col gap-6">
              {progress.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#A3AED6] font-semibold">{p.label}</span>
                    <span className="text-white font-bold">{p.value}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#393053]/40 rounded-full overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-yellow-400 to-[#635985] rounded-full transition-all duration-700" style={{ width: `${p.value}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="mt-6">
                <span className="text-[#A3AED6] font-semibold mb-2 block">Progressiefoto&apos;s</span>
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-[#232042] rounded-xl flex items-center justify-center text-[#A3AED6] text-xs">Voor-foto</div>
                  <div className="w-32 h-32 bg-[#232042] rounded-xl flex items-center justify-center text-[#A3AED6] text-xs">Na-foto</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Badges */}
        {activeTab === 'Badges' && (
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-4">Badges & Achievements</h3>
            <div className="flex gap-4 flex-wrap">
              {badges.map((b, i) => (
                <div key={i} className="bg-[#232042]/80 rounded-xl p-4 flex flex-col items-center shadow border border-[#393053]/40 min-w-[120px]">
                  <span className="text-3xl mb-2">{b.icon}</span>
                  <span className="text-white font-semibold text-sm mb-1">{b.name}</span>
                  <span className="text-[#A3AED6] text-xs text-center">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Squad */}
        {activeTab === 'Squad' && (
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-4">Mijn Squad</h3>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40">
              <span className="text-[#A3AED6]">Je bent lid van <b>Squad Elite</b>. Groepschat en tribe features binnenkort beschikbaar!</span>
            </div>
          </div>
        )}
        {/* Instellingen */}
        {activeTab === 'Instellingen' && (
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-4">Instellingen</h3>
            <div className="bg-[#232042]/80 rounded-2xl p-6 shadow-xl border border-[#393053]/40">
              <span className="text-[#A3AED6]">Profielinstellingen en privacy-opties binnenkort beschikbaar.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 