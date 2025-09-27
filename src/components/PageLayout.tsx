"use client";
import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  actionButtons?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
};

const paddingClasses = {
  none: 'px-0 py-0',
  sm: 'px-4 sm:px-6 py-4',
  md: 'px-6 sm:px-8 py-6',
  lg: 'px-8 sm:px-12 py-8'
};

export default function PageLayout({ 
  title, 
  subtitle, 
  description,
  actionButtons, 
  children, 
  maxWidth = '7xl',
  padding = 'md'
}: PageLayoutProps) {
  return (
    <div className={`dashboard-content ${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]}`}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[#A3AED6] text-base sm:text-lg">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-[#B6C948] text-base sm:text-lg mt-1">
                {description}
              </p>
            )}
          </div>
          {actionButtons && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {actionButtons}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <main className="space-y-6 sm:space-y-8">
        {children}
      </main>
    </div>
  );
} 