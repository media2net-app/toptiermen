import ClientLayout from '@/components/ClientLayout';
import Link from 'next/link';
import { FaLeaf, FaLungs, FaBrain } from 'react-icons/fa6';
import { FaRegSmileBeam } from 'react-icons/fa';

const cards = [
  {
    title: 'Meditatie Bibliotheek',
    description: 'Vind rust en helderheid met onze collectie geleide meditaties. Voor beginners en gevorderden.',
    icon: <FaLeaf className="w-8 h-8 text-[#8BAE5A] drop-shadow" />, // lotusbloem
    href: '/dashboard/mind-en-focus/meditaties',
    bg: '/images/mind/1.png',
  },
  {
    title: 'Ademhalingsoefeningen',
    description: 'Verlaag stress en verhoog je energie in enkele minuten met technieken als de Box Breathing en Wim Hof methode.',
    icon: <FaLungs className="w-8 h-8 text-[#8BAE5A] drop-shadow" />, // longen
    href: '/dashboard/mind-en-focus/ademhaling',
    bg: '/images/mind/2.png',
  },
  {
    title: 'Mijn Dankbaarheidsdagboek',
    description: 'Train je brein om het positieve te zien. Noteer dagelijks waar je dankbaar voor bent en verander je perspectief.',
    icon: <FaRegSmileBeam className="w-8 h-8 text-[#FFD700] drop-shadow" />, // hart/smile
    href: '/dashboard/mind-en-focus/dankbaarheid',
    bg: '/images/mind/3.png',
  },
  {
    title: 'Focus & Productiviteit',
    description: 'Leer technieken om afleiding te verslaan en diep werk te verrichten. Inclusief tools zoals de Pomodoro timer.',
    icon: <FaBrain className="w-8 h-8 text-[#8BAE5A] drop-shadow" />, // brein
    href: '/dashboard/mind-en-focus/focus',
    bg: '/images/mind/4.png',
  },
];

export default function MindFocus() {
  return (
    <ClientLayout>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">Mind & Focus</h1>
      <p className="text-[#8BAE5A] text-lg mb-8">Versterk je geest, verbeter je focus.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="relative group rounded-2xl overflow-hidden shadow-xl border border-[#3A4D23]/40 bg-[#232D1A]/80 flex flex-col min-h-[220px] cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#8BAE5A] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            {/* Achtergrondafbeelding */}
            <div className="absolute inset-0 z-0">
              <img src={card.bg} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#232D1A] to-transparent" />
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2">
                {card.icon}
                <span className="text-xl font-bold text-white drop-shadow">{card.title}</span>
              </div>
              <p className="text-[#8BAE5A] mb-4 text-sm font-medium drop-shadow max-w-xs">{card.description}</p>
              <span className="mt-auto inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all w-max">Openen</span>
            </div>
          </Link>
        ))}
      </div>
    </ClientLayout>
  );
} 