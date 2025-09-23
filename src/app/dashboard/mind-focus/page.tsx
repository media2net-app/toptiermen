'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { FaBrain, FaLeaf, FaLungs, FaRegSmileBeam, FaPlay, FaMusic, FaBookOpen, FaClock, FaUser, FaHeart, FaStar, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function MindFocusPage() {
  const { user, profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <FaBrain /> },
    { id: 'meditations', label: 'Meditaties', icon: <FaLeaf /> },
    { id: 'breathing', label: 'Ademhaling', icon: <FaLungs /> },
    { id: 'gratitude', label: 'Dankbaarheid', icon: <FaRegSmileBeam /> },
    { id: 'focus', label: 'Focus & Productiviteit', icon: <FaBookOpen /> },
  ];

  // Sample data - in real app this would come from API
  const meditationData = [
    {
      id: 1,
      title: 'Ochtend Focus',
      speaker: 'Ruben',
      duration: 10,
      type: 'Focus',
      favorite: true,
      description: 'Start je dag met helderheid en focus',
      audioUrl: '#'
    },
    {
      id: 2,
      title: 'Diepe Slaap',
      speaker: 'Sarah',
      duration: 20,
      type: 'Slaap',
      favorite: false,
      description: 'Ontspan en bereid je voor op een goede nachtrust',
      audioUrl: '#'
    },
    {
      id: 3,
      title: 'Stress Loslaten',
      speaker: 'Ruben',
      duration: 8,
      type: 'Stressreductie',
      favorite: true,
      description: 'Laat spanning los en vind innerlijke rust',
      audioUrl: '#'
    },
  ];

  const breathingData = [
    {
      id: 1,
      title: 'Box Breathing',
      description: '4-4-4-4 ademhaling voor focus en kalmte',
      duration: 5,
      difficulty: 'Beginner',
      steps: ['Inademen 4 tellen', 'Vasthouden 4 tellen', 'Uitademen 4 tellen', 'Wachten 4 tellen']
    },
    {
      id: 2,
      title: 'Wim Hof Methode',
      description: 'Koude training en ademhaling voor energie',
      duration: 15,
      difficulty: 'Advanced',
      steps: ['Diepe ademhaling', 'Vasthouden', 'Ontspanning', 'Herhaling']
    },
  ];

  const gratitudeData = [
    {
      id: 1,
      title: 'Dagelijkse Dankbaarheid',
      description: '3 dingen waar je dankbaar voor bent',
      frequency: 'Dagelijks',
      prompt: 'Wat ging er vandaag goed? Waar ben je dankbaar voor?'
    },
    {
      id: 2,
      title: 'Week Reflectie',
      description: 'Wekelijkse dankbaarheidsoefening',
      frequency: 'Wekelijks',
      prompt: 'Wat was het hoogtepunt van deze week?'
    },
  ];

  const focusData = [
    {
      id: 1,
      title: 'Pomodoro Timer',
      description: '25 minuten gefocust werken met korte pauzes',
      type: 'Tool',
      duration: 25,
      technique: '25 min werken, 5 min pauze, 4 cycli, lange pauze'
    },
    {
      id: 2,
      title: 'Deep Work Sessie',
      description: '2 uur ononderbroken werken',
      type: 'Techniek',
      duration: 120,
      technique: 'Elimineer afleidingen, focus op één taak'
    },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Mind & Focus 🧠
        </h1>
        <p className="text-[#8BAE5A]/70 text-lg max-w-2xl mx-auto">
          Versterk je geest, verbeter je focus en ontwikkel een positieve mindset met onze collectie meditaties, ademhalingsoefeningen en focus tools.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
          <FaLeaf className="text-[#8BAE5A] text-3xl mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Meditaties</h3>
          <p className="text-[#8BAE5A] text-2xl font-bold">{meditationData.length}</p>
          <p className="text-[#8BAE5A]/70 text-sm">Beschikbaar</p>
        </div>

        <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
          <FaLungs className="text-[#8BAE5A] text-3xl mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Ademhaling</h3>
          <p className="text-[#8BAE5A] text-2xl font-bold">{breathingData.length}</p>
          <p className="text-[#8BAE5A]/70 text-sm">Oefeningen</p>
        </div>

        <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
          <FaRegSmileBeam className="text-[#8BAE5A] text-3xl mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Dankbaarheid</h3>
          <p className="text-[#8BAE5A] text-2xl font-bold">{gratitudeData.length}</p>
          <p className="text-[#8BAE5A]/70 text-sm">Oefeningen</p>
        </div>

        <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 text-center">
          <FaBookOpen className="text-[#8BAE5A] text-3xl mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Focus Tools</h3>
          <p className="text-[#8BAE5A] text-2xl font-bold">{focusData.length}</p>
          <p className="text-[#8BAE5A]/70 text-sm">Beschikbaar</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/mind-en-focus/meditaties" className="group">
          <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A] transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <FaLeaf className="text-[#8BAE5A] text-2xl" />
              <div>
                <h3 className="text-white font-semibold text-lg">Meditatie Bibliotheek</h3>
                <p className="text-[#8BAE5A]/70">Ontdek geleide meditaties</p>
              </div>
            </div>
            <p className="text-[#8BAE5A]/70 text-sm mb-4">
              Vind rust en helderheid met onze collectie geleide meditaties. Voor beginners en gevorderden.
            </p>
            <div className="flex items-center text-[#8BAE5A] group-hover:text-white transition-colors">
              <span className="text-sm font-medium">Bekijk meditaties</span>
              <FaPlayCircle className="ml-2" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/mind-en-focus/focus" className="group">
          <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A] transition-colors">
            <div className="flex items-center gap-4 mb-4">
              <FaBookOpen className="text-[#8BAE5A] text-2xl" />
              <div>
                <h3 className="text-white font-semibold text-lg">Focus & Productiviteit</h3>
                <p className="text-[#8BAE5A]/70">Verbeter je concentratie</p>
              </div>
            </div>
            <p className="text-[#8BAE5A]/70 text-sm mb-4">
              Leer technieken om afleiding te verslaan en diep werk te verrichten. Inclusief Pomodoro timer.
            </p>
            <div className="flex items-center text-[#8BAE5A] group-hover:text-white transition-colors">
              <span className="text-sm font-medium">Start focus sessie</span>
              <FaPlayCircle className="ml-2" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  const renderMeditations = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Meditatie Bibliotheek</h2>
        <p className="text-[#8BAE5A]/70">Ontdek geleide meditaties voor elke situatie</p>
      </div>

      <div className="grid gap-6">
        {meditationData.map((meditation) => (
          <div key={meditation.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-white font-semibold text-xl">{meditation.title}</h3>
                  {meditation.favorite && <FaHeart className="text-red-400" />}
                </div>
                <p className="text-[#8BAE5A]/70 mb-4">{meditation.description}</p>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <FaUser /> {meditation.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {meditation.duration} min
                  </span>
                  <span className="px-2 py-1 bg-[#3A4D23]/40 rounded-full text-xs">
                    {meditation.type}
                  </span>
                </div>
                <button className="bg-[#8BAE5A] text-[#181F17] px-6 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2">
                  <FaPlay /> Start Meditatie
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBreathing = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Ademhalingsoefeningen</h2>
        <p className="text-[#8BAE5A]/70">Verlaag stress en verhoog je energie</p>
      </div>

      <div className="grid gap-6">
        {breathingData.map((exercise) => (
          <div key={exercise.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-white font-semibold text-xl">{exercise.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exercise.difficulty === 'Beginner' 
                      ? 'bg-green-500/20 text-green-400' 
                      : exercise.difficulty === 'Advanced'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-[#8BAE5A]/70 mb-4">{exercise.description}</p>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <FaClock /> {exercise.duration} min
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-2">Stappen:</h4>
                  <ul className="text-[#8BAE5A]/70 text-sm space-y-1">
                    {exercise.steps.map((step, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FaCheckCircle className="text-[#8BAE5A] text-xs" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="bg-[#8BAE5A] text-[#181F17] px-6 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2">
                  <FaPlay /> Start Oefening
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGratitude = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Dankbaarheidsdagboek</h2>
        <p className="text-[#8BAE5A]/70">Train je brein om het positieve te zien</p>
      </div>

      <div className="grid gap-6">
        {gratitudeData.map((exercise) => (
          <div key={exercise.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-white font-semibold text-xl">{exercise.title}</h3>
                  <span className="px-2 py-1 bg-[#3A4D23]/40 rounded-full text-xs text-[#8BAE5A]">
                    {exercise.frequency}
                  </span>
                </div>
                <p className="text-[#8BAE5A]/70 mb-4">{exercise.description}</p>
                <div className="bg-[#181F17]/50 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-2">Reflectie Vraag:</h4>
                  <p className="text-[#8BAE5A]/70 text-sm italic">"{exercise.prompt}"</p>
                </div>
                <button className="bg-[#8BAE5A] text-[#181F17] px-6 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2">
                  <FaRegSmileBeam /> Start Dagboek
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFocus = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Focus & Productiviteit</h2>
        <p className="text-[#8BAE5A]/70">Leer technieken om afleiding te verslaan</p>
      </div>

      <div className="grid gap-6">
        {focusData.map((tool) => (
          <div key={tool.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40 hover:border-[#8BAE5A] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-white font-semibold text-xl">{tool.title}</h3>
                  <span className="px-2 py-1 bg-[#3A4D23]/40 rounded-full text-xs text-[#8BAE5A]">
                    {tool.type}
                  </span>
                </div>
                <p className="text-[#8BAE5A]/70 mb-4">{tool.description}</p>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <FaClock /> {tool.duration} min
                  </span>
                </div>
                <div className="bg-[#181F17]/50 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-2">Techniek:</h4>
                  <p className="text-[#8BAE5A]/70 text-sm">{tool.technique}</p>
                </div>
                <button className="bg-[#8BAE5A] text-[#181F17] px-6 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2">
                  <FaPlay /> Start Sessie
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#181F17]">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-[#3A4D23]/40 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#8BAE5A] text-[#181F17]'
                    : 'text-[#8BAE5A]/70 hover:text-white hover:bg-[#3A4D23]/40'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-[#232D1A]/80 rounded-xl shadow-xl border border-[#3A4D23]/40 p-8">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'meditations' && renderMeditations()}
            {activeTab === 'breathing' && renderBreathing()}
            {activeTab === 'gratitude' && renderGratitude()}
            {activeTab === 'focus' && renderFocus()}
          </div>
        </div>
      </div>
    </div>
  );
}