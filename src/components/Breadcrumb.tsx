'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      {/* Home icon */}
      <Link
        href="/dashboard"
        className="flex items-center text-[#8BAE5A] hover:text-[#B6C948] transition-colors"
        aria-label="Dashboard"
      >
        <HomeIcon className="w-4 h-4" />
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="w-4 h-4 text-[#3A4D23] mx-1" />
          
          {item.href && !item.isCurrent ? (
            <Link
              href={item.href}
              className="text-[#8BAE5A] hover:text-[#B6C948] transition-colors hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`${item.isCurrent ? 'text-white font-semibold' : 'text-[#8BAE5A]'}`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper function to create breadcrumbs for common page types
export function createBreadcrumbs(
  currentPage: string,
  parentPage?: string,
  parentHref?: string,
  grandParentPage?: string,
  grandParentHref?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  if (grandParentPage && grandParentHref) {
    items.push({ label: grandParentPage, href: grandParentHref });
  }

  if (parentPage && parentHref) {
    items.push({ label: parentPage, href: parentHref });
  }

  items.push({ label: currentPage, isCurrent: true });

  return items;
}

// Predefined breadcrumb configurations for common sections
export const BREADCRUMB_CONFIGS = {
  academy: {
    parent: 'Academy',
    parentHref: '/dashboard/academy',
  },
  academyModule: {
    grandParent: 'Academy',
    grandParentHref: '/dashboard/academy',
    parent: 'Module',
  },
  academyLesson: {
    grandParent: 'Academy',
    grandParentHref: '/dashboard/academy',
    parent: 'Module',
  },
  finance: {
    parent: 'Finance & Business',
    parentHref: '/dashboard/finance-en-business',
  },
  trainingsschemas: {
    parent: 'Trainingsschemas',
    parentHref: '/dashboard/trainingsschemas',
  },
  voedingsplannen: {
    parent: 'Voedingsplannen',
    parentHref: '/dashboard/voedingsplannen',
  },
  brotherhood: {
    parent: 'Brotherhood',
    parentHref: '/dashboard/brotherhood',
  },
  brotherhoodForum: {
    grandParent: 'Brotherhood',
    grandParentHref: '/dashboard/brotherhood',
    parent: 'Forum',
    parentHref: '/dashboard/brotherhood/forum',
  },
  brotherhoodLeden: {
    grandParent: 'Brotherhood',
    grandParentHref: '/dashboard/brotherhood',
    parent: 'Leden',
    parentHref: '/dashboard/brotherhood/leden',
  },
  boekenkamer: {
    parent: 'Boekenkamer',
    parentHref: '/dashboard/boekenkamer',
  },
  mijnChallenges: {
    // No parent - this is now a main page
  },
  mijnProfiel: {
    parent: 'Mijn Profiel',
    parentHref: '/dashboard/mijn-profiel',
  },
}; 