'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserGroupIcon, ChartBarIcon, StarIcon, BookOpenIcon, ChatBubbleLeftRightIcon, AcademicCapIcon, CreditCardIcon, BellIcon, Cog6ToothIcon, InboxIcon, HomeIcon } from '@heroicons/react/24/solid';

const adminMenu = [
  { label: 'Dashboard', icon: HomeIcon, href: '/dashboard-admin' },
  { label: 'Gebruikersbeheer', icon: UserGroupIcon, href: '/dashboard-admin/gebruikersbeheer' },
  { label: 'Challenges & Badges', icon: StarIcon, href: '/dashboard-admin/challenges-badges' },
  { label: 'Contentbeheer', icon: BookOpenIcon, href: '/dashboard-admin/contentbeheer' },
  { label: 'Community Wall & Posts', icon: ChatBubbleLeftRightIcon, href: '/dashboard-admin/community' },
  { label: 'Coaching & Mentoring', icon: AcademicCapIcon, href: '/dashboard-admin/coaching' },
  { label: 'Abonnementen & betalingen', icon: CreditCardIcon, href: '/dashboard-admin/abonnementen' },
  { label: 'Notificatiebeheer', icon: BellIcon, href: '/dashboard-admin/notificaties' },
  { label: 'Systeeminstellingen', icon: Cog6ToothIcon, href: '/dashboard-admin/systeem' },
  { label: 'Feedback & support', icon: InboxIcon, href: '/dashboard-admin/support' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#111111]/95 border-r border-[#C49C48]/60 shadow-2xl z-20 py-8 px-4">
        <div className="mb-10 flex items-center gap-3 px-2">
          <span className="text-2xl font-bold text-[#C49C48] tracking-tight">Admin Panel</span>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {adminMenu.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#C49C48] hover:bg-[#181818] transition-all duration-150 ${pathname === item.href ? 'bg-gradient-to-r from-[#C49C48] to-[#B8860B] text-black shadow-lg' : ''}`}
            >
              <item.icon className="w-6 h-6 text-[#C49C48]" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content section */}
      <section className="flex-1 p-8 md:p-12 bg-[#111111]">{children}</section>
    </div>
  );
} 