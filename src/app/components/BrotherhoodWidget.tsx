import Link from 'next/link';
import { BellIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

export default function BrotherhoodWidget() {
  return (
    <div className="bg-[#232D1A]/90 rounded-2xl shadow-xl border border-[#3A4D23]/40 p-6 mb-8 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white mb-2">Jouw Brotherhood Vandaag</h3>
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-start md:items-center">
        {/* Notificaties */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181F17] text-[#FFD700] font-semibold shadow hover:bg-[#232D1A] transition"
          onClick={() => alert('Notificatiecentrum opent hier!')}
        >
          <BellIcon className="w-6 h-6" />
          3 nieuwe meldingen
        </button>
        {/* Connecties */}
        <Link href="/dashboard/brotherhood/leden" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold shadow hover:bg-[#232D1A] transition">
          <UserGroupIcon className="w-6 h-6" />
          1 openstaand connectieverzoek
        </Link>
      </div>
      {/* Live Snippet Social Feed */}
      <Link href="/dashboard/brotherhood/social-feed" className="flex items-center gap-3 mt-2 p-4 rounded-xl bg-[#181F17] text-[#E1CBB3] hover:bg-[#232D1A] transition group">
        <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8BAE5A] group-hover:text-[#FFD700] transition" />
        <span className="flex-1">
          <span className="text-white font-semibold">Mark V.</span> heeft zojuist een nieuw <span className="text-[#FFD700] font-bold">PR</span> gezet op de Deadlift.
        </span>
        <span className="text-xs text-[#8BAE5A] ml-2">Nu</span>
      </Link>
    </div>
  );
} 