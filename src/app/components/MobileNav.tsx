"use client";
import Link from 'next/link';
import { HomeIcon, FireIcon, AcademicCapIcon, UserCircleIcon, Bars3Icon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const mobileMenu = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Academy', href: '/dashboard/academy', icon: FireIcon },
  { label: 'Trainingscentrum', href: '/dashboard/trainingscentrum', icon: AcademicCapIcon },
  { label: 'Mijn Profiel', href: '/dashboard/mijn-profiel', icon: UserCircleIcon },
];

const fullMenu = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mijn Missies', href: '/dashboard/mijn-missies' },
  { label: 'Mijn Challenges', href: '/dashboard/mijn-challenges' },
  { label: 'Trainingscentrum', href: '/dashboard/trainingscentrum' },
  { label: 'Mind & Focus', href: '/dashboard/mind-en-focus' },
  { label: 'Finance & Business', href: '/dashboard/finance-en-business' },
  {
    label: 'Brotherhood',
    href: '/dashboard/brotherhood',
    subItems: [
      { label: 'Dashboard', href: '/dashboard/brotherhood' },
      { label: 'Social Feed', href: '/dashboard/brotherhood/social-feed' },
      { label: 'Forum', href: '/dashboard/brotherhood/forum' },
      { label: 'Leden', href: '/dashboard/brotherhood/leden' },
      { label: 'Mijn Groepen & Evenementen', href: '/dashboard/brotherhood/mijn-groepen' },
    ],
  },
  { label: 'Boekenkamer', href: '/dashboard/boekenkamer' },
  { label: 'Badges & Rangen', href: '/dashboard/badges-en-rangen' },
  { label: 'Mijn Profiel', href: '/dashboard/mijn-profiel' },
  { label: 'Mentorship & Coaching', href: '/dashboard/mentorship-en-coaching' },
];

export default function MobileNav() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#232D1A]/95 border-t border-[#3A4D23]/60 flex justify-between items-center px-2 py-2 shadow-2xl backdrop-blur-lg">
        {mobileMenu.map((item) => (
          <Link 
            key={item.label} 
            href={item.href} 
            className="bottom-nav-btn flex flex-col items-center justify-center flex-1 py-2 px-1 text-[#8BAE5A] hover:text-white active:text-white transition-colors rounded-lg touch-manipulation"
          >
            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight">{item.label}</span>
          </Link>
        ))}
        <button
          className="bottom-nav-btn flex flex-col items-center justify-center flex-1 py-2 px-1 text-[#8BAE5A] hover:text-white active:text-white transition-colors rounded-lg touch-manipulation"
          onClick={() => setShowMobileMenu(true)}
          aria-label="Open menu"
        >
          <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
          <span className="text-[10px] sm:text-[11px] font-medium leading-tight">Menu</span>
        </button>
      </nav>
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 flex">
          <div 
            className="w-[85%] max-w-[400px] bg-[#181F17] h-full shadow-2xl flex flex-col p-4 transform transition-transform duration-300 ease-in-out translate-x-0 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Menu</h2>
              <button
                className="p-2 text-[#8BAE5A] hover:text-white rounded-full transition-colors"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Sluit menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {fullMenu.map((item) =>
                item.subItems ? (
                  <div key={item.label} className="mb-1">
                    <button
                      className="flex items-center justify-between w-full text-[#8BAE5A] hover:text-white active:bg-[#3A4D23]/20 text-lg font-medium py-3 px-4 rounded-xl transition-all touch-manipulation"
                      onClick={() => setOpenBrotherhood((v) => !v)}
                      aria-expanded={openBrotherhood}
                    >
                      <span>{item.label}</span>
                      {openBrotherhood ? <ChevronUpIcon className="w-5 h-5 transition-transform duration-200" /> : <ChevronDownIcon className="w-5 h-5 transition-transform duration-200" />}
                    </button>
                    <div
                      className={`pl-4 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${
                        openBrotherhood ? 'max-h-[400px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="text-[#8BAE5A] hover:text-white active:bg-[#3A4D23]/20 text-base font-normal py-3 px-4 rounded-xl transition-all touch-manipulation"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-[#8BAE5A] hover:text-white active:bg-[#3A4D23]/20 text-lg font-medium py-3 px-4 rounded-xl transition-all touch-manipulation"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
          <div 
            className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setShowMobileMenu(false)} 
          />
        </div>
      )}
    </>
  );
} 