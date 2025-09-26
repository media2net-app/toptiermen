"use client";
import Link from 'next/link';
import { HomeIcon, FireIcon, AcademicCapIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';

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
  // Sticky mobile footer is completely removed
  return null;
} 