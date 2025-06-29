'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserIcon,
  HeartIcon,
  FireIcon,
  TrophyIcon,
  BellIcon,
  EnvelopeIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useCountUp } from '../../hooks/useCountUp';

const ledenData = [
  { dag: 'Ma', leden: 180 },
  { dag: 'Di', leden: 220 },
  { dag: 'Wo', leden: 210 },
  { dag: 'Do', leden: 260 },
  { dag: 'Vr', leden: 240 },
  { dag: 'Za', leden: 300 },
  { dag: 'Zo', leden: 270 },
];

const badgesData = [
  { dag: 'Ma', badges: 18 },
  { dag: 'Di', badges: 22 },
  { dag: 'Wo', badges: 15 },
  { dag: 'Do', badges: 30 },
  { dag: 'Vr', badges: 24 },
  { dag: 'Za', badges: 35 },
  { dag: 'Zo', badges: 28 },
];

const omzetData = [
  { week: 'W1', omzet: 1800 },
  { week: 'W2', omzet: 2200 },
  { week: 'W3', omzet: 2100 },
  { week: 'W4', omzet: 2600 },
  { week: 'W5', omzet: 2450 },
];

const challengeData = [
  { maand: 'Jan', inschrijvingen: 120 },
  { maand: 'Feb', inschrijvingen: 140 },
  { maand: 'Mrt', inschrijvingen: 180 },
  { maand: 'Apr', inschrijvingen: 160 },
  { maand: 'Mei', inschrijvingen: 200 },
  { maand: 'Jun', inschrijvingen: 220 },
  { maand: 'Jul', inschrijvingen: 210 },
];

const rangData = [
  { naam: 'Recruit', value: 40 },
  { naam: 'Warrior', value: 30 },
  { naam: 'Alpha', value: 20 },
  { naam: 'Overig', value: 10 },
];

const pieColors = ['#C49C48', '#E5C97B', '#B8860B', '#111111'];

// Typedefs voor mockdata
interface CommunityHealth {
  overallScore: number;
  engagementRate: number;
  creationRatio: number;
  responsiveness: number;
  connectivityScore: number;
  trends: { engagementRate: number; creationRatio: number; responsiveness: number; connectivityScore: number };
}
interface UserJourney {
  newRegistrations: number;
  activatedMembers: number;
  engagedMembers: number;
  powerUsers: number;
  conversionRates: { activation: number; engagement: number; powerUser: number };
}
interface ContentPerformance {
  academy: { totalModules: number; averageCompletionRate: number; topModules: any[] };
  training: { totalWorkouts: number; averageCompletionRate: number; topWorkouts: any[] };
  forum: { totalPosts: number; averageResponseTime: number; topContributors: any[] };
}
interface RiskData {
  churnRisk: any[];
  ambassadors: any[];
}

// Mock data per periode
const communityHealthDataByPeriod: Record<string, CommunityHealth> = {
  '7d': {
    overallScore: 82,
    engagementRate: 68,
    creationRatio: 45,
    responsiveness: 7.2,
    connectivityScore: 28,
    trends: { engagementRate: +4, creationRatio: +2, responsiveness: -0.8, connectivityScore: +3 }
  },
  '30d': {
    overallScore: 78,
    engagementRate: 65,
    creationRatio: 42,
    responsiveness: 8.5,
    connectivityScore: 23,
    trends: { engagementRate: +12, creationRatio: +8, responsiveness: -2.1, connectivityScore: +15 }
  },
  '90d': {
    overallScore: 74,
    engagementRate: 61,
    creationRatio: 39,
    responsiveness: 9.7,
    connectivityScore: 19,
    trends: { engagementRate: +18, creationRatio: +13, responsiveness: -3.2, connectivityScore: +22 }
  }
};

// Financial Metrics Data
interface FinancialMetrics {
  mrr: number;
  mrrGrowth: number;
  ltv: number;
  churnRate: number;
  newSubscriptions: number;
  mrrHistory: Array<{ month: string; value: number }>;
}

const financialDataByPeriod: Record<string, FinancialMetrics> = {
  '7d': {
    mrr: 12450,
    mrrGrowth: 8.5,
    ltv: 847,
    churnRate: 2.1,
    newSubscriptions: 23,
    mrrHistory: [
      { month: 'Jan', value: 8900 },
      { month: 'Feb', value: 9200 },
      { month: 'Mar', value: 9800 },
      { month: 'Apr', value: 10500 },
      { month: 'May', value: 11200 },
      { month: 'Jun', value: 11800 },
      { month: 'Jul', value: 12450 }
    ]
  },
  '30d': {
    mrr: 12450,
    mrrGrowth: 12.3,
    ltv: 847,
    churnRate: 2.1,
    newSubscriptions: 89,
    mrrHistory: [
      { month: 'Jan', value: 8900 },
      { month: 'Feb', value: 9200 },
      { month: 'Mar', value: 9800 },
      { month: 'Apr', value: 10500 },
      { month: 'May', value: 11200 },
      { month: 'Jun', value: 11800 },
      { month: 'Jul', value: 12450 }
    ]
  },
  '90d': {
    mrr: 12450,
    mrrGrowth: 18.7,
    ltv: 847,
    churnRate: 2.1,
    newSubscriptions: 234,
    mrrHistory: [
      { month: 'Jan', value: 8900 },
      { month: 'Feb', value: 9200 },
      { month: 'Mar', value: 9800 },
      { month: 'Apr', value: 10500 },
      { month: 'May', value: 11200 },
      { month: 'Jun', value: 11800 },
      { month: 'Jul', value: 12450 }
    ]
  }
};

// User Segmentation Data
interface UserSegmentation {
  topActiveUsers: Array<{ name: string; activity: number; lastActive: string; rank: number }>;
  goalSegmentation: Array<{ goal: string; percentage: number; count: number }>;
  geographicData: Array<{ city: string; country: string; count: number }>;
  inactiveUsers: Array<{ name: string; email: string; registeredDate: string; daysInactive: number }>;
}

const userSegmentationDataByPeriod: Record<string, UserSegmentation> = {
  '7d': {
    topActiveUsers: [
      { name: '@discipline_daniel', activity: 156, lastActive: '2 min geleden', rank: 1 },
      { name: '@alpha_mike', activity: 134, lastActive: '5 min geleden', rank: 2 },
      { name: '@warrior_tom', activity: 98, lastActive: '12 min geleden', rank: 3 },
      { name: '@fitness_frank', activity: 87, lastActive: '8 min geleden', rank: 4 },
      { name: '@mindset_marco', activity: 76, lastActive: '15 min geleden', rank: 5 }
    ],
    goalSegmentation: [
      { goal: 'Financiële Vrijheid', percentage: 40, count: 498 },
      { goal: 'Fysieke Dominantie', percentage: 35, count: 436 },
      { goal: 'Mentale Focus', percentage: 25, count: 311 }
    ],
    geographicData: [
      { city: 'Amsterdam', country: 'Nederland', count: 245 },
      { city: 'Rotterdam', country: 'Nederland', count: 189 },
      { city: 'Den Haag', country: 'Nederland', count: 156 },
      { city: 'Utrecht', country: 'Nederland', count: 134 },
      { city: 'Eindhoven', country: 'Nederland', count: 98 }
    ],
    inactiveUsers: [
      { name: 'Mark van der Berg', email: 'mark@email.com', registeredDate: '15-03-2024', daysInactive: 28 },
      { name: 'Thomas Jansen', email: 'thomas@email.com', registeredDate: '22-02-2024', daysInactive: 22 },
      { name: 'Lucas de Vries', email: 'lucas@email.com', registeredDate: '08-03-2024', daysInactive: 31 }
    ]
  },
  '30d': {
    topActiveUsers: [
      { name: '@discipline_daniel', activity: 456, lastActive: '2 min geleden', rank: 1 },
      { name: '@alpha_mike', activity: 389, lastActive: '5 min geleden', rank: 2 },
      { name: '@warrior_tom', activity: 298, lastActive: '12 min geleden', rank: 3 },
      { name: '@fitness_frank', activity: 267, lastActive: '8 min geleden', rank: 4 },
      { name: '@mindset_marco', activity: 234, lastActive: '15 min geleden', rank: 5 }
    ],
    goalSegmentation: [
      { goal: 'Financiële Vrijheid', percentage: 40, count: 498 },
      { goal: 'Fysieke Dominantie', percentage: 35, count: 436 },
      { goal: 'Mentale Focus', percentage: 25, count: 311 }
    ],
    geographicData: [
      { city: 'Amsterdam', country: 'Nederland', count: 245 },
      { city: 'Rotterdam', country: 'Nederland', count: 189 },
      { city: 'Den Haag', country: 'Nederland', count: 156 },
      { city: 'Utrecht', country: 'Nederland', count: 134 },
      { city: 'Eindhoven', country: 'Nederland', count: 98 }
    ],
    inactiveUsers: [
      { name: 'Mark van der Berg', email: 'mark@email.com', registeredDate: '15-03-2024', daysInactive: 28 },
      { name: 'Thomas Jansen', email: 'thomas@email.com', registeredDate: '22-02-2024', daysInactive: 22 },
      { name: 'Lucas de Vries', email: 'lucas@email.com', registeredDate: '08-03-2024', daysInactive: 31 }
    ]
  },
  '90d': {
    topActiveUsers: [
      { name: '@discipline_daniel', activity: 1245, lastActive: '2 min geleden', rank: 1 },
      { name: '@alpha_mike', activity: 1089, lastActive: '5 min geleden', rank: 2 },
      { name: '@warrior_tom', activity: 876, lastActive: '12 min geleden', rank: 3 },
      { name: '@fitness_frank', activity: 745, lastActive: '8 min geleden', rank: 4 },
      { name: '@mindset_marco', activity: 634, lastActive: '15 min geleden', rank: 5 }
    ],
    goalSegmentation: [
      { goal: 'Financiële Vrijheid', percentage: 40, count: 498 },
      { goal: 'Fysieke Dominantie', percentage: 35, count: 436 },
      { goal: 'Mentale Focus', percentage: 25, count: 311 }
    ],
    geographicData: [
      { city: 'Amsterdam', country: 'Nederland', count: 245 },
      { city: 'Rotterdam', country: 'Nederland', count: 189 },
      { city: 'Den Haag', country: 'Nederland', count: 156 },
      { city: 'Utrecht', country: 'Nederland', count: 134 },
      { city: 'Eindhoven', country: 'Nederland', count: 98 }
    ],
    inactiveUsers: [
      { name: 'Mark van der Berg', email: 'mark@email.com', registeredDate: '15-03-2024', daysInactive: 28 },
      { name: 'Thomas Jansen', email: 'thomas@email.com', registeredDate: '22-02-2024', daysInactive: 22 },
      { name: 'Lucas de Vries', email: 'lucas@email.com', registeredDate: '08-03-2024', daysInactive: 31 }
    ]
  }
};

// Real-time Activity Data
interface RealTimeActivity {
  currentUsers: number;
  recentEvents: Array<{ time: string; user: string; action: string; details?: string }>;
  trendingContent: Array<{ title: string; type: string; interactions: number; trend: string }>;
}

const realTimeDataByPeriod: Record<string, RealTimeActivity> = {
  '7d': {
    currentUsers: 47,
    recentEvents: [
      { time: '22:55:10', user: 'Mark V.', action: 'heeft gereageerd op een forumpost', details: 'in "Fitness & Gezondheid"' },
      { time: '22:54:45', user: 'Peter J.', action: 'heeft zich geregistreerd' },
      { time: '22:54:12', user: 'Rick', action: 'heeft de "Koude Krijger" badge ontgrendeld' },
      { time: '22:53:28', user: 'Daniel', action: 'heeft een workout voltooid', details: 'Alpha Strength' },
      { time: '22:52:15', user: 'Mike', action: 'heeft een meditatie voltooid', details: 'Focus & Clarity' }
    ],
    trendingContent: [
      { title: 'Hoe bereik je financiële vrijheid in 5 jaar?', type: 'Forum Post', interactions: 89, trend: '↗️ Trending' },
      { title: 'Alpha Strength - Nieuwe workout routine', type: 'Training', interactions: 67, trend: '🔥 Hot' },
      { title: 'Brotherhood Connectie Event', type: 'Event', interactions: 45, trend: '📈 Growing' }
    ]
  },
  '30d': {
    currentUsers: 47,
    recentEvents: [
      { time: '22:55:10', user: 'Mark V.', action: 'heeft gereageerd op een forumpost', details: 'in "Fitness & Gezondheid"' },
      { time: '22:54:45', user: 'Peter J.', action: 'heeft zich geregistreerd' },
      { time: '22:54:12', user: 'Rick', action: 'heeft de "Koude Krijger" badge ontgrendeld' },
      { time: '22:53:28', user: 'Daniel', action: 'heeft een workout voltooid', details: 'Alpha Strength' },
      { time: '22:52:15', user: 'Mike', action: 'heeft een meditatie voltooid', details: 'Focus & Clarity' }
    ],
    trendingContent: [
      { title: 'Hoe bereik je financiële vrijheid in 5 jaar?', type: 'Forum Post', interactions: 89, trend: '↗️ Trending' },
      { title: 'Alpha Strength - Nieuwe workout routine', type: 'Training', interactions: 67, trend: '🔥 Hot' },
      { title: 'Brotherhood Connectie Event', type: 'Event', interactions: 45, trend: '📈 Growing' }
    ]
  },
  '90d': {
    currentUsers: 47,
    recentEvents: [
      { time: '22:55:10', user: 'Mark V.', action: 'heeft gereageerd op een forumpost', details: 'in "Fitness & Gezondheid"' },
      { time: '22:54:45', user: 'Peter J.', action: 'heeft zich geregistreerd' },
      { time: '22:54:12', user: 'Rick', action: 'heeft de "Koude Krijger" badge ontgrendeld' },
      { time: '22:53:28', user: 'Daniel', action: 'heeft een workout voltooid', details: 'Alpha Strength' },
      { time: '22:52:15', user: 'Mike', action: 'heeft een meditatie voltooid', details: 'Focus & Clarity' }
    ],
    trendingContent: [
      { title: 'Hoe bereik je financiële vrijheid in 5 jaar?', type: 'Forum Post', interactions: 89, trend: '↗️ Trending' },
      { title: 'Alpha Strength - Nieuwe workout routine', type: 'Training', interactions: 67, trend: '🔥 Hot' },
      { title: 'Brotherhood Connectie Event', type: 'Event', interactions: 45, trend: '📈 Growing' }
    ]
  }
};

// Technical Performance Data
interface TechnicalPerformance {
  apiResponseTime: number;
  pageLoadTimes: Array<{ page: string; loadTime: number; status: 'good' | 'warning' | 'critical' }>;
  errorCount: number;
  errorLog: Array<{ time: string; error: string; severity: 'low' | 'medium' | 'high' }>;
  uptime: number;
}

const technicalDataByPeriod: Record<string, TechnicalPerformance> = {
  '7d': {
    apiResponseTime: 245,
    pageLoadTimes: [
      { page: 'Dashboard', loadTime: 1.2, status: 'good' },
      { page: 'Academy', loadTime: 2.1, status: 'good' },
      { page: 'Training Center', loadTime: 3.8, status: 'warning' },
      { page: 'Forum', loadTime: 1.8, status: 'good' },
      { page: 'Brotherhood', loadTime: 2.5, status: 'good' }
    ],
    errorCount: 3,
    errorLog: [
      { time: '22:45:12', error: 'API timeout - User authentication', severity: 'low' },
      { time: '21:32:45', error: 'Database connection pool exhausted', severity: 'medium' },
      { time: '20:15:33', error: 'File upload failed - Training video', severity: 'low' }
    ],
    uptime: 99.8
  },
  '30d': {
    apiResponseTime: 245,
    pageLoadTimes: [
      { page: 'Dashboard', loadTime: 1.2, status: 'good' },
      { page: 'Academy', loadTime: 2.1, status: 'good' },
      { page: 'Training Center', loadTime: 3.8, status: 'warning' },
      { page: 'Forum', loadTime: 1.8, status: 'good' },
      { page: 'Brotherhood', loadTime: 2.5, status: 'good' }
    ],
    errorCount: 3,
    errorLog: [
      { time: '22:45:12', error: 'API timeout - User authentication', severity: 'low' },
      { time: '21:32:45', error: 'Database connection pool exhausted', severity: 'medium' },
      { time: '20:15:33', error: 'File upload failed - Training video', severity: 'low' }
    ],
    uptime: 99.8
  },
  '90d': {
    apiResponseTime: 245,
    pageLoadTimes: [
      { page: 'Dashboard', loadTime: 1.2, status: 'good' },
      { page: 'Academy', loadTime: 2.1, status: 'good' },
      { page: 'Training Center', loadTime: 3.8, status: 'warning' },
      { page: 'Forum', loadTime: 1.8, status: 'good' },
      { page: 'Brotherhood', loadTime: 2.5, status: 'good' }
    ],
    errorCount: 3,
    errorLog: [
      { time: '22:45:12', error: 'API timeout - User authentication', severity: 'low' },
      { time: '21:32:45', error: 'Database connection pool exhausted', severity: 'medium' },
      { time: '20:15:33', error: 'File upload failed - Training video', severity: 'low' }
    ],
    uptime: 99.8
  }
};

const userJourneyDataByPeriod: Record<string, UserJourney> = {
  '7d': {
    newRegistrations: 32,
    activatedMembers: 25,
    engagedMembers: 13,
    powerUsers: 3,
    conversionRates: { activation: 78, engagement: 52, powerUser: 23 }
  },
  '30d': {
    newRegistrations: 100,
    activatedMembers: 75,
    engagedMembers: 40,
    powerUsers: 10,
    conversionRates: { activation: 75, engagement: 53, powerUser: 25 }
  },
  '90d': {
    newRegistrations: 270,
    activatedMembers: 210,
    engagedMembers: 110,
    powerUsers: 32,
    conversionRates: { activation: 78, engagement: 52, powerUser: 29 }
  }
};

const contentPerformanceDataByPeriod: Record<string, ContentPerformance> = {
  '7d': {
    academy: {
      totalModules: 12,
      averageCompletionRate: 71,
      topModules: [
        { name: 'Brotherhood', completionRate: 88, views: 312 },
        { name: 'Discipline & Identiteit', completionRate: 81, views: 289 },
        { name: 'Fysieke Dominantie', completionRate: 75, views: 241 }
      ]
    },
    training: {
      totalWorkouts: 45,
      averageCompletionRate: 77,
      topWorkouts: [
        { name: 'Alpha Strength', completionRate: 91, favorites: 62 },
        { name: 'Endurance Builder', completionRate: 85, favorites: 51 },
        { name: 'Core Dominance', completionRate: 79, favorites: 39 }
      ]
    },
    forum: {
      totalPosts: 312,
      averageResponseTime: 7.2,
      topContributors: [
        { name: '@discipline_daniel', posts: 14, helpfulVotes: 22 },
        { name: '@alpha_mike', posts: 11, helpfulVotes: 17 },
        { name: '@warrior_tom', posts: 9, helpfulVotes: 13 }
      ]
    }
  },
  '30d': {
    academy: {
      totalModules: 12,
      averageCompletionRate: 68,
      topModules: [
        { name: 'Brotherhood', completionRate: 85, views: 1247 },
        { name: 'Discipline & Identiteit', completionRate: 78, views: 1156 },
        { name: 'Fysieke Dominantie', completionRate: 72, views: 987 }
      ]
    },
    training: {
      totalWorkouts: 45,
      averageCompletionRate: 74,
      topWorkouts: [
        { name: 'Alpha Strength', completionRate: 89, favorites: 234 },
        { name: 'Endurance Builder', completionRate: 82, favorites: 189 },
        { name: 'Core Dominance', completionRate: 76, favorites: 156 }
      ]
    },
    forum: {
      totalPosts: 1247,
      averageResponseTime: 8.5,
      topContributors: [
        { name: '@discipline_daniel', posts: 46, helpfulVotes: 89 },
        { name: '@alpha_mike', posts: 38, helpfulVotes: 67 },
        { name: '@warrior_tom', posts: 32, helpfulVotes: 54 }
      ]
    }
  },
  '90d': {
    academy: {
      totalModules: 12,
      averageCompletionRate: 66,
      topModules: [
        { name: 'Brotherhood', completionRate: 82, views: 3120 },
        { name: 'Discipline & Identiteit', completionRate: 75, views: 2890 },
        { name: 'Fysieke Dominantie', completionRate: 69, views: 2410 }
      ]
    },
    training: {
      totalWorkouts: 45,
      averageCompletionRate: 72,
      topWorkouts: [
        { name: 'Alpha Strength', completionRate: 87, favorites: 634 },
        { name: 'Endurance Builder', completionRate: 80, favorites: 489 },
        { name: 'Core Dominance', completionRate: 74, favorites: 356 }
      ]
    },
    forum: {
      totalPosts: 3120,
      averageResponseTime: 9.1,
      topContributors: [
        { name: '@discipline_daniel', posts: 120, helpfulVotes: 210 },
        { name: '@alpha_mike', posts: 98, helpfulVotes: 167 },
        { name: '@warrior_tom', posts: 81, helpfulVotes: 134 }
      ]
    }
  }
};

const riskDataByPeriod: Record<string, RiskData> = {
  '7d': {
    churnRisk: [
      { id: 1, name: 'Mark van der Berg', lastActive: '8 dagen geleden', previousActivity: 'Zeer actief', riskLevel: 'Hoog' }
    ],
    ambassadors: [
      { id: 1, name: '@discipline_daniel', contributions: 14, helpfulVotes: 22, engagement: 'Uitstekend' }
    ]
  },
  '30d': {
    churnRisk: [
      { id: 1, name: 'Mark van der Berg', lastActive: '14 dagen geleden', previousActivity: 'Zeer actief', riskLevel: 'Hoog' },
      { id: 2, name: 'Thomas Jansen', lastActive: '12 dagen geleden', previousActivity: 'Actief', riskLevel: 'Gemiddeld' },
      { id: 3, name: 'Lucas de Vries', lastActive: '16 dagen geleden', previousActivity: 'Zeer actief', riskLevel: 'Hoog' }
    ],
    ambassadors: [
      { id: 1, name: '@discipline_daniel', contributions: 46, helpfulVotes: 89, engagement: 'Uitstekend' },
      { id: 2, name: '@alpha_mike', contributions: 38, helpfulVotes: 67, engagement: 'Zeer goed' },
      { id: 3, name: '@warrior_tom', contributions: 32, helpfulVotes: 54, engagement: 'Goed' }
    ]
  },
  '90d': {
    churnRisk: [
      { id: 1, name: 'Mark van der Berg', lastActive: '28 dagen geleden', previousActivity: 'Zeer actief', riskLevel: 'Hoog' },
      { id: 2, name: 'Thomas Jansen', lastActive: '22 dagen geleden', previousActivity: 'Actief', riskLevel: 'Gemiddeld' },
      { id: 3, name: 'Lucas de Vries', lastActive: '31 dagen geleden', previousActivity: 'Zeer actief', riskLevel: 'Hoog' },
      { id: 4, name: 'Sem Visser', lastActive: '19 dagen geleden', previousActivity: 'Actief', riskLevel: 'Gemiddeld' }
    ],
    ambassadors: [
      { id: 1, name: '@discipline_daniel', contributions: 120, helpfulVotes: 210, engagement: 'Uitstekend' },
      { id: 2, name: '@alpha_mike', contributions: 98, helpfulVotes: 167, engagement: 'Zeer goed' },
      { id: 3, name: '@warrior_tom', contributions: 81, helpfulVotes: 134, engagement: 'Goed' }
    ]
  }
};

// ==================================
//      REUSABLE ANIMATED COMPONENTS
// ==================================

const FunnelStep = ({ step, total }: { step: any; total: number }) => {
  const animatedValue = useCountUp(step.value);
  const animatedWidth = useCountUp(total > 0 ? (step.value / total) * 100 : 0);

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="w-1/3 text-right">
        <div className="text-sm text-[#B6C948]">{step.label}</div>
        {step.rate && (
          <div className="text-xs text-[#8BAE5A]">Rate: {step.rate}%</div>
        )}
      </div>
      <div className="w-2/3">
        <div 
          className="h-8 rounded-lg flex items-center justify-end pr-3 text-white font-bold text-sm bg-gradient-to-r"
          style={{ 
            width: `${animatedWidth}%`,
            minWidth: '15%',
            backgroundColor: step.color,
            transition: 'width 1.5s ease-out'
          }}
        >
          {Math.round(animatedValue)}
        </div>
      </div>
    </div>
  );
};

const PerformanceListItem = ({ item, type }: { item: any, type: 'academy' | 'training' }) => {
  const animatedCompletion = useCountUp(item.completionRate);
  const animatedMetaValue = useCountUp(type === 'academy' ? item.views : item.favorites);

  return (
      <div className="bg-[#181F17] rounded-lg p-4">
          <div className="flex items-center justify-between">
              <div>
                  <h3 className="font-semibold text-[#8BAE5A]">{item.name}</h3>
                  <p className="text-sm text-[#B6C948]">{Math.round(animatedMetaValue)} {type === 'academy' ? 'views' : 'favorieten'}</p>
              </div>
              <div className="text-right">
                  <div className="text-lg font-bold text-[#8BAE5A]">{Math.round(animatedCompletion)}%</div>
                  <div className="text-xs text-[#B6C948]">completion</div>
              </div>
          </div>
          <div className="mt-2 w-full bg-[#374151] rounded-full h-2">
              <div 
                  className="bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] h-2 rounded-full"
                  style={{ 
                      width: `${animatedCompletion}%`,
                      transition: 'width 1.5s ease-out'
                  }}
              ></div>
          </div>
      </div>
  );
}

const ForumContributorListItem = ({ contributor }: { contributor: any }) => {
  const animatedPosts = useCountUp(contributor.posts);
  const animatedVotes = useCountUp(contributor.helpfulVotes);

  return (
      <div className="bg-[#181F17] rounded-lg p-4">
          <div className="flex items-center justify-between">
              <div>
                  <h3 className="font-semibold text-[#8BAE5A]">{contributor.name}</h3>
                  <p className="text-sm text-[#B6C948]">{Math.round(animatedPosts)} posts</p>
              </div>
              <div className="text-right">
                  <div className="text-lg font-bold text-[#8BAE5A]">{Math.round(animatedVotes)}</div>
                  <div className="text-xs text-[#B6C948]">helpful votes</div>
              </div>
          </div>
      </div>
  );
}

const ChurnRiskListItem = ({ member }: { member: any }) => {
  return (
    <div className="bg-[#181F17] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-[#8BAE5A]">{member.name}</h3>
          <p className="text-sm text-[#B6C948]">Laatst actief: {member.lastActive}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          member.riskLevel === 'Hoog' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {member.riskLevel}
        </span>
      </div>
      <p className="text-xs text-[#B6C948] mb-3">Vorige activiteit: {member.previousActivity}</p>
      <button className="w-full bg-[#8BAE5A] text-black py-2 px-4 rounded-lg hover:bg-[#B6C948] transition-colors flex items-center justify-center gap-2">
        <EnvelopeIcon className="w-4 h-4" />
        Stuur "We missen je" e-mail
      </button>
    </div>
  );
};

const AmbassadorListItem = ({ ambassador }: { ambassador: any }) => {
  const animatedContributions = useCountUp(ambassador.contributions);
  const animatedVotes = useCountUp(ambassador.helpfulVotes);

  return (
    <div className="bg-[#181F17] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-[#8BAE5A]">{ambassador.name}</h3>
          <p className="text-sm text-[#B6C948]">{Math.round(animatedContributions)} bijdragen</p>
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400">
          {ambassador.engagement}
        </span>
      </div>
      <p className="text-xs text-[#B6C948] mb-3">{Math.round(animatedVotes)} helpful votes</p>
      <div className="flex gap-2">
        <button className="flex-1 bg-[#8BAE5A] text-black py-2 px-4 rounded-lg hover:bg-[#B6C948] transition-colors flex items-center justify-center gap-2">
          <EnvelopeIcon className="w-4 h-4" />
          Bedank e-mail
        </button>
        <button className="flex-1 bg-[#3B82F6] text-white py-2 px-4 rounded-lg hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2">
          <TrophyIcon className="w-4 h-4" />
          Leiderschapsrol
        </button>
      </div>
    </div>
  );
};

// Gauge component voor Community Health Score
const HealthGauge = ({ score, size = 160 }: { score: number; size?: number }) => {
  const animatedScore = useCountUp(score, 1500);
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progress = animatedScore / 100;
    const newOffset = circumference - progress * circumference;
    setOffset(newOffset);
  }, [animatedScore, circumference]);
  
  const getColor = (score: number) => {
    if (score >= 80) return '#10B981'; // green-500
    if (score >= 60) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth="10"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-[#8BAE5A]">{Math.round(animatedScore)}</div>
          <div className="text-sm text-[#B6C948]">Score</div>
        </div>
      </div>
    </div>
  );
};

// Funnel component voor User Journey
const UserJourneyFunnel = ({ data }: { data: UserJourney }) => {
  const steps = [
    { label: 'Nieuwe Registraties', value: data.newRegistrations, color: '#3B82F6' },
    { label: 'Geactiveerde Leden', value: data.activatedMembers, color: '#8BAE5A', rate: data.conversionRates.activation },
    { label: 'Betrokken Leden', value: data.engagedMembers, color: '#F59E0B', rate: data.conversionRates.engagement },
    { label: 'Power Users', value: data.powerUsers, color: '#EF4444', rate: data.conversionRates.powerUser }
  ];

  return (
    <div className="space-y-4 pt-4">
      {steps.map((step, index) => (
        <FunnelStep key={index} step={step} total={data.newRegistrations} />
      ))}
    </div>
  );
};

const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => {
  if (!text) return <>{children}</>;
  return (
    <RadixTooltip.Provider delayDuration={100}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content 
            sideOffset={5} 
            className="z-50 max-w-xs rounded-md bg-black px-4 py-2 text-sm text-white shadow-lg animate-in fade-in-0 zoom-in-95"
          >
            {text}
            <RadixTooltip.Arrow className="fill-black" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Read tab from URL parameter and set initial active tab
  const tabFromUrl = searchParams?.get('tab') as 'overview' | 'content' | 'actions' | 'financial' | 'users' | 'realtime' | 'technical';
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'actions' | 'financial' | 'users' | 'realtime' | 'technical'>(
    tabFromUrl || 'overview'
  );

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Selecteer data op basis van periode
  const communityHealthData = communityHealthDataByPeriod[selectedPeriod];
  const userJourneyData = userJourneyDataByPeriod[selectedPeriod];
  const contentPerformanceData = contentPerformanceDataByPeriod[selectedPeriod];
  const riskData = riskDataByPeriod[selectedPeriod];
  const financialData = financialDataByPeriod[selectedPeriod];
  const userSegmentationData = userSegmentationDataByPeriod[selectedPeriod];
  const realTimeData = realTimeDataByPeriod[selectedPeriod];
  const technicalData = technicalDataByPeriod[selectedPeriod];

  // ==================================
  //      UNCONDITIONAL HOOK CALLS
  // ==================================
  // Overview Tab
  const animatedOverallScore = useCountUp(communityHealthData.overallScore);
  const animatedEngagementRate = useCountUp(communityHealthData.engagementRate);
  const animatedCreationRatio = useCountUp(communityHealthData.creationRatio);
  const animatedResponsiveness = useCountUp(communityHealthData.responsiveness);
  const animatedConnectivityScore = useCountUp(communityHealthData.connectivityScore);

  // Content Tab
  const animatedAcademyCompletion = useCountUp(contentPerformanceData.academy.averageCompletionRate);
  const animatedTrainingCompletion = useCountUp(contentPerformanceData.training.averageCompletionRate);
  const animatedForumResponseTime = useCountUp(contentPerformanceData.forum.averageResponseTime);
  
  // Actions Tab
  const animatedChurnRiskCount = useCountUp(riskData.churnRisk.length);
  const animatedAmbassadorCount = useCountUp(riskData.ambassadors.length);

  // Financial Tab
  const animatedMRR = useCountUp(financialData.mrr);
  const animatedLTV = useCountUp(financialData.ltv);
  const animatedChurnRate = useCountUp(financialData.churnRate);
  const animatedNewSubscriptions = useCountUp(financialData.newSubscriptions);

  // Users Tab
  const animatedCurrentUsers = useCountUp(realTimeData.currentUsers);
  const animatedUptime = useCountUp(technicalData.uptime);
  const animatedErrorCount = useCountUp(technicalData.errorCount);

  // Animated counters for ledenstatistieken
  const ledenStats = [
    { label: 'Actieve leden deze maand', value: 1245 },
    { label: 'Nieuwe aanmeldingen deze week', value: 86 },
    { label: 'Gem. dagelijkse logins', value: 231 },
    { label: 'Actief coachingpakket', value: 112 },
  ];
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    ledenStats.forEach((stat, i) => {
      const end = stat.value;
      const duration = 900;
      const step = () => {
        setCounts(prev => {
          const next = [...prev];
          if (next[i] < end) {
            next[i] = Math.min(next[i] + Math.ceil(end / 40), end);
          }
          return next;
        });
      };
      if (counts[i] < end) {
        const interval = setInterval(step, duration / end * 40);
        return () => clearInterval(interval);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  // Communityactiviteit stats
  const communityStats = [
    { label: 'Posts afgelopen 7 dagen', value: 384 },
    { label: 'Meest actieve gebruiker', value: 46, prefix: '@discipline_daniel (' , suffix: ' posts)' },
    { label: 'Rapportages laatste week', value: 3, suffix: ' gemeld' },
    { label: 'Populairste squad', value: 24, prefix: 'Alpha Arnhem (' , suffix: ' leden)' },
  ];
  const [communityCounts, setCommunityCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    communityStats.forEach((stat, i) => {
      const end = stat.value;
      const duration = 900;
      const step = () => {
        setCommunityCounts(prev => {
          const next = [...prev];
          if (next[i] < end) {
            next[i] = Math.min(next[i] + Math.ceil(end / 40), end);
          }
          return next;
        });
      };
      if (communityCounts[i] < end) {
        const interval = setInterval(step, duration / end * 40);
        return () => clearInterval(interval);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityCounts]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Elite Command Center</h1>
          <p className="text-[#B6C948] mt-2">Strategisch overzicht van je Top Tier Men platform</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="90d">Laatste 90 dagen</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Community Health
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'content'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Content Performance
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'actions'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Actiegerichte Inzichten
        </button>
        <button
          onClick={() => setActiveTab('financial')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'financial'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Financiële Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Gebruikers Segmentatie
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'realtime'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Real-time Activiteit
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`flex-shrink-0 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'technical'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Technische Performance
        </button>
            </div>

      {activeTab === 'overview' && (
        <>
          {/* Community Health Score */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <TooltipWrapper text="Een algemene score (1-100) die de gezondheid van de community meet. Berekend op basis van engagement, content creatie, en de activiteit van leden.">
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2 cursor-help">
                    <HeartIcon className="w-6 h-6" />
                    Community Health Score
                  </h2>
                </TooltipWrapper>
                <p className="text-[#B6C948] text-sm">Algehele gezondheid van je community</p>
            </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedOverallScore)}/100</div>
                <div className="text-sm text-[#B6C948]">Gezondheidsscore</div>
          </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center">
                <TooltipWrapper text="Deze score vertegenwoordigt de algehele community gezondheid. Een hogere score is beter. De kleur verandert van rood naar groen naarmate de score stijgt.">
                  <div className="cursor-help">
                    <HealthGauge score={communityHealthData.overallScore} />
                  </div>
                </TooltipWrapper>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TooltipWrapper text="Het percentage actieve leden dat reageert op content, deelneemt aan discussies of evenementen.">
                    <div className="bg-[#181F17] rounded-lg p-4 cursor-help">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#B6C948] text-sm">Engagement Rate</span>
                        <span className={`text-xs font-medium ${communityHealthData.trends.engagementRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {communityHealthData.trends.engagementRate > 0 ? '+' : ''}{communityHealthData.trends.engagementRate}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedEngagementRate)}%</div>
                    </div>
                  </TooltipWrapper>
                  
                  <TooltipWrapper text="De verhouding tussen leden die content consumeren en leden die actief content creëren.">
                    <div className="bg-[#181F17] rounded-lg p-4 cursor-help">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#B6C948] text-sm">Creation Ratio</span>
                        <span className={`text-xs font-medium ${communityHealthData.trends.creationRatio > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {communityHealthData.trends.creationRatio > 0 ? '+' : ''}{communityHealthData.trends.creationRatio}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedCreationRatio)}%</div>
                    </div>
                  </TooltipWrapper>
                  
                  <TooltipWrapper text="De gemiddelde tijd die nodig is om te reageren op vragen of posts in de community. Een lagere tijd is beter.">
                    <div className="bg-[#181F17] rounded-lg p-4 cursor-help">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#B6C948] text-sm">Responsiviteit</span>
                        <span className={`text-xs font-medium ${communityHealthData.trends.responsiveness < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {communityHealthData.trends.responsiveness > 0 ? '+' : ''}{communityHealthData.trends.responsiveness.toFixed(1)}min
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#8BAE5A]">{animatedResponsiveness.toFixed(1)}min</div>
                    </div>
                  </TooltipWrapper>
                  
                  <TooltipWrapper text="Een score die aangeeft hoe verbonden leden met elkaar zijn. Gebaseerd op connecties, groepsdeelname en interacties.">
                    <div className="bg-[#181F17] rounded-lg p-4 cursor-help">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#B6C948] text-sm">Connectiviteit</span>
                        <span className={`text-xs font-medium ${communityHealthData.trends.connectivityScore > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {communityHealthData.trends.connectivityScore > 0 ? '+' : ''}{communityHealthData.trends.connectivityScore}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedConnectivityScore)}</div>
                    </div>
                  </TooltipWrapper>
                </div>
              </div>
            </div>
          </div>

          {/* User Journey Funnel */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Toont de reis van een nieuw lid naar een 'power user'. Helpt bij het identificeren van afhaakmomenten.">
              <div className="flex items-center justify-between mb-2 cursor-help">
          <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <ArrowTrendingUpIcon className="w-6 h-6" />
                    User Journey Funnel
                  </h2>
                  <p className="text-[#B6C948] text-sm">Gebruikersreis en conversie rates</p>
          </div>
                <div className="text-sm text-[#B6C948]">
                  {selectedPeriod === '7d' && 'Laatste 7 dagen'}
                  {selectedPeriod === '30d' && 'Laatste 30 dagen'}
                  {selectedPeriod === '90d' && 'Laatste 90 dagen'}
            </div>
          </div>
            </TooltipWrapper>
            
            <UserJourneyFunnel data={userJourneyData} />
        </div>
        </>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Academy Performance */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Analyse van de prestaties van de Academy modules. Meet voltooiingspercentages en populariteit.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <AcademicCapIcon className="w-6 h-6" />
                    Academy Performance
                  </h2>
                  <p className="text-[#B6C948] text-sm">Module completion rates en populariteit</p>
            </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedAcademyCompletion)}%</div>
                  <div className="text-sm text-[#B6C948]">Gem. completion rate</div>
            </div>
          </div>
            </TooltipWrapper>
            
            <div className="space-y-4">
              {contentPerformanceData.academy.topModules.map((module: any, index: number) => (
                <PerformanceListItem key={index} item={module} type="academy" />
              ))}
            </div>
          </div>

          {/* Training Performance */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Analyse van de prestaties van de trainingen. Meet voltooiing en hoeveel workouts als favoriet zijn gemarkeerd.">
              <div className="flex items-center justify-between mb-6 cursor-help">
          <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <FireIcon className="w-6 h-6" />
                    Training Performance
                  </h2>
                  <p className="text-[#B6C948] text-sm">Workout completion en favorieten</p>
          </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedTrainingCompletion)}%</div>
                  <div className="text-sm text-[#B6C948]">Gem. completion rate</div>
          </div>
        </div>
            </TooltipWrapper>
            
            <div className="space-y-4">
              {contentPerformanceData.training.topWorkouts.map((workout: any, index: number) => (
                <PerformanceListItem key={index} item={workout} type="training" />
              ))}
            </div>
          </div>

          {/* Forum Performance */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Analyse van forumactiviteit. Toont de meest actieve bijdragers en de gemiddelde reactietijd.">
              <div className="flex items-center justify-between mb-6 cursor-help">
          <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    Forum Performance
                  </h2>
                  <p className="text-[#B6C948] text-sm">Top contributors en engagement</p>
          </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{animatedForumResponseTime.toFixed(1)}min</div>
                  <div className="text-sm text-[#B6C948]">Gem. response time</div>
                </div>
                </div>
            </TooltipWrapper>
            
            <div className="space-y-4">
              {contentPerformanceData.forum.topContributors.map((contributor: any, index: number) => (
                <ForumContributorListItem key={index} contributor={contributor} />
              ))}
              </div>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Churn Risk */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Leden die recent weinig tot geen activiteit hebben vertoond en het risico lopen het platform te verlaten.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    Risico op Churn
                  </h2>
                  <p className="text-[#B6C948] text-sm">Leden die risico lopen om af te haken</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{Math.round(animatedChurnRiskCount)}</div>
                  <div className="text-sm text-[#B6C948]">Hoog risico</div>
                </div>
              </div>
            </TooltipWrapper>
            
            <div className="space-y-4">
              {riskData.churnRisk.map((member: any, index: number) => (
                <ChurnRiskListItem key={member.id} member={member} />
            ))}
          </div>
        </div>

          {/* Ambassador Spotlight */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Zeer actieve en positieve leden die kunnen worden ingezet als ambassadeurs voor de community.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <StarIcon className="w-6 h-6" />
                    Ambassadeur Spotlight
                  </h2>
                  <p className="text-[#B6C948] text-sm">Potentiële community leiders</p>
            </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedAmbassadorCount)}</div>
                  <div className="text-sm text-[#B6C948]">Kandidaten</div>
                </div>
              </div>
            </TooltipWrapper>
            
            <div className="space-y-4">
              {riskData.ambassadors.map((ambassador: any, index: number) => (
                <AmbassadorListItem key={ambassador.id} ambassador={ambassador} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-6">
          {/* MRR Overview */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Monthly Recurring Revenue - De maandelijkse terugkerende inkomsten. Dit is de belangrijkste KPI voor abonnementsbedrijven.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6" />
                    Maandelijkse Terugkerende Inkomsten (MRR)
                  </h2>
                  <p className="text-[#B6C948] text-sm">Financiële gezondheid van het platform</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#8BAE5A]">€{Math.round(animatedMRR).toLocaleString()}</div>
                  <div className="text-sm text-green-400">+{financialData.mrrGrowth}% deze maand</div>
                </div>
              </div>
            </TooltipWrapper>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialData.mrrHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#B6C948" />
                  <YAxis stroke="#B6C948" />
                  <Line type="monotone" dataKey="value" stroke="#8BAE5A" strokeWidth={3} dot={{ fill: '#8BAE5A' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TooltipWrapper text="Customer Lifetime Value - De gemiddelde totale waarde van een lid over de gehele duur van zijn lidmaatschap.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">Customer LTV</span>
                  <span className="text-green-400 text-xs">+12%</span>
                </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">€{Math.round(animatedLTV)}</div>
                <div className="text-xs text-[#B6C948]">Gemiddelde waarde per lid</div>
              </div>
            </TooltipWrapper>

            <TooltipWrapper text="Churn Rate - Het percentage betalende leden dat in de afgelopen maand heeft opgezegd.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">Churn Rate</span>
                  <span className="text-red-400 text-xs">+0.3%</span>
                </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">{animatedChurnRate.toFixed(1)}%</div>
                <div className="text-xs text-[#B6C948]">Maandelijkse uitval</div>
              </div>
            </TooltipWrapper>

            <TooltipWrapper text="Nieuwe betalende leden die deze maand zijn toegevoegd.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">Nieuwe Abonnementen</span>
                  <span className="text-green-400 text-xs">+15%</span>
                </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedNewSubscriptions)}</div>
                <div className="text-xs text-[#B6C948]">Deze maand</div>
              </div>
            </TooltipWrapper>

            <TooltipWrapper text="De verhouding tussen wat je verdient aan een klant en wat je uitgeeft om hem te werven.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">LTV/CAC Ratio</span>
                  <span className="text-green-400 text-xs">+8%</span>
                </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">4.2x</div>
                <div className="text-xs text-[#B6C948]">Gezonde verhouding</div>
              </div>
            </TooltipWrapper>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Top Active Users */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="De meest actieve leden van de afgelopen periode. Deze zijn je super-users en potentiële ambassadeurs.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6" />
                    Top 10 Actieve Leden
                  </h2>
                  <p className="text-[#B6C948] text-sm">Leaderboard van super-users</p>
                </div>
              </div>
            </TooltipWrapper>
            
            <div className="space-y-3">
              {userSegmentationData.topActiveUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between bg-[#181F17] rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-[#3A4D23] text-[#8BAE5A]'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-[#8BAE5A]">{user.name}</div>
                      <div className="text-sm text-[#B6C948]">Laatst actief: {user.lastActive}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#8BAE5A]">{user.activity}</div>
                    <div className="text-xs text-[#B6C948]">activiteit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Segmentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <TooltipWrapper text="Verdeling van het #1 Doel dat gebruikers kiezen bij de onboarding. Dit vertelt je waar de vraag en interesse van je markt ligt.">
                <div className="flex items-center justify-between mb-6 cursor-help">
                  <div>
                    <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                      <UserGroupIcon className="w-6 h-6" />
                      Segmentatie op Hoofddoel
                    </h2>
                    <p className="text-[#B6C948] text-sm">Waar ligt de focus van je leden?</p>
                  </div>
                </div>
              </TooltipWrapper>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userSegmentationData.goalSegmentation}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="percentage"
                      label={({ goal, percentage }) => `${goal}: ${percentage}%`}
                    >
                      {userSegmentationData.goalSegmentation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#8BAE5A', '#B6C948', '#F59E0B'][index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <TooltipWrapper text="Leden die zich hebben geregistreerd maar nog nooit één missie of training hebben voltooid. Dit segment heeft een gerichte her-activatie campagne nodig.">
                <div className="flex items-center justify-between mb-6 cursor-help">
                  <div>
                    <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-6 h-6" />
                      Inactieve Gebruikers
                    </h2>
                    <p className="text-[#B6C948] text-sm">Geen eerste actie voltooid</p>
                  </div>
                </div>
              </TooltipWrapper>
              
              <div className="space-y-3">
                {userSegmentationData.inactiveUsers.map((user, index) => (
                  <div key={index} className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-[#8BAE5A]">{user.name}</div>
                        <div className="text-sm text-[#B6C948]">{user.email}</div>
                      </div>
                      <span className="text-red-400 text-sm font-medium">{user.daysInactive} dagen</span>
                    </div>
                    <div className="text-xs text-[#B6C948]">Geregistreerd: {user.registeredDate}</div>
                    <button className="w-full mt-3 bg-[#8BAE5A] text-black py-2 px-4 rounded-lg hover:bg-[#B6C948] transition-colors flex items-center justify-center gap-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      Stuur welkomst e-mail
            </button>
          </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {/* Live Users */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Het aantal momenteel ingelogde gebruikers op het platform.">
              <div className="flex items-center justify-between mb-6 cursor-help">
          <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <UserIcon className="w-6 h-6" />
                    Live Gebruikers Nu
                  </h2>
                  <p className="text-[#B6C948] text-sm">Real-time platform activiteit</p>
          </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-[#8BAE5A]">{Math.round(animatedCurrentUsers)}</div>
                  <div className="text-sm text-[#B6C948]">actieve gebruikers</div>
            </div>
            </div>
            </TooltipWrapper>
            </div>

          {/* Real-time Events Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <TooltipWrapper text="Auto-updating logboek van de meest recente acties op het platform.">
                <div className="flex items-center justify-between mb-6 cursor-help">
                  <div>
                    <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                      <BellIcon className="w-6 h-6" />
                      Real-time Gebeurtenissen
                    </h2>
                    <p className="text-[#B6C948] text-sm">Live activiteit feed</p>
          </div>
                </div>
              </TooltipWrapper>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeData.recentEvents.map((event, index) => (
                  <div key={index} className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#8BAE5A] rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm text-[#B6C948]">{event.time}</div>
                        <div className="font-medium text-[#8BAE5A]">{event.user}</div>
                        <div className="text-white">{event.action}</div>
                        {event.details && (
                          <div className="text-sm text-[#B6C948] mt-1">{event.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
        </div>
      </div>

      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <TooltipWrapper text="Content die op dit moment de meeste interactie krijgt. Hiermee kun je direct inhaken op trending topics binnen je community.">
                <div className="flex items-center justify-between mb-6 cursor-help">
                  <div>
                    <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                      <FireIcon className="w-6 h-6" />
                      Populaire Content (Vandaag)
                    </h2>
                    <p className="text-[#B6C948] text-sm">Trending topics en content</p>
          </div>
        </div>
              </TooltipWrapper>
              
              <div className="space-y-4">
                {realTimeData.trendingContent.map((content, index) => (
                  <div key={index} className="bg-[#181F17] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-[#8BAE5A]">{content.title}</div>
                        <div className="text-sm text-[#B6C948]">{content.type}</div>
                      </div>
                      <span className="text-xs font-medium bg-[#3A4D23] text-[#8BAE5A] px-2 py-1 rounded">
                        {content.trend}
              </span>
                    </div>
                    <div className="text-lg font-bold text-[#8BAE5A]">{content.interactions}</div>
                    <div className="text-xs text-[#B6C948]">interacties</div>
            </div>
          ))}
        </div>
      </div>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TooltipWrapper text="Gemiddelde responstijd van de API in milliseconden. Lagere waarden betekenen snellere prestaties.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">API Response Time</span>
                  <span className="text-green-400 text-xs">-12ms</span>
          </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">{technicalData.apiResponseTime}ms</div>
                <div className="text-xs text-[#B6C948]">Gemiddelde responstijd</div>
              </div>
            </TooltipWrapper>

            <TooltipWrapper text="Het percentage van de tijd dat het platform beschikbaar is geweest.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">Uptime</span>
                  <span className="text-green-400 text-xs">+0.1%</span>
          </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">{animatedUptime.toFixed(1)}%</div>
                <div className="text-xs text-[#B6C948]">Platform beschikbaarheid</div>
              </div>
            </TooltipWrapper>

            <TooltipWrapper text="Aantal server- of applicatie-errors van de laatste 24 uur.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">Error Count</span>
                  <span className="text-red-400 text-xs">+1</span>
          </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">{Math.round(animatedErrorCount)}</div>
                <div className="text-xs text-[#B6C948]">Laatste 24 uur</div>
      </div>
            </TooltipWrapper>

            <TooltipWrapper text="Gemiddelde laadtijd van alle pagina's in seconden.">
              <div className="bg-[#181F17] rounded-lg p-6 cursor-help">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#B6C948] text-sm">Avg Page Load</span>
                  <span className="text-green-400 text-xs">-0.3s</span>
                </div>
                <div className="text-2xl font-bold text-[#8BAE5A]">2.2s</div>
                <div className="text-xs text-[#B6C948]">Gemiddelde laadtijd</div>
              </div>
            </TooltipWrapper>
          </div>

          {/* Page Load Times */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Gedetailleerde laadtijden per pagina. Helpt bij het identificeren van performance bottlenecks.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <ClockIcon className="w-6 h-6" />
                    Pagina Laadtijden
                  </h2>
                  <p className="text-[#B6C948] text-sm">Performance per pagina</p>
                </div>
              </div>
            </TooltipWrapper>
            
            <div className="space-y-4">
              {technicalData.pageLoadTimes.map((page, index) => (
                <div key={index} className="bg-[#181F17] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-[#8BAE5A]">{page.page}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      page.status === 'good' ? 'bg-green-900/30 text-green-400' :
                      page.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {page.status === 'good' ? 'Goed' : page.status === 'warning' ? 'Waarschuwing' : 'Kritiek'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-[#374151] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            page.status === 'good' ? 'bg-green-500' :
                            page.status === 'warning' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((page.loadTime / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-[#8BAE5A]">{page.loadTime}s</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Log */}
          <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
            <TooltipWrapper text="Gedetailleerd overzicht van alle errors die zijn opgetreden. Helpt bij het identificeren en oplossen van problemen.">
              <div className="flex items-center justify-between mb-6 cursor-help">
                <div>
                  <h2 className="text-xl font-bold text-[#8BAE5A] flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    Error Log
                  </h2>
                  <p className="text-[#B6C948] text-sm">Server en applicatie errors</p>
                </div>
              </div>
            </TooltipWrapper>
            
            <div className="space-y-3">
              {technicalData.errorLog.map((error, index) => (
                <div key={index} className="bg-[#181F17] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-[#B6C948]">{error.time}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      error.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                      error.severity === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {error.severity === 'high' ? 'Hoog' : error.severity === 'medium' ? 'Gemiddeld' : 'Laag'}
                    </span>
                  </div>
                  <div className="text-white">{error.error}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-[#8BAE5A]">Loading...</div></div>}>
      <AdminDashboardContent />
    </Suspense>
  );
} 