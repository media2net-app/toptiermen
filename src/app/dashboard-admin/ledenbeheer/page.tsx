'use client';
import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  KeyIcon,
  StarIcon,
  NoSymbolIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Mock data - in real app this would come from API
const mockMembers = [
  {
    id: 1,
    name: 'Mark van der Berg',
    email: 'mark@example.com',
    rank: 'Elite',
    joinDate: '2024-01-15',
    status: 'active',
    avatar: '/profielfoto.png',
    lastActive: '2024-01-20',
    posts: 45,
    badges: 12
  },
  {
    id: 2,
    name: 'Thomas Jansen',
    email: 'thomas@example.com',
    rank: 'Warrior',
    joinDate: '2024-01-14',
    status: 'active',
    avatar: '/profielfoto.png',
    lastActive: '2024-01-19',
    posts: 23,
    badges: 8
  },
  {
    id: 3,
    name: 'Lucas de Vries',
    email: 'lucas@example.com',
    rank: 'Rookie',
    joinDate: '2024-01-13',
    status: 'inactive',
    avatar: '/profielfoto.png',
    lastActive: '2024-01-16',
    posts: 5,
    badges: 2
  },
  {
    id: 4,
    name: 'Daan Bakker',
    email: 'daan@example.com',
    rank: 'Elite',
    joinDate: '2024-01-12',
    status: 'active',
    avatar: '/profielfoto.png',
    lastActive: '2024-01-20',
    posts: 67,
    badges: 15
  },
  {
    id: 5,
    name: 'Sem Visser',
    email: 'sem@example.com',
    rank: 'Warrior',
    joinDate: '2024-01-11',
    status: 'suspended',
    avatar: '/profielfoto.png',
    lastActive: '2024-01-18',
    posts: 34,
    badges: 9
  }
];

const ranks = ['Alle Rangen', 'Rookie', 'Warrior', 'Elite', 'Legend'];
const statuses = ['Alle Statussen', 'active', 'inactive', 'suspended'];

export default function Ledenbeheer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('Alle Rangen');
  const [selectedStatus, setSelectedStatus] = useState('Alle Statussen');
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = selectedRank === 'Alle Rangen' || member.rank === selectedRank;
    const matchesStatus = selectedStatus === 'Alle Statussen' || member.status === selectedStatus;
    
    return matchesSearch && matchesRank && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-[#B6C948]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'inactive': return 'Inactief';
      case 'suspended': return 'Geschorst';
      default: return status;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite': return 'text-[#C49C48]';
      case 'Legend': return 'text-purple-400';
      case 'Warrior': return 'text-[#8BAE5A]';
      case 'Rookie': return 'text-[#B6C948]';
      default: return 'text-[#B6C948]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Ledenbeheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle leden van het Top Tier Men platform</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8BAE5A] font-semibold">
            {filteredMembers.length} van {mockMembers.length} leden
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
            <input
              type="text"
              placeholder="Zoek op naam of e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] placeholder-[#B6C948]"
            />
          </div>

          {/* Rank Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {ranks.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B6C948]" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#181F17] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] appearance-none"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'Alle Statussen' ? 'Alle Statussen' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button className="px-6 py-3 rounded-xl bg-[#8BAE5A] text-[#181F17] font-semibold hover:bg-[#B6C948] transition-all duration-200">
            Export CSV
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#181F17] border-b border-[#3A4D23]">
              <tr>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Lid</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">E-mail</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Rang</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Lid sinds</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Laatste activiteit</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Posts</th>
                <th className="px-6 py-4 text-left text-[#8BAE5A] font-semibold">Badges</th>
                <th className="px-6 py-4 text-center text-[#8BAE5A] font-semibold">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4D23]">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#181F17] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#8BAE5A]/20 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-[#8BAE5A]" />
                      </div>
                      <div>
                        <p className="text-[#8BAE5A] font-medium">{member.name}</p>
                        <p className="text-[#B6C948] text-sm">ID: {member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-[#B6C948]">{member.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRankColor(member.rank)} bg-[#181F17]`}>
                      {member.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)} bg-[#181F17]`}>
                      {getStatusText(member.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#B6C948]" />
                      <span className="text-[#B6C948]">
                        {new Date(member.joinDate).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#B6C948] text-sm">
                      {new Date(member.lastActive).toLocaleDateString('nl-NL')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#8BAE5A] font-semibold">{member.posts}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[#8BAE5A] font-semibold">{member.badges}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                          className="p-2 rounded-xl hover:bg-[#181F17] transition-colors duration-200"
                        >
                          <EllipsisVerticalIcon className="w-5 h-5 text-[#B6C948]" />
                        </button>
                        
                        {selectedMember === member.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-[#181F17] rounded-xl border border-[#3A4D23] shadow-lg z-10">
                            <div className="py-2">
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <EyeIcon className="w-4 h-4" />
                                Bekijk Profiel
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <PencilIcon className="w-4 h-4" />
                                Bewerk Gegevens
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <KeyIcon className="w-4 h-4" />
                                Reset Wachtwoord
                              </button>
                              <button className="w-full px-4 py-2 text-left text-[#B6C948] hover:bg-[#232D1A] flex items-center gap-2">
                                <StarIcon className="w-4 h-4" />
                                Promoveer/Degradeer
                              </button>
                              <button className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#232D1A] flex items-center gap-2">
                                <NoSymbolIcon className="w-4 h-4" />
                                Blokkeer Gebruiker
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-[#B6C948] text-sm">
          Toon {filteredMembers.length} van {mockMembers.length} leden
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#181F17] transition">
            Vorige
          </button>
          <span className="px-4 py-2 text-[#8BAE5A] font-semibold">1</span>
          <button className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#181F17] transition">
            Volgende
          </button>
        </div>
      </div>
    </div>
  );
} 