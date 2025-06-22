'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  FireIcon, 
  BookOpenIcon, 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  Cog6ToothIcon, 
  MegaphoneIcon,
  ChevronDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const adminMenu = [
  { 
    label: 'Dashboard', 
    icon: HomeIcon, 
    href: '/dashboard-admin' 
  },
  { 
    label: 'ANALYTICS', 
    type: 'section',
    items: [
      { label: 'Community Health', icon: ChartBarIcon, href: '/dashboard-admin?tab=overview' },
      { label: 'Content Performance', icon: AcademicCapIcon, href: '/dashboard-admin?tab=content' },
      { label: 'Actiegerichte Inzichten', icon: StarIcon, href: '/dashboard-admin?tab=actions' },
      { label: 'Financiële Metrics', icon: CurrencyDollarIcon, href: '/dashboard-admin?tab=financial' },
      { label: 'Gebruikers Segmentatie', icon: UsersIcon, href: '/dashboard-admin?tab=users' },
      { label: 'Real-time Activiteit', icon: ClockIcon, href: '/dashboard-admin?tab=realtime' },
      { label: 'Technische Performance', icon: WrenchScrewdriverIcon, href: '/dashboard-admin?tab=technical' }
    ]
  },
  { 
    label: 'LEDEN', 
    type: 'section',
    items: [
      { label: 'Ledenbeheer', icon: UserGroupIcon, href: '/dashboard-admin/ledenbeheer' }
    ]
  },
  { 
    label: 'CONTENT', 
    type: 'section',
    items: [
      { label: 'Academy', icon: AcademicCapIcon, href: '/dashboard-admin/academy' },
      { label: 'Trainingscentrum', icon: FireIcon, href: '/dashboard-admin/trainingscentrum' },
      { label: 'Voedingsplannen', icon: BookOpenIcon, href: '/dashboard-admin/voedingsplannen' },
      { label: 'Boekenkamer', icon: BookOpenIcon, href: '/dashboard-admin/boekenkamer' },
      { label: 'Badges & Rangen', icon: StarIcon, href: '/dashboard-admin/badges-rangen' }
    ]
  },
  { 
    label: 'COMMUNITY', 
    type: 'section',
    items: [
      { label: 'Forum Moderatie', icon: ChatBubbleLeftRightIcon, href: '/dashboard-admin/forum-moderatie' },
      { label: 'Social Feed', icon: ChatBubbleLeftRightIcon, href: '/dashboard-admin/social-feed' },
      { label: 'Evenementenbeheer', icon: CalendarIcon, href: '/dashboard-admin/evenementenbeheer' },
      { label: 'Aankondigingen', icon: MegaphoneIcon, href: '/dashboard-admin/aankondigingen' }
    ]
  },
  { 
    label: 'PLATFORM', 
    type: 'section',
    items: [
      { label: 'Instellingen', icon: Cog6ToothIcon, href: '/dashboard-admin/instellingen' },
      { label: 'Aankondigingen', icon: MegaphoneIcon, href: '/dashboard-admin/aankondigingen' }
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ANALYTICS', 'LEDEN', 'CONTENT', 'COMMUNITY', 'PLATFORM']));

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionLabel)) {
        newSet.delete(sectionLabel);
      } else {
        newSet.add(sectionLabel);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-[#181F17]">
      {/* Top Navigation Bar */}
      <div className="bg-[#232D1A] border-b border-[#3A4D23] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-[#8BAE5A]">Admin Panel</h1>
            <span className="text-[#B6C948] text-sm">Top Tier Men Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#8BAE5A] text-sm">Admin</span>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-xl bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition"
            >
              Terug naar Platform
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-[#232D1A] border-r border-[#3A4D23] min-h-screen p-6">
          <nav className="space-y-6">
            {adminMenu.map((item) => {
              if (item.type === 'section') {
                const isExpanded = expandedSections.has(item.label);
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-[#8BAE5A] font-semibold hover:bg-[#181F17] transition-all duration-200"
                    >
                      <span>{item.label}</span>
                      <ChevronDownIcon 
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    {isExpanded && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href ?? '#'}
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                              pathname === subItem.href 
                                ? 'bg-[#8BAE5A] text-[#181F17] shadow-lg' 
                                : 'text-[#B6C948] hover:bg-[#181F17] hover:text-[#8BAE5A]'
                            }`}
                          >
                            {subItem.icon && <subItem.icon className="w-5 h-5" />}
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <Link
                    key={item.href as string}
                    href={item.href as string}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      pathname === item.href 
                        ? 'bg-[#8BAE5A] text-[#181F17] shadow-lg' 
                        : 'text-[#8BAE5A] hover:bg-[#181F17]'
                    }`}
                  >
                    {item.icon && <item.icon className="w-6 h-6" />}
                    <span>{item.label}</span>
                  </Link>
                );
              }
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12">
          {children}
        </main>
      </div>
    </div>
  );
} 