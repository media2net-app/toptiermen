'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RocketLaunchIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  StarIcon,
  FireIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  BellIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface PreLaunchData {
  totalSignups: number;
  targetSignups: number;
  daysUntilLaunch: number;
  conversionRate: number;
  revenueProjection: number;
}

interface SignupData {
  id: string;
  email: string;
  name: string;
  source: string;
  signupDate: string;
  status: 'confirmed' | 'pending' | 'converted';
  discountCode: string;
  packageType: 'basic' | 'premium' | 'ultimate';
  originalPrice: number;
  discountedPrice: number;
}

export default function PreLaunchPage() {
  const [preLaunchData, setPreLaunchData] = useState<PreLaunchData | null>(null);
  const [signups, setSignups] = useState<SignupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSignupModal, setShowAddSignupModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockPreLaunchData: PreLaunchData = {
      totalSignups: 12,
      targetSignups: 20,
      daysUntilLaunch: 23,
      conversionRate: 60,
      revenueProjection: 8500 // Updated based on new pricing
    };

    // Helper function to calculate prices
    const calculatePrices = (packageType: 'basic' | 'premium' | 'ultimate', isYearly: boolean = false) => {
      const basePrices = {
        basic: 49,
        premium: 79,
        ultimate: 1995
      };
      
      const basePrice = basePrices[packageType];
      const yearlyDiscount = isYearly ? 0.10 : 0; // 10% discount for yearly
      const originalPrice = basePrice * 6; // 6-month minimum
      const discountedPrice = originalPrice * (1 - yearlyDiscount);
      
      return { originalPrice, discountedPrice };
    };

    const mockSignups: SignupData[] = [
      {
        id: "1",
        email: "john.doe@example.com",
        name: "John Doe",
        source: "Facebook Ad",
        signupDate: "2025-08-01",
        status: "confirmed",
        discountCode: "EARLY50",
        packageType: "premium",
        ...calculatePrices("premium", false)
      },
      {
        id: "2",
        email: "sarah.smith@example.com",
        name: "Sarah Smith",
        source: "Instagram",
        signupDate: "2025-08-02",
        status: "pending",
        discountCode: "EARLY50",
        packageType: "basic",
        ...calculatePrices("basic", false)
      },
      {
        id: "3",
        email: "mike.wilson@example.com",
        name: "Mike Wilson",
        source: "Email Campaign",
        signupDate: "2025-08-03",
        status: "converted",
        discountCode: "EARLY50",
        packageType: "ultimate",
        ...calculatePrices("ultimate", false)
      },
      {
        id: "4",
        email: "lisa.brown@example.com",
        name: "Lisa Brown",
        source: "LinkedIn",
        signupDate: "2025-08-04",
        status: "confirmed",
        discountCode: "EARLY50",
        packageType: "premium",
        ...calculatePrices("premium", true) // Yearly subscription
      },
      {
        id: "5",
        email: "david.clark@example.com",
        name: "David Clark",
        source: "Google Ads",
        signupDate: "2025-08-05",
        status: "pending",
        discountCode: "EARLY50",
        packageType: "basic",
        ...calculatePrices("basic", false)
      },
      {
        id: "6",
        email: "emma.davis@example.com",
        name: "Emma Davis",
        source: "Facebook Ad",
        signupDate: "2025-08-06",
        status: "confirmed",
        discountCode: "EARLY50",
        packageType: "premium",
        ...calculatePrices("premium", false)
      },
      {
        id: "7",
        email: "james.miller@example.com",
        name: "James Miller",
        source: "Instagram",
        signupDate: "2025-08-07",
        status: "converted",
        discountCode: "EARLY50",
        packageType: "ultimate",
        ...calculatePrices("ultimate", true) // Yearly subscription
      },
      {
        id: "8",
        email: "anna.garcia@example.com",
        name: "Anna Garcia",
        source: "LinkedIn",
        signupDate: "2025-08-08",
        status: "pending",
        discountCode: "EARLY50",
        packageType: "basic",
        ...calculatePrices("basic", true) // Yearly subscription
      },
      {
        id: "9",
        email: "robert.johnson@example.com",
        name: "Robert Johnson",
        source: "Google Ads",
        signupDate: "2025-08-09",
        status: "confirmed",
        discountCode: "EARLY50",
        packageType: "premium",
        ...calculatePrices("premium", false)
      },
      {
        id: "10",
        email: "maria.rodriguez@example.com",
        name: "Maria Rodriguez",
        source: "Facebook Ad",
        signupDate: "2025-08-10",
        status: "converted",
        discountCode: "EARLY50",
        packageType: "ultimate",
        ...calculatePrices("ultimate", false)
      },
      {
        id: "11",
        email: "thomas.lee@example.com",
        name: "Thomas Lee",
        source: "Instagram",
        signupDate: "2025-08-11",
        status: "pending",
        discountCode: "EARLY50",
        packageType: "basic",
        ...calculatePrices("basic", false)
      },
      {
        id: "12",
        email: "jennifer.white@example.com",
        name: "Jennifer White",
        source: "LinkedIn",
        signupDate: "2025-08-12",
        status: "confirmed",
        discountCode: "EARLY50",
        packageType: "premium",
        ...calculatePrices("premium", true) // Yearly subscription
      }
    ];

    setPreLaunchData(mockPreLaunchData);
    setSignups(mockSignups);
    setLoading(false);
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-900/20';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'converted': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'basic': return 'text-blue-400';
      case 'premium': return 'text-purple-400';
      case 'ultimate': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const filteredSignups = signups.filter(signup => {
    if (filter === 'all') return true;
    return signup.status === filter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSignups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSignups = filteredSignups.slice(startIndex, endIndex);

  // Calculate total revenue
  const totalRevenue = filteredSignups.reduce((sum, signup) => sum + signup.discountedPrice, 0);
  const totalOriginalValue = filteredSignups.reduce((sum, signup) => sum + signup.originalPrice, 0);
  const totalDiscount = totalOriginalValue - totalRevenue;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading pre-launch data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pre-launch Campagne</h1>
          <p className="text-gray-400 mt-1">Email verzameling voor 10 september launch</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-semibold">NEW</span>
            </div>
          </div>
          <button 
            onClick={() => setShowAddSignupModal(true)}
            className="bg-[#3A4D23] hover:bg-[#4A5D33] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>Handmatig Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Launch Countdown */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🚀 Launch Countdown</h2>
          <p className="text-gray-300">10 september 2025 - We gaan live!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white mb-1">{preLaunchData?.daysUntilLaunch}</div>
            <div className="text-gray-300 text-sm">Dagen te gaan</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{preLaunchData?.totalSignups}</div>
            <div className="text-gray-300 text-sm">Email signups</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">{preLaunchData?.targetSignups}</div>
            <div className="text-gray-300 text-sm">Doel signups</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">{preLaunchData?.conversionRate}%</div>
            <div className="text-gray-300 text-sm">Conversie rate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Voortgang</span>
            <span>{Math.round((preLaunchData?.totalSignups || 0) / (preLaunchData?.targetSignups || 1) * 100)}%</span>
          </div>
          <div className="w-full bg-[#2D3748] rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(preLaunchData?.totalSignups || 0) / (preLaunchData?.targetSignups || 1) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Early Bird Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <FireIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Early Bird Korting</h3>
              <p className="text-gray-400 text-sm">50% korting voor pre-launch</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Code: EARLY50</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Geldig tot 10 september</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Alle pakketten</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Bonus Content</h3>
              <p className="text-gray-400 text-sm">Exclusieve pre-launch content</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Masterclass toegang</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Exclusieve templates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Priority support</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Projectie</h3>
              <p className="text-gray-400 text-sm">Verwachte omzet bij launch</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Projectie:</span>
              <span className="text-green-400 font-bold">€{preLaunchData?.revenueProjection.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Conversie:</span>
              <span className="text-blue-400 font-bold">{preLaunchData?.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Gemiddelde order:</span>
              <span className="text-purple-400 font-bold">€708</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Pakketten & Prijzen</h3>
            <p className="text-gray-400 text-sm">Minimaal 6 maanden, 10% korting bij jaarlijkse betaling</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic Tier */}
          <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-6">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">Basic Tier</h4>
              <div className="text-3xl font-bold text-blue-400">€49</div>
              <div className="text-gray-400 text-sm">per maand</div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Basis features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Email support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Community toegang</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">6 maanden minimum</div>
              <div className="text-white font-semibold">€294 totaal</div>
              <div className="text-green-400 text-sm">€264 bij jaarlijks (10% korting)</div>
            </div>
          </div>

          {/* Premium */}
          <div className="bg-[#2D3748] border-2 border-purple-500 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">POPULAIR</span>
            </div>
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">Premium</h4>
              <div className="text-3xl font-bold text-purple-400">€79</div>
              <div className="text-gray-400 text-sm">per maand</div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Alle Basic features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Exclusieve content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">1-op-1 coaching</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">6 maanden minimum</div>
              <div className="text-white font-semibold">€474 totaal</div>
              <div className="text-green-400 text-sm">€427 bij jaarlijks (10% korting)</div>
            </div>
          </div>

          {/* Ultimate Tier */}
          <div className="bg-[#2D3748] border border-[#4A5568] rounded-lg p-6">
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">Ultimate Tier</h4>
              <div className="text-3xl font-bold text-yellow-400">€1995</div>
              <div className="text-gray-400 text-sm">lifetime premium</div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Alle Premium features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Lifetime toegang</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">VIP community</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">Exclusieve events</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-1">Eenmalige betaling</div>
              <div className="text-white font-semibold">€1995 totaal</div>
              <div className="text-green-400 text-sm">Geen maandelijkse kosten</div>
            </div>
          </div>
        </div>
      </div>

      {/* Signups Table */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Email Signups</h2>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#2D3748] border border-[#3A4D23] text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="all">Alle statussen</option>
              <option value="confirmed">Bevestigd</option>
              <option value="pending">In behandeling</option>
              <option value="converted">Geconverteerd</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#2D3748]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Naam</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Bron</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Datum</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Pakket</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Originele Prijs</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Korting</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Omzet</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3748]">
              {currentSignups.map((signup) => (
                <tr key={signup.id} className="hover:bg-[#2D3748] transition-colors">
                  <td className="px-4 py-2 text-sm font-medium text-white">{signup.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{signup.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{signup.source}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{signup.signupDate}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={getPackageColor(signup.packageType)}>
                      {signup.packageType.charAt(0).toUpperCase() + signup.packageType.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-400 line-through">€{signup.originalPrice}</td>
                  <td className="px-4 py-2 text-sm text-green-400 font-mono">{signup.discountCode}</td>
                  <td className="px-4 py-2 text-sm text-white font-bold">€{signup.discountedPrice}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(signup.status)}`}>
                      {signup.status === 'confirmed' ? 'Bevestigd' : 
                       signup.status === 'pending' ? 'In behandeling' : 'Geconverteerd'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Revenue Summary */}
        <div className="mt-6 p-4 bg-[#2D3748] rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Totaal Omzet</p>
              <p className="text-white font-bold text-lg">€{totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Originele Waarde</p>
              <p className="text-gray-300 font-semibold">€{totalOriginalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Totaal Korting</p>
              <p className="text-green-400 font-semibold">€{totalDiscount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Gemiddelde Omzet</p>
              <p className="text-purple-400 font-semibold">€{(totalRevenue / filteredSignups.length).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Toon {startIndex + 1} tot {Math.min(endIndex, filteredSignups.length)} van {filteredSignups.length} resultaten
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-[#2D3748] border border-[#3A4D23] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A4D23] transition-colors"
              >
                Vorige
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#1E40AF] text-white'
                      : 'bg-[#2D3748] border border-[#3A4D23] text-white hover:bg-[#3A4D23]'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-[#2D3748] border border-[#3A4D23] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A4D23] transition-colors"
              >
                Volgende
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Marketing Channels Performance */}
      <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Marketing Kanalen Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#2D3748] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 font-bold text-sm">FB</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Facebook</h3>
                <p className="text-gray-400 text-sm">89 signups</p>
              </div>
            </div>
            <div className="text-green-400 text-sm">+12% deze week</div>
          </div>

          <div className="bg-[#2D3748] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 font-bold text-sm">IG</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Instagram</h3>
                <p className="text-gray-400 text-sm">67 signups</p>
              </div>
            </div>
            <div className="text-green-400 text-sm">+8% deze week</div>
          </div>

          <div className="bg-[#2D3748] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 font-bold text-sm">LI</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">LinkedIn</h3>
                <p className="text-gray-400 text-sm">45 signups</p>
              </div>
            </div>
            <div className="text-green-400 text-sm">+15% deze week</div>
          </div>

          <div className="bg-[#2D3748] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold text-sm">EM</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Email</h3>
                <p className="text-gray-400 text-sm">46 signups</p>
              </div>
            </div>
            <div className="text-green-400 text-sm">+5% deze week</div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-500/30">
        <h2 className="text-xl font-bold text-white mb-4">📋 Volgende Stappen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Deze Week</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Email sequence voor bevestigingen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Social media campagnes uitbreiden</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5" />
                <span>LinkedIn targeting optimaliseren</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Voor Launch</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Launch email voorbereiden</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Payment system testen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5" />
                <span>Support team voorbereiden</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 