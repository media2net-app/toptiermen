'use client';

const users = [
  {
    username: '@discipline_daniel',
    name: 'Daniel Visser',
    email: 'daniel@mail.com',
    rank: 'Alpha',
    package: 'Warrior',
    lastLogin: '27 mei 2025',
    status: 'Actief',
    actions: ['Bekijken', 'Bewerk', 'Deactiveer'],
  },
  {
    username: '@younglion',
    name: 'Sem Jansen',
    email: 'sem@outlook.com',
    rank: 'Recruit',
    package: 'Gratis',
    lastLogin: '26 mei 2025',
    status: 'Inactief',
    actions: ['Bekijken', 'Heractiveer'],
  },
  {
    username: '@thegrindcoach',
    name: 'Rico Bakker',
    email: 'rico@grind.nl',
    rank: 'Legion Commander',
    package: 'Alpha',
    lastLogin: '27 mei 2025',
    status: 'Actief',
    actions: ['Bekijken', 'Badge geven'],
  },
  {
    username: '@marcobeginner',
    name: 'Marco D.',
    email: 'marco.d@gmail.com',
    rank: 'Initiate',
    package: 'Recruit',
    lastLogin: '18 mei 2025',
    status: 'Geblokkeerd',
    actions: ['Bekijken', 'Deblokkeren'],
  },
];

const sidebarStats = [
  { label: 'Totaal aantal gebruikers', value: 1682 },
  { label: 'Nieuwe leden deze maand', value: 143 },
  { label: 'Huidige actieve gebruikers', value: 1034 },
  { label: 'Gebruikers met coachingpakket', value: 127 },
  { label: 'Leden met >10 badges', value: 312 },
];

export default function Gebruikersbeheer() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      {/* Sidebar stats */}
      <aside className="w-full lg:w-72 flex-shrink-0 bg-[#181818]/95 rounded-2xl shadow-xl border border-[#C49C48]/40 p-6 mb-6 lg:mb-0 flex flex-col gap-4 h-fit">
        <h2 className="text-xl font-bold text-[#C49C48] mb-2">Gebruikersstatistieken</h2>
        {sidebarStats.map(stat => (
          <div key={stat.label} className="flex flex-col items-start mb-2">
            <span className="text-2xl font-bold text-[#C49C48]">{stat.value}</span>
            <span className="text-[#E5C97B] text-sm">{stat.label}</span>
          </div>
        ))}
      </aside>
      {/* Main content */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold text-[#C49C48] mb-6">Gebruikersbeheer</h1>
        {/* Filters & zoekopties */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input className="bg-[#111111] border border-[#C49C48]/40 rounded-xl px-4 py-2 text-[#C49C48] placeholder-[#E5C97B] focus:outline-none focus:ring-2 focus:ring-[#C49C48]" placeholder="Zoek op gebruikersnaam, e-mail, naam" />
          <select className="bg-[#111111] border border-[#C49C48]/40 rounded-xl px-4 py-2 text-[#C49C48] focus:outline-none focus:ring-2 focus:ring-[#C49C48]">
            <option>Alle rangen</option>
            <option>Recruit</option>
            <option>Alpha</option>
            <option>Legion Commander</option>
            <option>Initiate</option>
          </select>
          <select className="bg-[#111111] border border-[#C49C48]/40 rounded-xl px-4 py-2 text-[#C49C48] focus:outline-none focus:ring-2 focus:ring-[#C49C48]">
            <option>Alle pakketten</option>
            <option>Gratis</option>
            <option>Warrior</option>
            <option>Alpha</option>
            <option>Recruit</option>
          </select>
          <select className="bg-[#111111] border border-[#C49C48]/40 rounded-xl px-4 py-2 text-[#C49C48] focus:outline-none focus:ring-2 focus:ring-[#C49C48]">
            <option>Status: Alles</option>
            <option>Actief</option>
            <option>Inactief</option>
            <option>Geblokkeerd</option>
          </select>
        </div>
        {/* Gebruikerstabel */}
        <div className="overflow-x-auto rounded-2xl shadow-xl border border-[#C49C48]/40 bg-[#181818]/95">
          <table className="min-w-full divide-y divide-[#C49C48]/20">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Gebruikersnaam</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">E-mail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Rang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Pakket</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Laatste login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#E5C97B] uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C49C48]/20">
              {users.map(user => (
                <tr key={user.username} className="hover:bg-[#222]/60 transition">
                  <td className="px-4 py-3 text-[#C49C48] font-mono whitespace-nowrap">{user.username}</td>
                  <td className="px-4 py-3 text-[#E5C97B] whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-3 text-[#E5C97B] whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3 text-[#C49C48] whitespace-nowrap">{user.rank}</td>
                  <td className="px-4 py-3 text-[#C49C48] whitespace-nowrap">{user.package}</td>
                  <td className="px-4 py-3 text-[#E5C97B] whitespace-nowrap">{user.lastLogin}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${user.status === 'Actief' ? 'bg-[#C49C48]/20 text-[#C49C48]' : user.status === 'Geblokkeerd' ? 'bg-red-900/40 text-red-400' : 'bg-[#E5C97B]/20 text-[#E5C97B]'}`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap flex flex-wrap gap-2">
                    {user.actions.map(action => (
                      <button key={action} className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-black font-semibold text-xs shadow hover:from-[#E5C97B] hover:to-[#C49C48] transition-all border border-[#C49C48]/80">
                        {action}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 