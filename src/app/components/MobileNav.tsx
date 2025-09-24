"use client";
import Link from 'next/link';
import { HomeIcon, FireIcon, AcademicCapIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';

const mobileMenu = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Academy', href: '/dashboard/academy', icon: FireIcon },
  { label: 'Trainingsschemas', href: '/dashboard/trainingsschemas', icon: AcademicCapIcon },
  { label: 'Mijn Profiel', href: '/dashboard/mijn-profiel', icon: UserCircleIcon },
];

interface MobileNavProps {
  onMenuClick?: () => void;
}

export default function MobileNav({ onMenuClick }: MobileNavProps) {
  const handleMenuClick = useCallback(() => {
    try {
      onMenuClick?.();
    } catch (error) {
      console.error('Error opening mobile menu:', error);
    }
  }, [onMenuClick]);
  return (
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
        onClick={handleMenuClick}
        aria-label="Open menu"
      >
        <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
        <span className="text-[10px] sm:text-[11px] font-medium leading-tight">Menu</span>
      </button>
    </nav>
  );
} 