'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
// import { useV2Monitoring } from '@/lib/v2-monitoring';
// import { useV2ErrorRecovery } from '@/lib/v2-error-recovery';
// import { useV2Cache } from '@/lib/v2-cache-strategy';
import { useOnboardingV2 } from '@/contexts/OnboardingV2Context';
import { useDebug } from '@/contexts/DebugContext';
import { useTestUser } from '@/hooks/useTestUser';
import { useSubscription } from '@/hooks/useSubscription';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, 
  UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, 
  ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, BellIcon, 
  EnvelopeIcon, CheckCircleIcon, UserGroupIcon, TrophyIcon, 
  CalendarDaysIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/solid';
import DebugPanel from '@/components/DebugPanel';
import OnboardingV2Modal from '@/components/OnboardingV2Modal';
import TestUserVideoModal from '@/components/TestUserVideoModal';
import TestUserFeedback from '@/components/TestUserFeedback';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import V2MonitoringDashboard from '@/components/V2MonitoringDashboard';
import V2PerformanceAlerts from '@/components/V2PerformanceAlerts';
import CacheIssueHelper from '@/components/CacheIssueHelper';
import NotificationBell from '@/components/NotificationBell';
import InboxIcon from '@/components/InboxIcon';
import SupportButton from '@/components/SupportButton';

// Subscription Tier Display Component
const SubscriptionTier = () => {
  const { subscription, loading, error } = useSubscription();
  
  console.log('🔍 SubscriptionTier render:', { subscription, loading, error });
  
  if (loading) return <span className="text-gray-400 text-xs">Loading...</span>;
  if (error) return <span className="text-red-400 text-xs">Error</span>;
  
  const tier = subscription?.subscription_tier || 'basic';
  let displayTier = 'Basic Tier';
  let colorClass = 'text-gray-400';
  
  if (tier === 'premium') {
    displayTier = 'Premium Tier';
    colorClass = 'text-[#B6C948]';
  } else if (tier === 'lifetime') {
    displayTier = 'Lifetime Tier';
    colorClass = 'text-[#FFD700]';
  } else {
    displayTier = 'Basic Tier';
    colorClass = 'text-gray-400';
  }
  
  return (
    <p className={`${colorClass} text-xs font-medium`}>
      {displayTier}
    </p>
  );
};

// 2.0.1: Dashboard menu configuration
const menu = [
  { label: 'Onboarding', icon: CheckCircleIcon, href: null, onboardingStep: 0, isOnboardingItem: true, isDynamic: true },
  { label: 'Dashboard', icon: HomeIcon, href: '/dashboard', onboardingStep: 0 },
  { label: 'Mijn Profiel', icon: UserCircleIcon, parent: 'Dashboard', href: '/dashboard/mijn-profiel', isSub: true, onboardingStep: 0 },
  { label: 'Notificaties', icon: BellIcon, parent: 'Dashboard', href: '/dashboard/notificaties', isSub: true, onboardingStep: 0 },
  { label: 'Mijn Trainingen', icon: AcademicCapIcon, parent: 'Dashboard', href: '/dashboard/mijn-trainingen', isSub: true, onboardingStep: 0 },
  { label: 'Finance & Business', icon: CurrencyDollarIcon, href: '/dashboard/finance-en-business', onboardingStep: 7 },
  { label: 'Academy', icon: FireIcon, href: '/dashboard/academy', onboardingStep: 7 },
  { label: 'Challenges', icon: FireIcon, href: '/dashboard/mijn-challenges', onboardingStep: 2 },
  { label: 'Trainingsschemas', icon: AcademicCapIcon, href: '/dashboard/trainingsschemas', onboardingStep: 3 },
  { label: 'Voedingsplannen', icon: RocketLaunchIcon, href: '/dashboard/voedingsplannen-v2', onboardingStep: 4 },
  { label: 'Mind & Focus (binnenkort online)', icon: ChartBarIcon, href: null, onboardingStep: 7, disabled: true },
  { label: 'Brotherhood', icon: UsersIcon, href: '/dashboard/brotherhood', onboardingStep: 7 },
  { label: 'Social Feed', icon: ChatBubbleLeftRightIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/social-feed', isSub: true, onboardingStep: 7 },
  { label: 'Forum', icon: FireIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/forum', isSub: true, onboardingStep: 6 },
  { label: 'Leden', icon: UsersIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/leden', isSub: true, onboardingStep: 7 },
  { label: 'Boekenkamer (binnenkort online)', icon: BookOpenIcon, href: null, onboardingStep: 7, disabled: true },
  { label: 'Badges & Rangen', icon: StarIcon, href: '/dashboard/badges-en-rangen', onboardingStep: 7 },
  { label: 'Producten', icon: ShoppingBagIcon, href: '/dashboard/producten', onboardingStep: 7 },
  { label: 'Mentorship & Coaching', icon: ChatBubbleLeftRightIcon, href: '/dashboard/mentorship-en-coaching', onboardingStep: 7 },
];

// 2.0.1: Sidebar component with enhanced monitoring
// Mobile-specific sidebar content with working submenu functionality
const MobileSidebarContent = ({ onLinkClick, onboardingStatus }: { 
  onLinkClick?: () => void, 
  onboardingStatus?: any 
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openBrotherhood, setOpenBrotherhood] = useState(true); // Default expanded
  const [openDashboard, setOpenDashboard] = useState(true); // Default expanded
  const [showOnboardingCompletion, setShowOnboardingCompletion] = useState(false);
  const { isCompleted, currentStep } = useOnboardingV2();
  
  // Use onboardingStatus from props if available, otherwise fallback to context
  const actualOnboardingStatus = onboardingStatus || { current_step: currentStep, onboarding_completed: isCompleted };
  const { user, isAdmin } = useSupabaseAuth();
  const { hasAccess } = useSubscription();
  
  const safePathname = pathname || '';
  
  // Use currentStep from actualOnboardingStatus if available, otherwise fallback to useOnboarding hook
  const actualCurrentStep = actualOnboardingStatus?.current_step ?? currentStep;

  // Handle onboarding completion animation
  useEffect(() => {
    if (actualOnboardingStatus?.onboarding_completed && !showOnboardingCompletion) {
      setShowOnboardingCompletion(true);
      
      // Hide onboarding item after 5 seconds
      setTimeout(() => {
        setShowOnboardingCompletion(false);
      }, 5000);
    }
  }, [actualOnboardingStatus?.onboarding_completed, showOnboardingCompletion]);

  // Function to check if a menu item should be visible based on subscription tier and admin status
  const isMenuItemVisible = (item: any) => {
    // Check admin-only items first - specifically allow chiel@media2net.nl
    if (item.adminOnly && user?.email !== 'chiel@media2net.nl') {
      return false;
    }
    
    // Show nutrition and training items to all users, but they'll see upgrade screen if Basic Tier
    // This allows Basic Tier users to see the menu items and click them to see upgrade options
    
    // All other items are visible by default
    return true;
  };

  // Function to check if a menu item should be disabled during onboarding
  const isMenuItemDisabled = (item: any) => {
    // Check if item is explicitly disabled (e.g., "binnenkort online")
    if (item.disabled) return true;
    
    // If onboarding is completed, no items should be disabled (except explicitly disabled ones)
    if (actualOnboardingStatus?.onboarding_completed) return false;
    
    if (isCompleted || !actualOnboardingStatus) return false;
    
    // During onboarding V2, block ALL navigation except the current step
    if (actualCurrentStep !== null && actualCurrentStep !== undefined) {
      // Only allow access to the current onboarding step
      const isCurrentStep = item.onboardingStep === actualCurrentStep;
      
      // Force console log to be visible
      if (typeof window !== 'undefined') {
        console.log(`🔍 [MOBILE NAV BLOCK] ${item.label}: currentStep=${actualCurrentStep}, requiredStep=${item.onboardingStep}, isCurrentStep=${isCurrentStep}, disabled=${!isCurrentStep}`);
      }
      
      // Block all items except the current step
      return !isCurrentStep;
    }
    
    return false;
  };

  // Function to handle link clicks with onboarding blocking
  const handleMobileLinkClick = (href: string, label: string, e?: React.MouseEvent) => {
    // During onboarding V2, block navigation to other pages
    if (actualCurrentStep !== null && actualCurrentStep !== undefined && !actualOnboardingStatus?.onboarding_completed) {
      // Find the menu item to check if it should be disabled
      const menuItem = menu.find(item => item.href === href);
      if (menuItem && isMenuItemDisabled(menuItem)) {
        // Block navigation by preventing default
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Show a message to the user
        if (typeof window !== 'undefined') {
          console.log(`🚫 Mobile navigation blocked during onboarding: ${label}`);
        }
        
        return;
      }
    }
    
    // Close mobile menu if it's open
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // Auto-open submenu if current page is a submenu item
  useEffect(() => {
    const currentItem = menu.find(item => item.href === safePathname);
    if (currentItem?.parent === 'Dashboard') {
      setOpenDashboard(true);
    } else if (currentItem?.parent === 'Brotherhood') {
      setOpenBrotherhood(true);
    }
    
    // Auto-open Brotherhood submenu during onboarding step 6 (forum introduction)
    if (!isCompleted && actualCurrentStep === 6) {
      setOpenBrotherhood(true);
    }
  }, [safePathname, isCompleted, actualCurrentStep]);

  return (
    <nav className="flex flex-col gap-2">
      {/* Mijn Dashboard Button */}
      <Link
        href="/dashboard"
        onClick={(e) => handleMobileLinkClick('/dashboard', 'Dashboard', e)}
        className="flex items-center gap-3 px-4 py-3 bg-[#8BAE5A] text-black font-bold rounded-xl hover:bg-[#7A9D4A] transition-colors mb-4"
      >
        <HomeIcon className="w-5 h-5" />
        <span>Mijn Dashboard</span>
      </Link>
      
      {menu.map((item) => {
        // Skip onboarding menu item if onboarding is completed and animation is done, or user is not in onboarding mode
        if (item.isOnboardingItem && (actualOnboardingStatus?.onboarding_completed && !showOnboardingCompletion || isCompleted)) {
          return null;
        }
        
        // Skip menu items that are not visible based on subscription tier
        if (!isMenuItemVisible(item)) {
          return null;
        }
        
        if (!item.parent) {
          // During onboarding, only the current step should be active
          const isActive = !isCompleted 
            ? (safePathname === item.href && item.onboardingStep === actualCurrentStep)
            : safePathname === item.href;
          const hasSubmenu = menu.some(sub => sub.parent === item.label);

          if (hasSubmenu) {
            const isOpen = item.label === 'Dashboard' ? openDashboard : openBrotherhood;
            const setIsOpen = item.label === 'Dashboard' ? setOpenDashboard : setOpenBrotherhood;
            const subItems = menu.filter(sub => sub.parent === item.label);
            const hasActiveSubItem = subItems.some(sub => 
              !isCompleted 
                ? (sub.href === safePathname && sub.onboardingStep === actualCurrentStep)
                : sub.href === safePathname
            );
            const allSubItemsDisabled = subItems.every(sub => isMenuItemDisabled(sub));
            
            return (
              <div key={item.label} className="group">
                <button
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${
                    allSubItemsDisabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : isActive || hasActiveSubItem 
                        ? 'bg-[#8BAE5A] text-black shadow-lg' 
                        : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!allSubItemsDisabled) {
                      setIsOpen(v => !v);
                    }
                  }}
                  disabled={allSubItemsDisabled}
                  title={allSubItemsDisabled ? (subItems.some(sub => sub.disabled) ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding") : undefined}
                >
                  <item.icon className={`w-6 h-6 ${allSubItemsDisabled ? 'text-gray-500' : isActive || hasActiveSubItem ? 'text-white' : 'text-[#8BAE5A]'}`} />
                  <span className="truncate col-start-2">{item.label}</span>
                  <ChevronDownIcon 
                    className={`w-4 h-4 transition-transform duration-200 ${allSubItemsDisabled ? 'text-gray-500' : ''} ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      className="ml-4 mt-2 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {subItems.map(sub => {
                        const isSubActive = !isCompleted 
                          ? (safePathname === sub.href && sub.onboardingStep === actualCurrentStep)
                          : safePathname === sub.href;
                        const isHighlighted = false; // highlightedMenu not available in V2
                        const isDisabled = isMenuItemDisabled(sub);
                        
                        if (isDisabled) {
                          return (
                            <div
                              key={sub.label}
                              className="block px-4 py-2 rounded-lg text-sm text-gray-500 cursor-not-allowed opacity-50"
                              title={sub.disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
                            >
                              {sub.label}
                            </div>
                          );
                        }
                        
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href || '#'}
                            onClick={sub.disabled ? (e) => e.preventDefault() : onLinkClick}
                            title={sub.disabled ? "Binnenkort online" : undefined}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                              sub.disabled
                                ? 'text-gray-500 cursor-not-allowed opacity-50'
                                : isSubActive 
                                ? 'bg-[#8BAE5A] text-black font-semibold' 
                                : isHighlighted
                                ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
                                : 'text-gray-300 hover:text-[#8BAE5A] hover:bg-[#8BAE5A]/10'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const isHighlighted = false; // highlightedMenu not available in V2
          const isDisabled = isMenuItemDisabled(item);
          const isOnboardingItem = item.isOnboardingItem;
          
          // Only the onboarding menu item should be yellow during onboarding, green when completed
          const shouldBeYellow = isOnboardingItem && !isCompleted && !actualOnboardingStatus?.onboarding_completed;
          const shouldBeGreen = isOnboardingItem && actualOnboardingStatus?.onboarding_completed && showOnboardingCompletion;
          
          // Special case: Onboarding menu item should always be yellow during onboarding, never disabled
          if (isDisabled && !isOnboardingItem) {
            return (
              <div
                key={item.label}
                className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide font-figtree text-gray-500 cursor-not-allowed opacity-50`}
                title={item.disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
              >
                <item.icon className="w-6 h-6 text-gray-500" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.label}
              href={item.disabled ? '#' : (item.isDynamic && item.isOnboardingItem && !isCompleted ? 
                (actualCurrentStep === 0 ? '/dashboard/welcome-video-v2' :
                 actualCurrentStep === 1 ? '/dashboard/profiel' :
                 actualCurrentStep === 2 ? '/dashboard/mijn-challenges' :
                 actualCurrentStep === 3 ? '/dashboard/trainingsschemas' :
                 actualCurrentStep === 4 ? '/dashboard/voedingsplannen-v2' :
                 actualCurrentStep === 5 ? '/dashboard/challenges' :
                 actualCurrentStep === 6 ? '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden' :
                 '/dashboard/welcome-video') : (item.href || '#'))}
              onClick={item.disabled ? (e) => e.preventDefault() : (e) => handleMobileLinkClick(item.href || '#', item.label, e)}
              title={item.disabled ? "Binnenkort online" : undefined}
              className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-500 font-figtree ${
                item.disabled
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : isActive
                  ? 'bg-[#8BAE5A] text-black shadow-lg'
                  : shouldBeYellow
                    ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 shadow-lg'
                    : shouldBeGreen
                      ? 'bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/30 shadow-lg animate-pulse'
                      : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
              }`}
            >
              <item.icon className={`w-6 h-6 ${item.disabled ? 'text-gray-500' : isActive ? 'text-white' : shouldBeYellow ? 'text-[#FFD700]' : shouldBeGreen ? 'text-[#8BAE5A]' : 'text-[#8BAE5A]'}`} />
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          );
        }
        
        return null;
      })}
    </nav>
  );
};

const SidebarContent = ({ collapsed, onLinkClick, onboardingStatus }: { 
  collapsed: boolean, 
  onLinkClick?: () => void, 
  onboardingStatus?: any 
}) => {
  const pathname = usePathname();
  const [openBrotherhood, setOpenBrotherhood] = useState(false);
  const [openDashboard, setOpenDashboard] = useState(false);
  const [showOnboardingCompletion, setShowOnboardingCompletion] = useState(false);
  const { isCompleted, currentStep } = useOnboardingV2();
  
  // Use onboardingStatus from props if available, otherwise fallback to context
  const actualOnboardingStatus = onboardingStatus || { current_step: currentStep, onboarding_completed: isCompleted };
  // const { trackFeatureUsage } = useV2Monitoring();
  const { user, isAdmin } = useSupabaseAuth();
  const { hasAccess } = useSubscription();
  
  const safePathname = pathname || '';
  
  // Use currentStep from actualOnboardingStatus if available, otherwise fallback to useOnboarding hook
  const actualCurrentStep = actualOnboardingStatus?.current_step ?? currentStep;

  // Handle onboarding completion animation
  useEffect(() => {
    if (actualOnboardingStatus?.onboarding_completed && !showOnboardingCompletion) {
      setShowOnboardingCompletion(true);
      
      // Hide onboarding item after 5 seconds
      setTimeout(() => {
        setShowOnboardingCompletion(false);
      }, 5000);
    }
  }, [actualOnboardingStatus?.onboarding_completed, showOnboardingCompletion]);

  // Function to check if a menu item should be visible based on subscription tier and admin status
  const isMenuItemVisible = (item: any) => {
    // Check admin-only items first - specifically allow chiel@media2net.nl
    if (item.adminOnly && user?.email !== 'chiel@media2net.nl') {
      return false;
    }
    
    // Show nutrition and training items to all users, but they'll see upgrade screen if Basic Tier
    // This allows Basic Tier users to see the menu items and click them to see upgrade options
    
    // All other items are visible by default
    return true;
  };

  // Function to check if a menu item should be disabled during onboarding
  const isMenuItemDisabled = (item: any) => {
    // Check if item is explicitly disabled (e.g., "binnenkort online")
    if (item.disabled) return true;
    
    // If onboarding is completed, no items should be disabled (except explicitly disabled ones)
    if (actualOnboardingStatus?.onboarding_completed) return false;
    
    if (isCompleted || !actualOnboardingStatus) return false;
    
    // During onboarding V2, block ALL navigation except the current step
    if (actualCurrentStep !== null && actualCurrentStep !== undefined) {
      // Only allow access to the current onboarding step
      const isCurrentStep = item.onboardingStep === actualCurrentStep;
      
      // Force console log to be visible
      if (typeof window !== 'undefined') {
        console.log(`🔍 [NAV BLOCK] ${item.label}: currentStep=${actualCurrentStep}, requiredStep=${item.onboardingStep}, isCurrentStep=${isCurrentStep}, disabled=${!isCurrentStep}`);
      }
      
      // Block all items except the current step
      return !isCurrentStep;
    }
    
    return false;
  };

  const handleLinkClick = (href: string, label: string, e?: React.MouseEvent) => {
    // During onboarding V2, block navigation to other pages
    if (actualCurrentStep !== null && actualCurrentStep !== undefined && !actualOnboardingStatus?.onboarding_completed) {
      // Find the menu item to check if it should be disabled
      const menuItem = menu.find(item => item.href === href);
      if (menuItem && isMenuItemDisabled(menuItem)) {
        // Block navigation by preventing default
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Show a message to the user
        if (typeof window !== 'undefined') {
          console.log(`🚫 Navigation blocked during onboarding: ${label}`);
        }
        
        return;
      }
    }
    
    // Close mobile menu if it's open (but don't block navigation)
    if (onLinkClick) {
      onLinkClick();
    }
    
    // 2.0.1: Track navigation (disabled in development to prevent errors)
    // if (process.env.NODE_ENV === 'production') {
    //   trackFeatureUsage(`nav-${label.toLowerCase().replace(/\s+/g, '-')}`, user?.id);
    // }
  };

  // Auto-open submenu if current page is a submenu item
  useEffect(() => {
    const currentItem = menu.find(item => item.href === safePathname);
    if (currentItem?.parent === 'Dashboard') {
      setOpenDashboard(true);
    } else if (currentItem?.parent === 'Brotherhood') {
      setOpenBrotherhood(true);
    }
    
    // Auto-open Brotherhood submenu during onboarding step 6 (forum introduction)
    if (!isCompleted && actualCurrentStep === 6) {
      setOpenBrotherhood(true);
    }
  }, [safePathname, isCompleted, actualCurrentStep]);

  return (
    <nav className="flex flex-col gap-2">
      {menu.map((item) => {
        // Skip onboarding menu item if onboarding is completed and animation is done, or user is not in onboarding mode
        if (item.isOnboardingItem && (actualOnboardingStatus?.onboarding_completed && !showOnboardingCompletion || isCompleted)) {
          return null;
        }
        
        // Skip menu items that are not visible based on subscription tier
        if (!isMenuItemVisible(item)) {
          return null;
        }
        
        if (!item.parent) {
          // During onboarding, only the current step should be active
          const isActive = !isCompleted 
            ? (safePathname === item.href && item.onboardingStep === actualCurrentStep)
            : safePathname === item.href;
          const hasSubmenu = menu.some(sub => sub.parent === item.label);

          if (hasSubmenu) {
            const isOpen = item.label === 'Dashboard' ? openDashboard : openBrotherhood;
            const setIsOpen = item.label === 'Dashboard' ? setOpenDashboard : setOpenBrotherhood;
            const subItems = menu.filter(sub => sub.parent === item.label);
            const hasActiveSubItem = subItems.some(sub => 
              !isCompleted 
                ? (sub.href === safePathname && sub.onboardingStep === actualCurrentStep)
                : sub.href === safePathname
            );
            const allSubItemsDisabled = subItems.every(sub => isMenuItemDisabled(sub));
            
            return (
              <div key={item.label} className="group">
                <button
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-150 font-figtree w-full text-left ${
                    allSubItemsDisabled
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : isActive || hasActiveSubItem 
                        ? 'bg-[#8BAE5A] text-black shadow-lg' 
                        : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  onClick={(e) => {
                    // Only prevent default for submenu toggles, not for navigation
                    if (!collapsed && !allSubItemsDisabled) {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(v => !v);
                    }
                  }}
                  disabled={allSubItemsDisabled}
                  title={allSubItemsDisabled ? (subItems.some(sub => sub.disabled) ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding") : undefined}
                >
                  <item.icon className={`w-6 h-6 ${allSubItemsDisabled ? 'text-gray-500' : isActive || hasActiveSubItem ? 'text-white' : 'text-[#8BAE5A]'}`} />
                  {!collapsed && (
                    <span className="truncate col-start-2">{item.label}</span>
                  )}
                  {!collapsed && (
                    <ChevronDownIcon 
                      className={`w-4 h-4 transition-transform duration-200 ${allSubItemsDisabled ? 'text-gray-500' : ''} ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && !collapsed && (
                    <motion.div 
                      className="ml-4 mt-2 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {subItems.map(sub => {
                        const isSubActive = !isCompleted 
                          ? (safePathname === sub.href && sub.onboardingStep === actualCurrentStep)
                          : safePathname === sub.href;
                        const isHighlighted = false; // highlightedMenu not available in V2
                        const isDisabled = isMenuItemDisabled(sub);
                        
                        if (isDisabled) {
                          return (
                            <div
                              key={sub.label}
                              className="block px-4 py-2 rounded-lg text-sm text-gray-500 cursor-not-allowed opacity-50"
                              title={sub.disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
                            >
                              {sub.label}
                            </div>
                          );
                        }
                        
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href || '#'}
                            onClick={sub.disabled ? (e) => e.preventDefault() : onLinkClick}
                            title={sub.disabled ? "Binnenkort online" : undefined}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                              sub.disabled
                                ? 'text-gray-500 cursor-not-allowed opacity-50'
                                : isSubActive 
                                ? 'bg-[#8BAE5A] text-black font-semibold' 
                                : isHighlighted
                                ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
                                : 'text-gray-300 hover:text-[#8BAE5A] hover:bg-[#8BAE5A]/10'
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const isHighlighted = false; // highlightedMenu not available in V2
          const isDisabled = isMenuItemDisabled(item);
          const isOnboardingItem = item.isOnboardingItem;
          
          // Only the onboarding menu item should be yellow during onboarding, green when completed
          const shouldBeYellow = isOnboardingItem && !isCompleted && !actualOnboardingStatus?.onboarding_completed;
          const shouldBeGreen = isOnboardingItem && actualOnboardingStatus?.onboarding_completed && showOnboardingCompletion;
          
          // Special case: Onboarding menu item should always be yellow during onboarding, never disabled
          if (isDisabled && !isOnboardingItem) {
            return (
              <div
                key={item.label}
                className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide font-figtree text-gray-500 cursor-not-allowed opacity-50 ${collapsed ? 'justify-center px-2' : ''}`}
                title={item.disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
              >
                <item.icon className="w-6 h-6 text-gray-500" />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{item.label}</span>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <motion.div
              key={item.label}
              initial={false}
              animate={{ 
                opacity: shouldBeGreen ? [1, 1, 0] : 1,
                scale: shouldBeGreen ? [1, 1.05, 0.95] : 1
              }}
              transition={{ 
                duration: shouldBeGreen ? 5 : 0,
                times: shouldBeGreen ? [0, 0.8, 1] : [0]
              }}
            >
              <Link
                href={item.disabled ? '#' : (item.isDynamic && item.isOnboardingItem && !isCompleted ? 
                  (actualCurrentStep === 0 ? '/dashboard/welcome-video-v2' :
                   actualCurrentStep === 1 ? '/dashboard/profiel' :
                   actualCurrentStep === 2 ? '/dashboard/mijn-challenges' :
                   actualCurrentStep === 3 ? '/dashboard/trainingsschemas' :
                   actualCurrentStep === 4 ? '/dashboard/voedingsplannen-v2' :
                   actualCurrentStep === 5 ? '/dashboard/challenges' :
                   actualCurrentStep === 6 ? '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden' :
                   '/dashboard/welcome-video') : (item.href || '#'))}
                onClick={item.disabled ? (e) => e.preventDefault() : onLinkClick}
                title={item.disabled ? "Binnenkort online" : undefined}
                className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-500 font-figtree ${
                  item.disabled
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : isActive 
                    ? 'bg-[#8BAE5A] text-black shadow-lg' 
                    : shouldBeYellow
                      ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 shadow-lg'
                      : shouldBeGreen
                        ? 'bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/30 shadow-lg animate-pulse'
                        : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
              <item.icon className={`w-6 h-6 ${item.disabled ? 'text-gray-500' : isActive ? 'text-white' : shouldBeYellow ? 'text-[#FFD700]' : shouldBeGreen ? 'text-[#8BAE5A]' : 'text-[#8BAE5A]'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{item.label}</span>
                </div>
              )}
            </Link>
            </motion.div>
          );
        }
        return null;
      })}
    </nav>
  );
};

// 2.0.1: Main dashboard content component
function DashboardContentInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, logoutAndRedirect } = useSupabaseAuth();
  const { showDebug, toggleDebug } = useDebug();
  // const { isCompleted, isLoading: onboardingLoading } = useOnboardingV2();
  const isCompleted = false;
  const onboardingLoading = false;
  const isTestUser = useTestUser();
  // const { addNotification, setLoadingState } = useV2State();
  // const { trackFeatureUsage } = useV2Monitoring();
  // const { handleError } = useV2ErrorRecovery();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null);
  const [showForcedOnboarding, setShowForcedOnboarding] = useState(false);
  const [showTestUserVideo, setShowTestUserVideo] = useState(false);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false); // DISABLED TO FIX FLICKERING

  // 2.0.1: Cache busting for existing users
  useEffect(() => {
    // Check if this is an existing user with potential cache issues
    const lastVersion = localStorage.getItem('ttm-app-version');
    const currentVersion = '3.0.0'; // Increment this when making breaking changes
    
    if (lastVersion && lastVersion !== currentVersion) {
      console.log('🔄 Cache busting: Version mismatch detected');
      console.log(`   - Previous version: ${lastVersion}`);
      console.log(`   - Current version: ${currentVersion}`);
      
      // Clear all cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Force a hard refresh to clear all caches
      window.location.reload();
      return;
    }
    
    // Store current version
    localStorage.setItem('ttm-app-version', currentVersion);
    
    // Additional cache busting for specific issues
    const cacheBustKey = localStorage.getItem('ttm-cache-bust');
    if (!cacheBustKey) {
      console.log('🔄 Cache busting: First time user or cache reset');
      localStorage.setItem('ttm-cache-bust', Date.now().toString());
      
      // Clear any potentially problematic cached data
      if (typeof window !== 'undefined') {
        // Clear service worker cache if exists
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }
        
        // Clear fetch cache
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
      }
    }
  }, []);

  // 2.0.1: Enhanced onboarding status check with error recovery - DISABLED
  const checkOnboardingStatus = useCallback(async () => {
    if (!user) return;

    try {
      // setLoadingState('onboarding-check', true);
      
      const response = await fetch(`/api/onboarding-v2?email=${user.email}&t=${Date.now()}&v=2.0.1`, {
        cache: 'no-cache', // Prevent caching of onboarding status
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Transform Onboarding V2 API response to match expected format
        const transformedData = {
          onboarding_completed: data.onboarding.isCompleted,
          current_step: data.onboarding.currentStep,
          user_id: user.id,
          ...data.onboarding.status // Include the full status object if available
        };
        setOnboardingStatus(transformedData);
        // trackFeatureUsage('onboarding-status-check', user.id);
      } else {
        throw new Error('Failed to fetch onboarding status');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // handleError(
      //   async () => {
      //     console.error('Error checking onboarding status:', error);
      //     addNotification({
      //       type: 'error',
      //       message: 'Kon onboarding status niet laden',
      //       read: false
      //     });
      //   },
      //   'Onboarding status check failed',
      //   'network',
      //   undefined,
      //   'onboarding-check'
      // );
    } finally {
      // setLoadingState('onboarding-check', false);
      // setIsLoading(false); // DISABLED TO FIX FLICKERING
    }
  }, [user?.id]);

  // Check onboarding status on mount
  useEffect(() => {
    if (user && !isLoadingLocal) {
      checkOnboardingStatus();
    }
  }, [user?.id, checkOnboardingStatus]);

  // Show forced onboarding if user hasn't completed onboarding
  useEffect(() => {
    if (onboardingStatus && !onboardingStatus.onboarding_completed) {
      // Check if user is a test user (email contains @toptiermen.test)
      const isTestUser = user?.email?.includes('@toptiermen.test') || false;
      
      if (isTestUser && !onboardingStatus.welcome_video_watched) {
        // Show test video first for test users who haven't watched the welcome video
        setShowTestUserVideo(true);
        setShowForcedOnboarding(false);
      } else if (onboardingStatus.current_step <= 2 && !onboardingStatus.step_2_completed) {
        // Show normal onboarding if step 2 (challenges) is not completed yet
        setShowForcedOnboarding(true);
        setShowTestUserVideo(false);
      } else {
        setShowForcedOnboarding(false);
        setShowTestUserVideo(false);
      }
    } else if (onboardingStatus?.onboarding_completed) {
      setShowForcedOnboarding(false);
      setShowTestUserVideo(false);
    }
  }, [onboardingStatus, profile?.role]);

  // Enhanced logout using the new logoutAndRedirect function
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double click
    
    try {
      console.log('🚪 Dashboard: Logout initiated...');
      setIsLoggingOut(true);
      
      // Show loading state
      const logoutButton = document.querySelector('[data-logout-button]');
      if (logoutButton) {
        logoutButton.setAttribute('disabled', 'true');
      }
      
      // Use the enhanced logoutAndRedirect function
      await logoutAndRedirect('/login');
      
    } catch (error) {
      console.error('❌ Dashboard: Logout error:', error);
      
      // Emergency fallback - force redirect
      if (typeof window !== 'undefined') {
        window.location.href = `/login?logout=error&t=${Date.now()}`;
      }
    } finally {
      // Note: setIsLoggingOut(false) is not needed here since we're redirecting
      // The component will be unmounted during redirect
    }
  };

  // Mobile menu handlers
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <style jsx>{`
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: #181F17;
          border-radius: 4px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: #3A4D23;
          border-radius: 4px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4A5D33;
        }
        .sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3A4D23 #181F17;
        }
        
        @media (max-width: 1024px) {
          .sidebar-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb {
            background: #8BAE5A;
          }
          .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #B6C948;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-[#0A0F0A] flex" suppressHydrationWarning>
        {/* Sidebar */}
        <div className={`bg-[#232D1A] border-r border-[#3A4D23] transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64 lg:w-72'
        } hidden lg:flex flex-col fixed h-full z-40`}>
          {/* Logo */}
          <div className="p-4 border-b border-[#3A4D23] flex-shrink-0">
            <Link href="/dashboard" className="flex items-center justify-center">
              <Image
                src="/logo_white-full.svg"
                alt="Top Tier Men Logo"
                width={sidebarCollapsed ? 40 : 240}
                height={40}
                className={`${sidebarCollapsed ? 'w-10 h-10' : 'w-full h-10'} object-contain hover:opacity-80 transition-opacity`}
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
            <div className="p-4">
              <SidebarContent 
                collapsed={sidebarCollapsed} 
                onboardingStatus={onboardingStatus}
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-[#3A4D23] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#8BAE5A] rounded-full flex items-center justify-center">
                <span className="text-[#0A0F0A] font-bold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[#8BAE5A] text-xs">
                      {(() => {
                        const metadataRole = ((user as any)?.user_metadata?.role as string | undefined) || undefined;
                        const effectiveRole = (profile?.role || metadataRole || '').toLowerCase();
                        
                        if (effectiveRole === 'admin') return 'Admin';
                        if (effectiveRole === 'test') return 'Test';
                        if (user?.email?.toLowerCase().includes('test')) return 'Test';
                        return 'Lid';
                      })()} 
                    </p>
                    <span className="text-gray-400 text-xs">•</span>
                    <SubscriptionTier />
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug Toggle for Test Users */}
            {(isTestUser || isAdmin || user?.email?.toLowerCase().includes('test')) && (
              <div className="mt-3 pt-3 border-t border-[#3A4D23]">
                <button
                  onClick={toggleDebug}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    showDebug 
                      ? 'bg-[#8BAE5A] text-black' 
                      : 'bg-[#3A4D23] text-[#8BAE5A] hover:bg-[#4A5D33]'
                  }`}
                >
                  {!sidebarCollapsed ? 'Debug Mode' : 'D'}
                  {showDebug && !sidebarCollapsed && ' ✓'}
                </button>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <div className="p-4 border-t border-[#3A4D23] flex-shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors flex items-center justify-center"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64 lg:ml-72'
        }`}>
          {/* Top Bar */}
          <div className="bg-[#232D1A] border-b border-[#3A4D23] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
              >
                <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Page Title */}
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">
                {menu.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Admin Dashboard Button */}
              {isAdmin && (
                <Link
                  href="/dashboard-admin"
                  className="px-2 sm:px-3 md:px-4 py-2 bg-[#8BAE5A] text-[#0A0F0A] rounded-lg hover:bg-[#7A9D4A] transition-colors font-semibold flex items-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base"
                >
                  <UserGroupIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              )}

              {/* Notifications */}
              <NotificationBell />

              {/* Messages */}
              <InboxIcon />

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                data-logout-button
                className="px-2 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Uitloggen...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Uitloggen</span>
                    <span className="sm:hidden">x Uit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                className="lg:hidden fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Backdrop */}
                <motion.div 
                  className="absolute inset-0 bg-black bg-opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Sidebar */}
                <motion.div 
                  className="absolute left-0 top-0 h-full w-[85%] max-w-[400px] bg-[#232D1A] flex flex-col shadow-2xl"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ 
                    type: "spring", 
                    damping: 25, 
                    stiffness: 200,
                    duration: 0.3
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-[#3A4D23] flex-shrink-0 bg-[#232D1A] z-10">
                    <div className="flex items-center justify-between">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src="/logo_white-full.svg"
                          alt="Top Tier Men Logo"
                          width={120}
                          height={30}
                          className="h-8 w-auto object-contain"
                        />
                      </Link>
                      <motion.button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 bg-[#181F17] text-[#8BAE5A] rounded-lg hover:bg-[#3A4D23] transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar" style={{ height: 'calc(100vh - 80px)', maxHeight: 'calc(100vh - 80px)' }}>
                    <div className="p-4 pb-8">
                      <MobileSidebarContent 
                        onLinkClick={() => setIsMobileMenuOpen(false)}
                        onboardingStatus={onboardingStatus}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Content */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className={`transition-all duration-300 ${onboardingLoading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {children}
            </div>
          </div>
        </div>

        {/* Onboarding Banner - Removed */}

        {/* Modals and Components */}
        <OnboardingV2Modal 
          isOpen={showForcedOnboarding}
        />

        <TestUserVideoModal 
          isOpen={showTestUserVideo}
          onComplete={() => {
            setShowTestUserVideo(false);
            // After test video is watched, show normal onboarding
            if (onboardingStatus && !onboardingStatus.onboarding_completed) {
              setShowForcedOnboarding(true);
            }
          }}
        />

        {showDebug && <DebugPanel />}

        <TestUserFeedback 
          isTestUser={isTestUser}
          currentPage={pathname || '/'}
          userRole={profile?.role}
          onNoteCreated={(note) => {
            console.log('Test note created:', note);
          }}
        />

        <PWAInstallPrompt />
        
        {/* 2.0.1: Monitoring Dashboard */}
        <V2MonitoringDashboard />
        
        {/* 2.0.1: Performance Alerts */}
        <V2PerformanceAlerts />
        
        {/* 2.0.1: Cache issue helper - DISABLED TO PREVENT INFINITE MODAL */}
        {/* <CacheIssueHelper /> */}
        
        {/* Support Button - Fixed position */}
        <SupportButton />
      </div>
    </>
  );
}

// 2.0.1: Wrapper component with providers
export default function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <DashboardContentInner>
      {children}
    </DashboardContentInner>
  );
}
