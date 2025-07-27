'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserMinusIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import { AdminCard, AdminStatsCard, AdminTable, AdminButton } from '../../../components/admin';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  rank: string;
  package: string;
  lastLogin: string;
  status: 'Actief' | 'Inactief' | 'Geblokkeerd';
  onboardingCompleted: boolean;
  badges: number;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    username: '@discipline_daniel',
    name: 'Daniel Visser',
    email: 'daniel@mail.com',
    rank: 'Alpha',
    package: 'Warrior',
    lastLogin: '27 mei 2025',
    status: 'Actief',
    onboardingCompleted: true,
    badges: 15,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    username: '@younglion',
    name: 'Sem Jansen',
    email: 'sem@outlook.com',
    rank: 'Recruit',
    package: 'Gratis',
    lastLogin: '26 mei 2025',
    status: 'Inactief',
    onboardingCompleted: false,
    badges: 3,
    createdAt: '2024-03-20'
  },
  {
    id: '3',
    username: '@thegrindcoach',
    name: 'Rico Bakker',
    email: 'rico@grind.nl',
    rank: 'Legion Commander',
    package: 'Alpha',
    lastLogin: '27 mei 2025',
    status: 'Actief',
    onboardingCompleted: true,
    badges: 28,
    createdAt: '2023-11-10'
  },
  {
    id: '4',
    username: '@marcobeginner',
    name: 'Marco D.',
    email: 'marco.d@gmail.com',
    rank: 'Initiate',
    package: 'Recruit',
    lastLogin: '18 mei 2025',
    status: 'Geblokkeerd',
    onboardingCompleted: true,
    badges: 7,
    createdAt: '2024-02-05'
  },
];

export default function Gebruikersbeheer() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRank, setSelectedRank] = useState('Alle rangen');
  const [selectedPackage, setSelectedPackage] = useState('Alle pakketten');
  const [selectedStatus, setSelectedStatus] = useState('Status: Alles');

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Actief').length;
  const newUsersThisMonth = users.filter(u => {
    const createdAt = new Date(u.createdAt);
    const now = new Date();
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;
  const coachingUsers = users.filter(u => u.package !== 'Gratis').length;
  const usersWithManyBadges = users.filter(u => u.badges > 10).length;

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rank filter
    if (selectedRank !== 'Alle rangen') {
      filtered = filtered.filter(user => user.rank === selectedRank);
    }

    // Package filter
    if (selectedPackage !== 'Alle pakketten') {
      filtered = filtered.filter(user => user.package === selectedPackage);
    }

    // Status filter
    if (selectedStatus !== 'Status: Alles') {
      const status = selectedStatus.replace('Status: ', '');
      filtered = filtered.filter(user => user.status === status);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRank, selectedPackage, selectedStatus]);

  // Handle user actions
  const handleUserAction = (userId: string, action: string) => {
    console.log(`Action ${action} for user ${userId}`);
    // Here you would implement the actual action logic
  };

  // Prepare table data
  const tableData = filteredUsers.map(user => ({
    Gebruikersnaam: user.username,
    Naam: user.name,
    Email: user.email,
    Rang: user.rank,
    Pakket: user.package,
    'Laatste login': user.lastLogin,
    Status: user.status,
    Badges: user.badges,
    Onboarding: user.onboardingCompleted ? '✅ Voltooid' : '⏳ In Progress'
  }));

  const tableHeaders = ['Gebruikersnaam', 'Naam', 'Email', 'Rang', 'Pakket', 'Laatste login', 'Status', 'Badges', 'Onboarding'];

  const renderActions = (user: User) => (
    <div className="flex gap-2">
      <AdminButton
        variant="secondary"
        size="sm"
        onClick={() => handleUserAction(user.id, 'view')}
        icon={<EyeIcon className="w-4 h-4" />}
      >
        Bekijken
      </AdminButton>
      <AdminButton
        variant="secondary"
        size="sm"
        onClick={() => handleUserAction(user.id, 'edit')}
        icon={<PencilIcon className="w-4 h-4" />}
      >
        Bewerken
      </AdminButton>
      {user.status === 'Actief' ? (
        <AdminButton
          variant="danger"
          size="sm"
          onClick={() => handleUserAction(user.id, 'deactivate')}
          icon={<UserMinusIcon className="w-4 h-4" />}
        >
          Deactiveren
        </AdminButton>
      ) : (
        <AdminButton
          variant="success"
          size="sm"
          onClick={() => handleUserAction(user.id, 'activate')}
          icon={<UserPlusIcon className="w-4 h-4" />}
        >
          Activeren
        </AdminButton>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Gebruikersbeheer</h1>
          <p className="text-[#B6C948] mt-2">Beheer alle leden van het Top Tier Men platform</p>
        </div>
        <AdminButton variant="primary" icon={<UserGroupIcon className="w-5 h-5" />}>
          Nieuwe Gebruiker Toevoegen
        </AdminButton>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatsCard
          title="Totaal aantal gebruikers"
          value={totalUsers}
          icon={<UserGroupIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Nieuwe leden deze maand"
          value={newUsersThisMonth}
          icon={<UserPlusIcon className="w-8 h-8" />}
          color="blue"
        />
        <AdminStatsCard
          title="Huidige actieve gebruikers"
          value={activeUsers}
          icon={<ShieldCheckIcon className="w-8 h-8" />}
          color="green"
        />
        <AdminStatsCard
          title="Gebruikers met coachingpakket"
          value={coachingUsers}
          icon={<TrophyIcon className="w-8 h-8" />}
          color="purple"
        />
        <AdminStatsCard
          title="Leden met >10 badges"
          value={usersWithManyBadges}
          icon={<TrophyIcon className="w-8 h-8" />}
          color="orange"
        />
      </div>

      {/* Filters & Search */}
      <AdminCard title="Filters & Zoeken" icon={<FunnelIcon className="w-6 h-6" />}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek op gebruikersnaam, e-mail, naam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
          >
            <option>Alle rangen</option>
            <option>Recruit</option>
            <option>Alpha</option>
            <option>Legion Commander</option>
            <option>Initiate</option>
          </select>
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
          >
            <option>Alle pakketten</option>
            <option>Gratis</option>
            <option>Warrior</option>
            <option>Alpha</option>
            <option>Recruit</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-[#181F17] border border-[#3A4D23] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] focus:border-transparent"
          >
            <option>Status: Alles</option>
            <option>Status: Actief</option>
            <option>Status: Inactief</option>
            <option>Status: Geblokkeerd</option>
          </select>
        </div>
      </AdminCard>

      {/* Users Table */}
      <AdminCard title="Gebruikers Overzicht" icon={<UserGroupIcon className="w-6 h-6" />}>
        <AdminTable
          headers={tableHeaders}
          data={tableData}
          loading={loading}
          emptyMessage="Geen gebruikers gevonden"
          actions={(item) => {
            const user = users.find(u => u.username === item.Gebruikersnaam);
            return user ? renderActions(user) : null;
          }}
        />
      </AdminCard>
    </div>
  );
} 