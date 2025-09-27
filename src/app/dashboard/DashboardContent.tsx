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
import { useMindFocusIntake } from '@/hooks/useMindFocusIntake';
import OnboardingV2Modal from '@/components/OnboardingV2Modal';
import { WorkoutSessionProvider, useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import FloatingWorkoutWidget from '@/components/FloatingWorkoutWidget';
import MobileNav from '../components/MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HomeIcon, FireIcon, AcademicCapIcon, ChartBarIcon, CurrencyDollarIcon, 
  UsersIcon, BookOpenIcon, StarIcon, UserCircleIcon, ChatBubbleLeftRightIcon, 
  ChevronUpIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, BellIcon,
  CheckCircleIcon, UserGroupIcon, TrophyIcon, 
  CalendarDaysIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon,
  RocketLaunchIcon, TagIcon, ClockIcon, CpuChipIcon
} from '@heroicons/react/24/solid';
import DebugPanel from '@/components/DebugPanel';
import TestUserVideoModal from '@/components/TestUserVideoModal';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import V2MonitoringDashboard from '@/components/V2MonitoringDashboard';
import V2PerformanceAlerts from '@/components/V2PerformanceAlerts';
import CacheIssueHelper from '@/components/CacheIssueHelper';

// Workout Widget Component
const WorkoutWidget = () => {
  const { session, stopWorkout } = useWorkoutSession();
  const pathname = usePathname();
  
  if (!session) return null;
  
  // Hide the global widget if we're on a workout page (they have their own widget with completion callback)
  if (pathname?.includes('/trainingscentrum/workout/')) {
    return null;
  }
  
  // Check if session is too old and clean it up
  const sessionAge = Date.now() - new Date(session.started_at).getTime();
  const maxAge = 6 * 60 * 60 * 1000; // 6 hours
  if (sessionAge > maxAge) {
    console.log('🧹 Cleaning up old workout session');
    stopWorkout();
    return null;
  }
  
  return (
    <FloatingWorkoutWidget
      session={session}
      onResume={() => {}}
    />
  );
};

// Subscription Tier Display Component
const SubscriptionTier = () => {
  const { subscription, loading, error } = useSubscription();
  
  // console.log('🔍 SubscriptionTier render:', { subscription, loading, error });
  
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
const baseMenu = [
  { label: 'Dashboard', icon: HomeIcon, href: '/dashboard', onboardingStep: 1 },
  { label: 'Mijn Dashboard', icon: HomeIcon, parent: 'Dashboard', href: '/dashboard', isSub: true, onboardingStep: 1 },
  { label: 'Mijn Profiel', icon: UserCircleIcon, parent: 'Dashboard', href: '/dashboard/mijn-profiel', isSub: true, onboardingStep: 1 },
  { label: 'Notificaties', icon: BellIcon, parent: 'Dashboard', href: '/dashboard/notificaties', isSub: true, onboardingStep: 1 },
  { label: 'Mijn Trainingen', icon: AcademicCapIcon, parent: 'Dashboard', href: '/dashboard/mijn-trainingen', isSub: true, onboardingStep: 1 },
  { label: 'Finance & Business', icon: CurrencyDollarIcon, href: '/dashboard/finance-en-business', onboardingStep: 7 },
  { label: 'Academy', icon: FireIcon, href: '/dashboard/academy', onboardingStep: 7 },
  { label: 'Challenges', icon: FireIcon, href: '/dashboard/mijn-challenges', onboardingStep: 3 },
  { label: 'Trainingsschemas', icon: AcademicCapIcon, href: '/dashboard/trainingsschemas', onboardingStep: 4, requiresTrainingAccess: true },
  { label: 'Voedingsplannen', icon: RocketLaunchIcon, href: '/dashboard/voedingsplannen-v2', onboardingStep: 5, requiresNutritionAccess: true },
  { label: 'Mind & Focus', icon: ChartBarIcon, href: '/dashboard/mind-focus', onboardingStep: 7 },
  { label: 'Mijn Mind & Focus', icon: ChartBarIcon, parent: 'Mind & Focus', href: '/dashboard/mind-focus', isSub: true, onboardingStep: 7 },
  { label: 'Focus Training', icon: TagIcon, parent: 'Mind & Focus', href: '/dashboard/mind-focus/focus-training', isSub: true, onboardingStep: 7 },
  { label: 'Stress Release', icon: FireIcon, parent: 'Mind & Focus', href: '/dashboard/mind-focus/stress-release', isSub: true, onboardingStep: 7 },
  { label: 'Sleep Preparation', icon: ClockIcon, parent: 'Mind & Focus', href: '/dashboard/mind-focus/sleep-preparation', isSub: true, onboardingStep: 7 },
  { label: 'Recovery', icon: CpuChipIcon, parent: 'Mind & Focus', href: '/dashboard/mind-focus/recovery', isSub: true, onboardingStep: 7 },
  { label: 'Brotherhood', icon: UsersIcon, href: '/dashboard/brotherhood', onboardingStep: 6 },
  { label: 'Social Feed', icon: ChatBubbleLeftRightIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/social-feed', isSub: true, onboardingStep: 7 },
  { label: 'Forum', icon: FireIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/forum', isSub: true, onboardingStep: 4, isBasicTierStep: true },
  { label: 'Leden', icon: UsersIcon, parent: 'Brotherhood', href: '/dashboard/brotherhood/leden', isSub: true, onboardingStep: 7 },
  { label: 'Boekenkamer', icon: BookOpenIcon, href: '/dashboard/boekenkamer', onboardingStep: 7, adminOnly: false },
  { label: 'Badges & Rangen', icon: StarIcon, href: '/dashboard/badges-en-rangen', onboardingStep: 7 },
  { label: 'Producten', icon: ShoppingBagIcon, href: '/dashboard/producten', onboardingStep: 7 },
  { label: 'Mentorship & Coaching', icon: ChatBubbleLeftRightIcon, href: '/dashboard/mentorship-en-coaching', onboardingStep: 7 },
];

// Function to get menu with conditional onboarding button - ENHANCED LOGIC
const getMenu = (isOnboardingCompleted: boolean, isLoading: boolean = false) => {
  console.log('🔍 getMenu called with:', { isOnboardingCompleted, isLoading });
  
  // CRITICAL: Don't show onboarding button while loading to prevent flash
  if (isLoading === true) {
    console.log('⏳ Loading state active, returning base menu');
    return baseMenu;
  }
  
  // CRITICAL: If onboarding status is undefined or null, don't show onboarding button
  if (isOnboardingCompleted === undefined || isOnboardingCompleted === null) {
    console.log('❓ Onboarding status undefined/null, returning base menu');
    return baseMenu;
  }
  
  // CRITICAL: Only show onboarding button if onboarding is explicitly false
  if (isOnboardingCompleted === false) {
    console.log('✅ Onboarding not completed, showing onboarding button');
    return [
      { label: 'Onboarding', icon: CheckCircleIcon, href: null, onboardingStep: 1, isOnboardingItem: true, isDynamic: true },
      ...baseMenu
    ];
  }
  
  // CRITICAL: If onboarding is completed (true), don't show onboarding button
  if (isOnboardingCompleted === true) {
    console.log('✅ Onboarding completed, returning base menu');
    return baseMenu;
  }
  
  // Default to base menu for any other case (safety fallback)
  console.log('🔄 Default case, returning base menu');
  return baseMenu;
};

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
  const [openMindFocus, setOpenMindFocus] = useState(true); // Default expanded
  const { isCompleted, currentStep, hasTrainingAccess, hasNutritionAccess, isLoading } = useOnboardingV2();
  const { isIntakeCompleted: mindFocusIntakeCompleted } = useMindFocusIntake();
  
  // Use onboardingStatus from props if available, otherwise fallback to context
  const actualOnboardingStatus = onboardingStatus || { current_step: currentStep, onboarding_completed: isCompleted };
  const { user, isAdmin } = useSupabaseAuth();
  const { hasAccess } = useSubscription();
  
  const safePathname = pathname || '';
  
  // Use currentStep from actualOnboardingStatus if available, otherwise fallback to useOnboarding hook
  const actualCurrentStep = actualOnboardingStatus?.current_step ?? currentStep;
  
  // Get menu with conditional onboarding button - ENHANCED LOGIC
  // CRITICAL: Always pass loading state to prevent flash
  const onboardingCompleted = actualOnboardingStatus?.onboarding_completed ?? isCompleted;
  // CRITICAL: During logout, always use loading state to prevent flash
  const isLoggingOut = !user; // Check if user is null (logged out)
  const effectiveLoading = isLoading || isLoggingOut;
  const mobileMenu = getMenu(onboardingCompleted, effectiveLoading);
  
  console.log('🔍 MobileSidebarContent menu calculation:', {
    actualOnboardingStatus: actualOnboardingStatus?.onboarding_completed,
    isCompleted,
    onboardingCompleted,
    isLoading,
    menuLength: mobileMenu.length
  });


  // Function to check if a menu item should be visible based on subscription tier and admin status
  const isMenuItemVisible = (item: any) => {
    // Check admin-only items first - specifically allow rick@toptiermen.eu and chiel@media2net.nl
    if (item.adminOnly && user?.email !== 'rick@toptiermen.eu' && user?.email !== 'chiel@media2net.nl') {
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
    if ((item as any).disabled) return true;
    
    // If onboarding is completed, no items should be disabled (except explicitly disabled ones)
    // BUT: If user is still on step 5 (Forum intro), only allow Brotherhood > Forum
    if (actualOnboardingStatus?.onboarding_completed) {
      // Special case: If user completed onboarding but is still on forum intro step
      // Only allow Brotherhood > Forum access
      if (actualCurrentStep === 5) {
        // Allow Brotherhood parent item (so it can be expanded)
        if (item.label === 'Brotherhood') {
          return false; // Not disabled - allow expansion
        }
        // Allow Brotherhood > Forum access
        if (item.label === 'Forum' && item.parent === 'Brotherhood') {
          return false; // Not disabled
        }
        // Block everything else during forum intro
        return true;
      }
      return false;
    }
    
    // If no onboarding status, allow all items
    if (!actualOnboardingStatus) return false;
    
    // During onboarding V2, block navigation based on current step
    if (actualCurrentStep !== null && actualCurrentStep !== undefined) {
      // Determine if this is the last step for the current user tier
      const isBasicTier = !hasTrainingAccess && !hasNutritionAccess;
      const isLastStep = actualCurrentStep === 6; // Forum intro is always the last step
      
      // Enhanced debug logging for step 5
      if (typeof window !== 'undefined' && actualCurrentStep === 5) {
        console.log(`🔍 [MOBILE STEP 5 DEBUG] ${item.label}: parent=${item.parent}, isBasicTier=${isBasicTier}, isLastStep=${isLastStep}, onboarding_completed=${actualOnboardingStatus?.onboarding_completed}`);
      }
      
      // Special case for last step (Forum intro): Only allow Brotherhood > Forum
      if (isLastStep) {
        // Allow Brotherhood parent item (so it can be expanded)
        if (item.label === 'Brotherhood') {
          return false; // Not disabled - allow expansion
        }
        // Allow Brotherhood > Forum access
        if (item.label === 'Forum' && item.parent === 'Brotherhood') {
          return false; // Not disabled
        }
        // Block everything else during step 6 - including Dashboard and its subitems
        return true;
      }
      
      // Special case for step 1 (video step): Only allow Onboarding menu item
      if (actualCurrentStep === 1) {
        // Debug logging for step 1
        if (typeof window !== 'undefined') {
          console.log(`🔍 [MOBILE STEP 1 DEBUG] ${item.label}: isOnboardingItem=${item.isOnboardingItem}, shouldDisable=${!item.isOnboardingItem}`);
        }
        // Only allow the Onboarding menu item during video step
        return !item.isOnboardingItem;
      }
      
      // For other steps, check if this is the correct step for the current tier
      let isCurrentStep = false;
      
      // Check if this item matches the current step
      if (item.onboardingStep === actualCurrentStep) {
        // For Basic Tier users, step 4 should show Forum, not Trainingsschemas
        if (actualCurrentStep === 4) {
          if (isBasicTier) {
            // Basic tier: step 4 = Forum (Brotherhood > Forum)
            isCurrentStep = item.label === 'Forum' && item.parent === 'Brotherhood';
          } else {
            // Premium/Lifetime tier: step 4 = Trainingsschemas
            isCurrentStep = item.label === 'Trainingsschemas';
          }
        } else if (actualCurrentStep === 5) {
          if (isBasicTier) {
            // Basic tier: step 5 = Forum (Brotherhood > Forum) - this shouldn't happen as Basic only has 4 steps
            isCurrentStep = false;
          } else {
            // Premium/Lifetime tier: step 5 = Voedingsplannen
            isCurrentStep = item.label === 'Voedingsplannen';
          }
        } else {
          // For all other steps, use normal matching
          isCurrentStep = true;
        }
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
      const menuItem = getMenu(actualOnboardingStatus?.onboarding_completed || isCompleted).find(item => item.href === href);
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
    const currentItem = getMenu(actualOnboardingStatus?.onboarding_completed || isCompleted).find(item => item.href === safePathname);
    if (currentItem && 'parent' in currentItem) {
      if (currentItem.parent === 'Dashboard') {
        setOpenDashboard(true);
      } else if (currentItem.parent === 'Brotherhood') {
        setOpenBrotherhood(true);
      } else if (currentItem.parent === 'Mind & Focus') {
        setOpenMindFocus(true);
      }
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
      
      {mobileMenu.map((item) => {
        // Onboarding button is now handled by getMenu function
        
        // Skip menu items that are not visible based on subscription tier
        if (!isMenuItemVisible(item)) {
          return null;
        }
        
        if (!('parent' in item)) {
          // During onboarding, only the current step should be active
          // Special case for step 6: Brotherhood should be active when on forum pages
          const isActive = !isCompleted 
            ? (safePathname === item.href && item.onboardingStep === actualCurrentStep) ||
              (actualCurrentStep === 6 && item.label === 'Brotherhood')
            : safePathname === item.href;
          const hasSubmenu = mobileMenu.some(sub => 'parent' in sub && sub.parent === item.label);

          if (hasSubmenu) {
            const isOpen = item.label === 'Dashboard' ? openDashboard : 
                          item.label === 'Brotherhood' ? openBrotherhood : 
                          item.label === 'Mind & Focus' ? openMindFocus : false;
            const setIsOpen = item.label === 'Dashboard' ? setOpenDashboard : 
                             item.label === 'Brotherhood' ? setOpenBrotherhood : 
                             item.label === 'Mind & Focus' ? setOpenMindFocus : 
                             () => {};
            let subItems = mobileMenu.filter(sub => 'parent' in sub && sub.parent === item.label);
            
            // For Mind & Focus, only show subpages if intake is completed
            if (item.label === 'Mind & Focus' && !mindFocusIntakeCompleted) {
              subItems = subItems.filter(sub => sub.label === 'Mijn Mind & Focus');
            }
            const hasActiveSubItem = subItems.some(sub => 
              !isCompleted 
                ? (sub.href === safePathname && sub.onboardingStep === actualCurrentStep) ||
                  (actualCurrentStep === 5 && sub.label === 'Forum')
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
                  title={allSubItemsDisabled ? (subItems.some(sub => (sub as any).disabled) ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding") : undefined}
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
                          ? (safePathname === sub.href && sub.onboardingStep === actualCurrentStep) ||
                            (actualCurrentStep === 5 && sub.label === 'Forum')
                          : safePathname === sub.href;
                        const isHighlighted = false; // highlightedMenu not available in V2
                        const isDisabled = isMenuItemDisabled(sub);
                        
                        if (isDisabled) {
                          return (
                            <div
                              key={sub.label}
                              className="block px-4 py-2 rounded-lg text-sm text-gray-500 cursor-not-allowed opacity-50"
                              title={(sub as any).disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
                            >
                              {sub.label}
                            </div>
                          );
                        }
                        
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href || '#'}
                            onClick={(sub as any).disabled ? (e) => e.preventDefault() : onLinkClick}
                            title={(sub as any).disabled ? "Binnenkort online" : undefined}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                              (sub as any).disabled
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
          const isOnboardingItem = 'isOnboardingItem' in item && item.isOnboardingItem;
          
          // Only the onboarding menu item should be yellow during onboarding
          const shouldBeYellow = isOnboardingItem && !isCompleted && !actualOnboardingStatus?.onboarding_completed;
          
          // Special case: Onboarding menu item should always be yellow during onboarding, never disabled
          if (isDisabled && !isOnboardingItem) {
            return (
              <div
                key={item.label}
                className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide font-figtree text-gray-500 cursor-not-allowed opacity-50`}
                title={(item as any).disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
              >
                <item.icon className="w-6 h-6 text-gray-500" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.label}
              href={(item as any).disabled ? '#' : (('isDynamic' in item && item.isDynamic) && ('isOnboardingItem' in item && item.isOnboardingItem) && !isCompleted ? 
                (actualCurrentStep === 0 ? '/dashboard/welcome-video-v2' :
                 actualCurrentStep === 1 ? '/dashboard/profiel' :
                 actualCurrentStep === 2 ? '/dashboard/mijn-challenges' :
                 actualCurrentStep === 3 ? '/dashboard/trainingsschemas' :
                 actualCurrentStep === 4 ? '/dashboard/voedingsplannen-v2' :
                 actualCurrentStep === 5 ? '/dashboard/challenges' :
                 actualCurrentStep === 6 ? '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden' :
                 '/dashboard/welcome-video') : (item.href || '#'))}
              onClick={(item as any).disabled ? (e) => e.preventDefault() : (e) => handleMobileLinkClick(item.href || '#', item.label, e)}
              title={(item as any).disabled ? "Binnenkort online" : undefined}
              className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-500 font-figtree ${
                (item as any).disabled
                  ? 'text-gray-500 cursor-not-allowed opacity-50'
                  : isActive
                  ? 'bg-[#8BAE5A] text-black shadow-lg'
                  : shouldBeYellow
                    ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 shadow-lg'
                    : false
                      ? 'bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/30 shadow-lg animate-pulse'
                      : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
              }`}
            >
              <item.icon className={`w-6 h-6 ${(item as any).disabled ? 'text-gray-500' : isActive ? 'text-white' : shouldBeYellow ? 'text-[#FFD700]' : 'text-[#8BAE5A]'}`} />
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
  const [openMindFocus, setOpenMindFocus] = useState(false);
  const { isCompleted, currentStep, hasTrainingAccess, hasNutritionAccess, isLoading } = useOnboardingV2();
  const { isIntakeCompleted: mindFocusIntakeCompleted } = useMindFocusIntake();
  
  // Use onboardingStatus from props if available, otherwise fallback to context
  const actualOnboardingStatus = onboardingStatus || { current_step: currentStep, onboarding_completed: isCompleted };
  
  // Debug log to see onboarding status
  useEffect(() => {
    console.log('🔍 [SIDEBAR DEBUG] Onboarding Status:', {
      onboardingStatusFromProps: onboardingStatus,
      actualOnboardingStatus,
      isCompleted,
      currentStep,
      isLoading,
      onboarding_completed: actualOnboardingStatus?.onboarding_completed,
      shouldShowAllItems: actualOnboardingStatus?.onboarding_completed,
      menuWillShowOnboarding: !isLoading && actualOnboardingStatus?.onboarding_completed === false
    });
  }, [onboardingStatus, actualOnboardingStatus, isCompleted, currentStep, isLoading]);
  
  // const { trackFeatureUsage } = useV2Monitoring();
  const { user, isAdmin } = useSupabaseAuth();
  const { hasAccess } = useSubscription();
  
  const safePathname = pathname || '';
  
  // Use currentStep from actualOnboardingStatus if available, otherwise fallback to useOnboarding hook
  const actualCurrentStep = actualOnboardingStatus?.current_step ?? currentStep;
  
  // Get menu with conditional onboarding button - ENHANCED LOGIC
  // CRITICAL: Always pass loading state to prevent flash
  const onboardingCompleted = actualOnboardingStatus?.onboarding_completed ?? isCompleted;
  // CRITICAL: During logout, always use loading state to prevent flash
  const isLoggingOutDesktop = !user; // Check if user is null (logged out)
  const effectiveLoadingDesktop = isLoading || isLoggingOutDesktop;
  const menu = getMenu(onboardingCompleted, effectiveLoadingDesktop);
  
  console.log('🔍 SidebarContent menu calculation:', {
    actualOnboardingStatus: actualOnboardingStatus?.onboarding_completed,
    isCompleted,
    onboardingCompleted,
    isLoading,
    menuLength: menu.length
  });

  // Function to check if a menu item should be visible based on subscription tier and admin status
  const isMenuItemVisible = (item: any) => {
    // Check admin-only items first - specifically allow rick@toptiermen.eu and chiel@media2net.nl
    if (item.adminOnly && user?.email !== 'rick@toptiermen.eu' && user?.email !== 'chiel@media2net.nl') {
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
    if ((item as any).disabled) return true;
    
    // If onboarding is completed, no items should be disabled (except explicitly disabled ones)
    // BUT: If user is still on step 5 (Forum intro), only allow Brotherhood > Forum
    if (actualOnboardingStatus?.onboarding_completed) {
      // Special case: If user completed onboarding but is still on forum intro step
      // Only allow Brotherhood > Forum access
      if (actualCurrentStep === 5) {
        // Allow Brotherhood parent item (so it can be expanded)
        if (item.label === 'Brotherhood') {
          return false; // Not disabled - allow expansion
        }
        // Allow Brotherhood > Forum access
        if (item.label === 'Forum' && item.parent === 'Brotherhood') {
          return false; // Not disabled
        }
        // Block everything else during forum intro
        return true;
      }
      return false;
    }
    
    // If no onboarding status, allow all items
    if (!actualOnboardingStatus) return false;
    
    // During onboarding V2, block navigation based on current step
    if (actualCurrentStep !== null && actualCurrentStep !== undefined) {
      // Determine if this is the last step for the current user tier
      const isBasicTier = !hasTrainingAccess && !hasNutritionAccess;
      const isLastStep = actualCurrentStep === 6; // Forum intro is always the last step
      
      // Enhanced debug logging for step 6
      if (typeof window !== 'undefined' && actualCurrentStep === 6) {
        console.log(`🔍 [STEP 6 DEBUG] ${item.label}: parent=${item.parent}, isBasicTier=${isBasicTier}, isLastStep=${isLastStep}, onboarding_completed=${actualOnboardingStatus?.onboarding_completed}`);
      }
      
      // Special case for last step (Forum intro): Only allow Brotherhood > Forum
      if (isLastStep) {
        // Allow Brotherhood parent item (so it can be expanded)
        if (item.label === 'Brotherhood') {
          return false; // Not disabled - allow expansion
        }
        // Allow Brotherhood > Forum access
        if (item.label === 'Forum' && item.parent === 'Brotherhood') {
          return false; // Not disabled
        }
        // Block everything else during step 6
        return true;
      }
      
      // Special case for step 1 (video step): Only allow Onboarding menu item
      if (actualCurrentStep === 1) {
        // Debug logging for step 1
        if (typeof window !== 'undefined') {
          console.log(`🔍 [DESKTOP STEP 1 DEBUG] ${item.label}: isOnboardingItem=${item.isOnboardingItem}, shouldDisable=${!item.isOnboardingItem}`);
        }
        // Only allow the Onboarding menu item during video step
        return !item.isOnboardingItem;
      }
      
      // For other steps, check if this is the correct step for the current tier
      let isCurrentStep = false;
      
      // Check if this item matches the current step
      if (item.onboardingStep === actualCurrentStep) {
        // For Basic Tier users, step 4 should show Forum, not Trainingsschemas
        if (actualCurrentStep === 4) {
          if (isBasicTier) {
            // Basic tier: step 4 = Forum (Brotherhood > Forum)
            isCurrentStep = item.label === 'Forum' && item.parent === 'Brotherhood';
          } else {
            // Premium/Lifetime tier: step 4 = Trainingsschemas
            isCurrentStep = item.label === 'Trainingsschemas';
          }
        } else if (actualCurrentStep === 5) {
          if (isBasicTier) {
            // Basic tier: step 5 = Forum (Brotherhood > Forum) - this shouldn't happen as Basic only has 4 steps
            isCurrentStep = false;
          } else {
            // Premium/Lifetime tier: step 5 = Voedingsplannen
            isCurrentStep = item.label === 'Voedingsplannen';
          }
        } else {
          // For all other steps, use normal matching
          isCurrentStep = true;
        }
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
      const menuItem = getMenu(actualOnboardingStatus?.onboarding_completed || isCompleted).find(item => item.href === href);
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
    const currentItem = getMenu(actualOnboardingStatus?.onboarding_completed || isCompleted).find(item => item.href === safePathname);
    if (currentItem && 'parent' in currentItem) {
      if (currentItem.parent === 'Dashboard') {
        setOpenDashboard(true);
      } else if (currentItem.parent === 'Brotherhood') {
        setOpenBrotherhood(true);
      } else if (currentItem.parent === 'Mind & Focus') {
        setOpenMindFocus(true);
      }
    }
    
    // Auto-open Brotherhood submenu during onboarding step 6 (forum introduction)
    if (!isCompleted && actualCurrentStep === 6) {
      setOpenBrotherhood(true);
    }
  }, [safePathname, isCompleted, actualCurrentStep]);

  // Calculate menu once to avoid multiple calls
  // Use loading state to prevent flash during initial load
  const isLoggingOutSidebar = !user; // Check if user is null (logged out)
  const effectiveLoadingSidebar = isLoading || isLoggingOutSidebar;
  const sidebarMenu = getMenu(
    effectiveLoadingSidebar ? undefined : (actualOnboardingStatus?.onboarding_completed || isCompleted), 
    effectiveLoadingSidebar
  );
  
  return (
    <nav className="flex flex-col gap-2">
      {sidebarMenu.map((item) => {
        // Onboarding button is now handled by getMenu function
        
        // Skip menu items that are not visible based on subscription tier
        if (!isMenuItemVisible(item)) {
          return null;
        }
        
        if (!('parent' in item)) {
          // During onboarding, only the current step should be active
          // Special case for step 6: Brotherhood should be active when on forum pages
          const isActive = !isCompleted 
            ? (safePathname === item.href && item.onboardingStep === actualCurrentStep) ||
              (actualCurrentStep === 6 && item.label === 'Brotherhood')
            : safePathname === item.href;
          const hasSubmenu = sidebarMenu.some(sub => 'parent' in sub && sub.parent === item.label);

          if (hasSubmenu) {
            const isOpen = item.label === 'Dashboard' ? openDashboard : 
                          item.label === 'Brotherhood' ? openBrotherhood : 
                          item.label === 'Mind & Focus' ? openMindFocus : false;
            const setIsOpen = item.label === 'Dashboard' ? setOpenDashboard : 
                             item.label === 'Brotherhood' ? setOpenBrotherhood : 
                             item.label === 'Mind & Focus' ? setOpenMindFocus : 
                             () => {};
            let subItems = sidebarMenu.filter(sub => 'parent' in sub && sub.parent === item.label);
            
            // For Mind & Focus, only show subpages if intake is completed
            if (item.label === 'Mind & Focus' && !mindFocusIntakeCompleted) {
              subItems = subItems.filter(sub => sub.label === 'Mijn Mind & Focus');
            }
            const hasActiveSubItem = subItems.some(sub => 
              !isCompleted 
                ? (sub.href === safePathname && sub.onboardingStep === actualCurrentStep) ||
                  (actualCurrentStep === 5 && sub.label === 'Forum')
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
                  title={allSubItemsDisabled ? (subItems.some(sub => (sub as any).disabled) ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding") : undefined}
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
                          ? (safePathname === sub.href && sub.onboardingStep === actualCurrentStep) ||
                            (actualCurrentStep === 5 && sub.label === 'Forum')
                          : safePathname === sub.href;
                        const isHighlighted = false; // highlightedMenu not available in V2
                        const isDisabled = isMenuItemDisabled(sub);
                        
                        if (isDisabled) {
                          return (
                            <div
                              key={sub.label}
                              className="block px-4 py-2 rounded-lg text-sm text-gray-500 cursor-not-allowed opacity-50"
                              title={(sub as any).disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
                            >
                              {sub.label}
                            </div>
                          );
                        }
                        
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href || '#'}
                            onClick={(sub as any).disabled ? (e) => e.preventDefault() : onLinkClick}
                            title={(sub as any).disabled ? "Binnenkort online" : undefined}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all duration-150 ${
                              (sub as any).disabled
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
          const isOnboardingItem = 'isOnboardingItem' in item && item.isOnboardingItem;
          
          // Only the onboarding menu item should be yellow during onboarding
          const shouldBeYellow = isOnboardingItem && !isCompleted && !actualOnboardingStatus?.onboarding_completed;
          
          // Special case: Onboarding menu item should always be yellow during onboarding, never disabled
          if (isDisabled && !isOnboardingItem) {
            return (
              <div
                key={item.label}
                className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide font-figtree text-gray-500 cursor-not-allowed opacity-50 ${collapsed ? 'justify-center px-2' : ''}`}
                title={(item as any).disabled ? "Binnenkort online" : "Nog niet beschikbaar tijdens onboarding"}
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
                opacity: 1,
                scale: 1
              }}
              transition={{ 
                duration: 0,
                times: [0]
              }}
            >
              <Link
                href={(item as any).disabled ? '#' : (('isDynamic' in item && item.isDynamic) && ('isOnboardingItem' in item && item.isOnboardingItem) && !isCompleted ? 
                  (actualCurrentStep === 0 ? '/dashboard/welcome-video-v2' :
                   actualCurrentStep === 1 ? '/dashboard/profiel' :
                   actualCurrentStep === 2 ? '/dashboard/mijn-challenges' :
                   actualCurrentStep === 3 ? '/dashboard/trainingsschemas' :
                   actualCurrentStep === 4 ? '/dashboard/voedingsplannen-v2' :
                   actualCurrentStep === 5 ? '/dashboard/challenges' :
                   actualCurrentStep === 6 ? '/dashboard/brotherhood/forum/algemeen/voorstellen-nieuwe-leden' :
                   '/dashboard/welcome-video') : (item.href || '#'))}
                onClick={(item as any).disabled ? (e) => e.preventDefault() : onLinkClick}
                title={(item as any).disabled ? "Binnenkort online" : undefined}
                className={`grid grid-cols-[auto_1fr] items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wide transition-all duration-500 font-figtree ${
                  (item as any).disabled
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : isActive 
                    ? 'bg-[#8BAE5A] text-black shadow-lg' 
                    : shouldBeYellow
                      ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 shadow-lg'
                      : false
                        ? 'bg-[#8BAE5A]/20 text-[#8BAE5A] border border-[#8BAE5A]/30 shadow-lg animate-pulse'
                        : 'text-white hover:text-[#8BAE5A] hover:bg-[#3A4D23]/50'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
              <item.icon className={`w-6 h-6 ${(item as any).disabled ? 'text-gray-500' : isActive ? 'text-white' : shouldBeYellow ? 'text-[#FFD700]' : 'text-[#8BAE5A]'}`} />
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
  const { isCompleted, isLoading: onboardingLoading } = useOnboardingV2();
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
  
  // Get onboarding status from context
  const { isCompleted: contextIsCompleted, currentStep: contextCurrentStep, refreshStatus } = useOnboardingV2();
  
  // Refresh onboarding status on mount (only once) - optimized
  useEffect(() => {
    if (refreshStatus && typeof window !== 'undefined') {
      console.log('🔄 [DASHBOARD] Refreshing onboarding status on mount...');
      // Add small delay to prevent race conditions
      const timeoutId = setTimeout(() => {
        refreshStatus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [refreshStatus]); // Add refreshStatus to dependency array

  // Sync onboardingStatus with context changes - ENHANCED
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    if (contextIsCompleted !== undefined && contextCurrentStep !== undefined) {
      console.log('🔄 Syncing onboarding status:', { contextIsCompleted, contextCurrentStep });
      setOnboardingStatus({
        onboarding_completed: contextIsCompleted,
        current_step: contextCurrentStep
      });
    }
  }, [contextIsCompleted, contextCurrentStep]);
  
  // CRITICAL: Reset onboarding status when user logs out
  useEffect(() => {
    if (!user) {
      console.log('🔍 User logged out, resetting onboarding status');
      setOnboardingStatus(null);
      setShowForcedOnboarding(false);
    }
  }, [user]);

  // 2.0.1: Cache busting for existing users
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
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
        // Transform Onboarding V3 API response to match expected format
        const transformedData = {
          onboarding_completed: data.onboardingCompleted || false,
          current_step: data.currentStep,
          user_id: user.id,
          userTier: data.userTier,
          completedSteps: data.completedSteps,
          progress: data.progress
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
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    if (user && !isLoadingLocal) {
      checkOnboardingStatus();
    }
  }, [user?.id, checkOnboardingStatus]);

  // Show forced onboarding if user hasn't completed onboarding
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    if (onboardingStatus && !onboardingStatus.onboarding_completed) {
      // Check if user is a test user (email contains @toptiermen.test)
      const isTestUser = user?.email?.includes('@toptiermen.test') || false;
      
      if (isTestUser && !onboardingStatus.welcome_video_shown) {
        // Show test video first for test users who haven't watched the welcome video
        setShowTestUserVideo(true);
        setShowForcedOnboarding(false);
      } else if (!onboardingStatus.goal_set || !onboardingStatus.missions_selected) {
        // Show normal onboarding if goal is not set or missions are not selected yet
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
                width={sidebarCollapsed ? 20 : 128}
                height={32}
                style={{ height: 'auto' }}
                className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-32 h-8'} object-contain hover:opacity-80 transition-opacity`}
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
                {getMenu(onboardingStatus?.onboarding_completed || isCompleted).find(item => item.href === pathname)?.label || 'Dashboard'}
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
                          width={60}
                          height={15}
                          style={{ height: 'auto' }}
                          className="h-4 w-auto object-contain"
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
            <div className={`transition-all duration-300 ${onboardingLoading && contextCurrentStep !== 5 ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              {children}
            </div>
          </div>
        </div>

        {/* Onboarding Banner - Removed */}

        {/* Modals and Components */}
        {/* OnboardingV2Modal - Global modal for onboarding steps */}
        {typeof window !== 'undefined' && (
          <OnboardingV2Modal isOpen={!isCompleted && (contextCurrentStep === 1 || contextCurrentStep === 2)} />
        )}

        {typeof window !== 'undefined' && (
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
        )}

        {typeof window !== 'undefined' && showDebug && <DebugPanel />}

        {/* TestUserFeedback - Removed */}

        {typeof window !== 'undefined' && <PWAInstallPrompt />}
        
        {/* 2.0.1: Monitoring Dashboard */}
        {typeof window !== 'undefined' && <V2MonitoringDashboard />}
        
        {/* 2.0.1: Performance Alerts */}
        {typeof window !== 'undefined' && <V2PerformanceAlerts />}
        
        {/* 2.0.1: Cache issue helper - DISABLED TO PREVENT INFINITE MODAL */}
        {/* <CacheIssueHelper /> */}
        
        {/* Support Button - Removed */}
        
        {/* Floating Workout Widget */}
        {typeof window !== 'undefined' && <WorkoutWidget />}
        
        {/* Mobile Navigation - Completely removed */}
      </div>
    </>
  );
}

// 2.0.1: Wrapper component with providers
export default function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <WorkoutSessionProvider>
      <DashboardContentInner>
        {children}
      </DashboardContentInner>
    </WorkoutSessionProvider>
  );
}
