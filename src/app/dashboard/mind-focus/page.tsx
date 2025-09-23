'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { FaBrain, FaLeaf, FaLungs, FaRegSmileBeam, FaPlay, FaEdit, FaTrash, FaPlus, FaMusic, FaBookOpen, FaClock, FaUser, FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function MindFocusPage() {
  const { user, profile } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [modalData, setModalData] = useState({});

  // Check if user is admin
  const isAdmin = user?.email === 'rick@toptiermen.eu' || user?.email === 'chiel@media2net.nl';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181F17]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Toegang Geweigerd
          </h2>
          <p className="text-[#8BAE5A]/70">
            Deze pagina is alleen toegankelijk voor administrators.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: <FaBrain /> },
    { id: 'meditations', label: 'Meditaties', icon: <FaLeaf /> },
    { id: 'breathing', label: 'Ademhaling', icon: <FaLungs /> },
    { id: 'gratitude', label: 'Dankbaarheid', icon: <FaRegSmileBeam /> },
    { id: 'focus', label: 'Focus & Productiviteit', icon: <FaBookOpen /> },
  ];

  const [meditationData, setMeditationData] = useState([
    {
      id: 1,
      title: 'Ochtend Focus',
      speaker: 'Ruben',
      duration: 10,
      type: 'Focus',
      favorite: true,
      status: 'published'
    },
    {
      id: 2,
      title: 'Diepe Slaap',
      speaker: 'Sarah',
      duration: 20,
      type: 'Slaap',
      favorite: false,
      status: 'published'
    },
    {
      id: 3,
      title: 'Stress Loslaten',
      speaker: 'Ruben',
      duration: 8,
      type: 'Stressreductie',
      favorite: false,
      status: 'draft'
    },
  ]);

  const [breathingData, setBreathingData] = useState([
    {
      id: 1,
      title: 'Box Breathing',
      description: '4-4-4-4 ademhaling voor focus',
      duration: 5,
      difficulty: 'Beginner',
      status: 'published'
    },
    {
      id: 2,
      title: 'Wim Hof Methode',
      description: 'Koude training en ademhaling',
      duration: 15,
      difficulty: 'Advanced',
      status: 'published'
    },
  ]);

  const [gratitudeData, setGratitudeData] = useState([
    {
      id: 1,
      title: 'Dagelijkse Dankbaarheid',
      description: '3 dingen waar je dankbaar voor bent',
      frequency: 'Dagelijks',
      status: 'published'
    },
    {
      id: 2,
      title: 'Week Reflectie',
      description: 'Wekelijkse dankbaarheidsoefening',
      frequency: 'Wekelijks',
      status: 'published'
    },
  ]);

  const [focusData, setFocusData] = useState([
    {
      id: 1,
      title: 'Pomodoro Timer',
      description: '25 minuten gefocust werken',
      type: 'Tool',
      status: 'published'
    },
    {
      id: 2,
      title: 'Deep Work Sessie',
      description: '2 uur ononderbroken werken',
      type: 'Techniek',
      status: 'published'
    },
  ]);

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setModalData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
    setModalData({});
  };

  const handleSave = (type, data) => {
    const newId = Math.max(...getCurrentData(type).map(item => item.id)) + 1;
    const newItem = { ...data, id: newId, status: 'published' };
    
    switch (type) {
      case 'meditation':
        setMeditationData([...meditationData, newItem]);
        toast.success('Meditatie toegevoegd!');
        break;
      case 'breathing':
        setBreathingData([...breathingData, newItem]);
        toast.success('Ademhalingsoefening toegevoegd!');
        break;
      case 'gratitude':
        setGratitudeData([...gratitudeData, newItem]);
        toast.success('Dankbaarheidsoefening toegevoegd!');
        break;
      case 'focus':
        setFocusData([...focusData, newItem]);
        toast.success('Focus tool toegevoegd!');
        break;
    }
    closeModal();
  };

  const handleEdit = (type, item) => {
    switch (type) {
      case 'meditation':
        setMeditationData(meditationData.map(i => i.id === item.id ? { ...i, ...item } : i));
        toast.success('Meditatie bijgewerkt!');
        break;
      case 'breathing':
        setBreathingData(breathingData.map(i => i.id === item.id ? { ...i, ...item } : i));
        toast.success('Ademhalingsoefening bijgewerkt!');
        break;
      case 'gratitude':
        setGratitudeData(gratitudeData.map(i => i.id === item.id ? { ...i, ...item } : i));
        toast.success('Dankbaarheidsoefening bijgewerkt!');
        break;
      case 'focus':
        setFocusData(focusData.map(i => i.id === item.id ? { ...i, ...item } : i));
        toast.success('Focus tool bijgewerkt!');
        break;
    }
    closeModal();
  };

  const handleDelete = (type, id) => {
    if (confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      switch (type) {
        case 'meditation':
          setMeditationData(meditationData.filter(i => i.id !== id));
          toast.success('Meditatie verwijderd!');
          break;
        case 'breathing':
          setBreathingData(breathingData.filter(i => i.id !== id));
          toast.success('Ademhalingsoefening verwijderd!');
          break;
        case 'gratitude':
          setGratitudeData(gratitudeData.filter(i => i.id !== id));
          toast.success('Dankbaarheidsoefening verwijderd!');
          break;
        case 'focus':
          setFocusData(focusData.filter(i => i.id !== id));
          toast.success('Focus tool verwijderd!');
          break;
      }
    }
  };

  const getCurrentData = (type) => {
    switch (type) {
      case 'meditation': return meditationData;
      case 'breathing': return breathingData;
      case 'gratitude': return gratitudeData;
      case 'focus': return focusData;
      default: return [];
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
        <div className="flex items-center gap-3 mb-4">
          <FaLeaf className="text-[#8BAE5A] text-xl" />
          <h3 className="text-white font-semibold">Meditaties</h3>
        </div>
        <p className="text-[#8BAE5A] text-2xl font-bold">{meditationData.length}</p>
        <p className="text-[#8BAE5A]/70 text-sm">Totaal beschikbaar</p>
      </div>

      <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
        <div className="flex items-center gap-3 mb-4">
          <FaLungs className="text-[#8BAE5A] text-xl" />
          <h3 className="text-white font-semibold">Ademhaling</h3>
        </div>
        <p className="text-[#8BAE5A] text-2xl font-bold">{breathingData.length}</p>
        <p className="text-[#8BAE5A]/70 text-sm">Oefeningen</p>
      </div>

      <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
        <div className="flex items-center gap-3 mb-4">
          <FaRegSmileBeam className="text-[#8BAE5A] text-xl" />
          <h3 className="text-white font-semibold">Dankbaarheid</h3>
        </div>
        <p className="text-[#8BAE5A] text-2xl font-bold">{gratitudeData.length}</p>
        <p className="text-[#8BAE5A]/70 text-sm">Oefeningen</p>
      </div>

      <div className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
        <div className="flex items-center gap-3 mb-4">
          <FaBookOpen className="text-[#8BAE5A] text-xl" />
          <h3 className="text-white font-semibold">Focus Tools</h3>
        </div>
        <p className="text-[#8BAE5A] text-2xl font-bold">{focusData.length}</p>
        <p className="text-[#8BAE5A]/70 text-sm">Beschikbaar</p>
      </div>
    </div>
  );

  const renderMeditations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Meditatie Bibliotheek</h2>
        <button 
          onClick={() => openModal('meditation')}
          className="bg-[#8BAE5A] text-[#181F17] px-4 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2"
        >
          <FaPlus /> Nieuwe Meditatie
        </button>
      </div>

      <div className="grid gap-4">
        {meditationData.map((meditation) => (
          <div key={meditation.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold text-lg">{meditation.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meditation.status === 'published' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {meditation.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm">
                  <span className="flex items-center gap-1">
                    <FaUser /> {meditation.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {meditation.duration} min
                  </span>
                  <span>{meditation.type}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('meditation', meditation)}
                  className="p-2 text-[#8BAE5A] hover:bg-[#3A4D23]/40 rounded-lg transition-colors"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete('meditation', meditation.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBreathing = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Ademhalingsoefeningen</h2>
        <button 
          onClick={() => openModal('breathing')}
          className="bg-[#8BAE5A] text-[#181F17] px-4 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2"
        >
          <FaPlus /> Nieuwe Oefening
        </button>
      </div>

      <div className="grid gap-4">
        {breathingData.map((exercise) => (
          <div key={exercise.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">{exercise.title}</h3>
                <p className="text-[#8BAE5A]/70 mb-3">{exercise.description}</p>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm">
                  <span className="flex items-center gap-1">
                    <FaClock /> {exercise.duration} min
                  </span>
                  <span>Niveau: {exercise.difficulty}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('breathing', exercise)}
                  className="p-2 text-[#8BAE5A] hover:bg-[#3A4D23]/40 rounded-lg transition-colors"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete('breathing', exercise.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGratitude = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Dankbaarheidsdagboek</h2>
        <button 
          onClick={() => openModal('gratitude')}
          className="bg-[#8BAE5A] text-[#181F17] px-4 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2"
        >
          <FaPlus /> Nieuwe Oefening
        </button>
      </div>

      <div className="grid gap-4">
        {gratitudeData.map((exercise) => (
          <div key={exercise.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">{exercise.title}</h3>
                <p className="text-[#8BAE5A]/70 mb-3">{exercise.description}</p>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm">
                  <span>Frequentie: {exercise.frequency}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('gratitude', exercise)}
                  className="p-2 text-[#8BAE5A] hover:bg-[#3A4D23]/40 rounded-lg transition-colors"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete('gratitude', exercise.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFocus = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Focus & Productiviteit</h2>
        <button 
          onClick={() => openModal('focus')}
          className="bg-[#8BAE5A] text-[#181F17] px-4 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center gap-2"
        >
          <FaPlus /> Nieuwe Tool
        </button>
      </div>

      <div className="grid gap-4">
        {focusData.map((tool) => (
          <div key={tool.id} className="bg-[#232D1A]/80 rounded-xl p-6 border border-[#3A4D23]/40">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">{tool.title}</h3>
                <p className="text-[#8BAE5A]/70 mb-3">{tool.description}</p>
                <div className="flex items-center gap-4 text-[#8BAE5A]/70 text-sm">
                  <span>Type: {tool.type}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('focus', tool)}
                  className="p-2 text-[#8BAE5A] hover:bg-[#3A4D23]/40 rounded-lg transition-colors"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete('focus', tool.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <FaTrash />
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Mind & Focus Admin 🧠
            </h1>
            <p className="text-[#8BAE5A]/70 text-lg">
              Beheer alle Mind & Focus content en functionaliteiten
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-[#3A4D23]/40">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-colors ${
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232D1A] rounded-xl p-6 w-full max-w-md mx-4 border border-[#3A4D23]/40">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? 'Bewerk' : 'Nieuwe'} {modalType === 'meditation' ? 'Meditatie' : 
                 modalType === 'breathing' ? 'Ademhalingsoefening' :
                 modalType === 'gratitude' ? 'Dankbaarheidsoefening' : 'Focus Tool'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-[#8BAE5A]/70 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());
              if (editingItem) {
                handleEdit(modalType, { ...editingItem, ...data });
              } else {
                handleSave(modalType, data);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Titel
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={modalData.title || ''}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    name="description"
                    defaultValue={modalData.description || ''}
                    className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] h-20"
                    required
                  />
                </div>

                {modalType === 'meditation' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                        Speaker
                      </label>
                      <input
                        type="text"
                        name="speaker"
                        defaultValue={modalData.speaker || ''}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                        Duur (minuten)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        defaultValue={modalData.duration || ''}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                        Type
                      </label>
                      <select
                        name="type"
                        defaultValue={modalData.type || ''}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        required
                      >
                        <option value="">Selecteer type</option>
                        <option value="Focus">Focus</option>
                        <option value="Slaap">Slaap</option>
                        <option value="Stressreductie">Stressreductie</option>
                        <option value="Energie">Energie</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'breathing' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                        Duur (minuten)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        defaultValue={modalData.duration || ''}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                        Moeilijkheidsgraad
                      </label>
                      <select
                        name="difficulty"
                        defaultValue={modalData.difficulty || ''}
                        className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                        required
                      >
                        <option value="">Selecteer niveau</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'gratitude' && (
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Frequentie
                    </label>
                    <select
                      name="frequency"
                      defaultValue={modalData.frequency || ''}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      required
                    >
                      <option value="">Selecteer frequentie</option>
                      <option value="Dagelijks">Dagelijks</option>
                      <option value="Wekelijks">Wekelijks</option>
                      <option value="Maandelijks">Maandelijks</option>
                    </select>
                  </div>
                )}

                {modalType === 'focus' && (
                  <div>
                    <label className="block text-sm font-medium text-[#8BAE5A] mb-2">
                      Type
                    </label>
                    <select
                      name="type"
                      defaultValue={modalData.type || ''}
                      className="w-full px-3 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
                      required
                    >
                      <option value="">Selecteer type</option>
                      <option value="Tool">Tool</option>
                      <option value="Techniek">Techniek</option>
                      <option value="Methode">Methode</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#8BAE5A] text-[#181F17] px-4 py-2 rounded-lg font-semibold hover:bg-[#B6C948] transition-colors flex items-center justify-center gap-2"
                  >
                    <FaSave /> {editingItem ? 'Bijwerken' : 'Toevoegen'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-[#3A4D23] text-[#8BAE5A] px-4 py-2 rounded-lg font-semibold hover:bg-[#3A4D23]/80 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
