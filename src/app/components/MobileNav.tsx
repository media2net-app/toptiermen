"use client";
import Link from 'next/link';
import { HomeIcon, FireIcon, AcademicCapIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const mobileMenu = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Mijn Missies', href: '/dashboard/mijn-missies', icon: FireIcon },
  { label: 'Trainingscentrum', href: '/dashboard/trainingscentrum', icon: AcademicCapIcon },
  { label: 'Mijn Profiel', href: '/dashboard/mijn-profiel', icon: UserCircleIcon },
];

const fullMenu = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mijn Missies', href: '/dashboard/mijn-missies' },
  { label: 'Trainingscentrum', href: '/dashboard/trainingscentrum' },
  { label: 'Mind & Focus', href: '/dashboard/mind-en-focus' },
  { label: 'Finance & Business', href: '/dashboard/finance-en-business' },
  { label: 'Brotherhood', href: '/dashboard/brotherhood' },
  { label: 'Boekenkamer', href: '/dashboard/boekenkamer' },
  { label: 'Badges & Rangen', href: '/dashboard/badges-en-rangen' },
  { label: 'Mijn Profiel', href: '/dashboard/mijn-profiel' },
  { label: 'Mentorship & Coaching', href: '/dashboard/mentorship-en-coaching' },
];

export default function MobileNav() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#232D1A]/95 border-t border-[#3A4D23]/60 flex justify-between items-center px-2 py-1 shadow-2xl">
        {mobileMenu.map((item) => (
          <Link key={item.label} href={item.href} className="bottom-nav-btn flex flex-col items-center flex-1 py-2 text-[#8BAE5A] hover:text-white transition">
            <item.icon className="w-7 h-7 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          className="bottom-nav-btn flex flex-col items-center flex-1 py-2 text-[#8BAE5A] hover:text-white transition"
          onClick={() => setShowMobileMenu(true)}
          aria-label="Open menu"
        >
          <Bars3Icon className="w-7 h-7 mb-1" />
          <span className="text-xs font-medium">Menu</span>
        </button>
      </nav>
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-64 bg-[#181F17] h-full shadow-2xl flex flex-col p-6 transform transition-transform duration-300 ease-in-out translate-x-0">
            <button
              className="self-end mb-6 text-[#8BAE5A] text-2xl"
              onClick={() => setShowMobileMenu(false)}
              aria-label="Sluit menu"
            >
              ×
            </button>
            <nav className="flex flex-col gap-4">
              {fullMenu.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[#8BAE5A] hover:text-white text-lg font-medium py-2 px-2 rounded transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setShowMobileMenu(false)} />
        </div>
      )}
    </>
  );
} 