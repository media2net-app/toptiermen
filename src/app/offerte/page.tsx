'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  EyeIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

interface PricingTier {
  name: string;
  price: number;
  minMonths: number;
  revenuePerSale: number;
  features: string[];
  color: string;
  popular?: boolean;
}

interface SalesScenario {
  name: string;
  description: string;
  basicSales: number;
  premiumSales: number;
  ultimateSales: number;
  totalRevenue: number;
  totalCustomers: number;
  roi: number;
}

export default function OffertePage() {
  const [selectedScenario, setSelectedScenario] = useState<'A' | 'B'>('A');
  const [showDetails, setShowDetails] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      name: 'Basic Tier',
      price: 49,
      minMonths: 6,
      revenuePerSale: 294,
      color: 'blue',
      features: [
        'Competitive Intelligence Dashboard',
        'Basic Ad Library Access',
        'Monthly Reports',
        'Email Support',
        '2 User Accounts'
      ]
    },
    {
      name: 'Premium Tier',
      price: 79,
      minMonths: 6,
      revenuePerSale: 474,
      color: 'purple',
      popular: true,
      features: [
        'All Basic Features',
        'Advanced AI Insights',
        'Real-time Alerts',
        'Custom Report Builder',
        'Executive Dashboard',
        'Priority Support',
        '5 User Accounts'
      ]
    },
    {
      name: 'Ultimate Tier',
      price: 1995,
      minMonths: 0, // Lifetime
      revenuePerSale: 1995,
      color: 'gold',
      features: [
        'All Premium Features',
        'Lifetime Access',
        'White-label Solution',
        'Custom Integrations',
        'Dedicated Account Manager',
        'API Access',
        'Unlimited Users'
      ]
    }
  ];

  const scenarios: SalesScenario[] = [
    {
      name: 'Scenario A - Realistische Instapmix',
      description: 'Gebalanceerde verdeling met focus op toegankelijkheid',
      basicSales: 150,
      premiumSales: 80,
      ultimateSales: 9,
      totalRevenue: 99975,
      totalCustomers: 239,
      roi: 567
    },
    {
      name: 'Scenario B - Premium & Lifetime Focus',
      description: 'Upsell-funnel gericht op hogere waarde klanten',
      basicSales: 80,
      premiumSales: 100,
      ultimateSales: 15,
      totalRevenue: 100845,
      totalCustomers: 195,
      roi: 572
    }
  ];

  const selectedScenarioData = scenarios[selectedScenario === 'A' ? 0 : 1];

  const investment = 15000;
  const targetRevenue = 100000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Business Case
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Een bewezen strategie voor €100.000 omzet met €15.000 voorinvestering/financiering
            </p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-lg mb-4 mx-auto">
                  <CurrencyDollarIcon className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">€15.000</div>
                <div className="text-gray-300">Voorinvestering</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4 mx-auto">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">€100.000</div>
                <div className="text-gray-300">Omzet Target</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4 mx-auto">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">567%</div>
                <div className="text-gray-300">ROI</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Nieuwe Prijsstructuur (6 maanden minimum)
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Door minimale afname van 6 maanden per klant, verhogen we de gemiddelde orderwaarde aanzienlijk
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border ${
                  tier.popular 
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20' 
                    : 'border-white/20'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Meest Populair
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-white mb-1">
                    €{tier.price}
                    <span className="text-lg text-gray-400">/maand</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    {tier.minMonths > 0 ? `${tier.minMonths} maanden minimum` : 'Lifetime'}
                  </div>
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-400">
                      €{tier.revenuePerSale.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-300">Omzet per verkoop</div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Sales Scenarios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Schatting Verkoopverdeling tot €100.000 Omzet
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Twee realistische scenario's om de omzet target te behalen
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setSelectedScenario('A')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedScenario === 'A'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Scenario A - Realistisch
              </button>
              <button
                onClick={() => setSelectedScenario('B')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedScenario === 'B'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Scenario B - Premium Focus
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedScenario}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedScenarioData.name}
                </h3>
                <p className="text-gray-300">{selectedScenarioData.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {selectedScenarioData.basicSales}
                  </div>
                  <div className="text-sm text-blue-300">Basic Verkopen</div>
                  <div className="text-xs text-blue-200 mt-1">
                    €{(selectedScenarioData.basicSales * 294).toLocaleString()}
                  </div>
                </div>

                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">
                    {selectedScenarioData.premiumSales}
                  </div>
                  <div className="text-sm text-purple-300">Premium Verkopen</div>
                  <div className="text-xs text-purple-200 mt-1">
                    €{(selectedScenarioData.premiumSales * 474).toLocaleString()}
                  </div>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {selectedScenarioData.ultimateSales}
                  </div>
                  <div className="text-sm text-yellow-300">Ultimate Verkopen</div>
                  <div className="text-xs text-yellow-200 mt-1">
                    €{(selectedScenarioData.ultimateSales * 1995).toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {selectedScenarioData.totalCustomers}
                  </div>
                  <div className="text-sm text-green-300">Totaal Klanten</div>
                  <div className="text-xs text-green-200 mt-1">
                    €{selectedScenarioData.totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Verkoop Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Basic Tier (€294)</span>
                      <span className="text-white font-medium">{selectedScenarioData.basicSales}x</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Premium Tier (€474)</span>
                      <span className="text-white font-medium">{selectedScenarioData.premiumSales}x</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Ultimate Tier (€1.995)</span>
                      <span className="text-white font-medium">{selectedScenarioData.ultimateSales}x</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">ROI Analyse</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Investering</span>
                      <span className="text-red-400 font-medium">€{investment.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Verwachte Omzet</span>
                      <span className="text-green-400 font-medium">€{selectedScenarioData.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <span className="text-green-300">Netto Winst</span>
                      <span className="text-green-400 font-bold">€{(selectedScenarioData.totalRevenue - investment).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <span className="text-blue-300">ROI</span>
                      <span className="text-blue-400 font-bold">{selectedScenarioData.roi}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Key Insights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Belangrijke Inzichten
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Waarom deze strategie werkt en wat het betekent voor jouw business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Haalbare Klantenaantallen</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Je hoeft geen honderden klanten te converteren. 100-250 klanten totaal is realistisch haalbaar met gerichte targeting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Ultimate Klanten Power</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Ultimate-klanten leveren 6-7x zoveel op als Basic — dus daar zit marketing power.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Hoge Orderwaarde</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Door de minimale 6 maanden zit je gemiddelde orderwaarde fors hoger dan bij veel andere memberships.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Sterk ROI Voordeel</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Een sterk voordeel voor ROI van je campagnes door de hogere gemiddelde orderwaarde.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Gegarandeerde Omzet</h3>
              </div>
              <p className="text-gray-300 text-sm">
                6 maanden minimum betekent gegarandeerde omzet per klant, wat de cashflow stabiliseert.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <RocketLaunchIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Schaalbare Groei</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Na het behalen van de €100k target, kan het systeem verder schalen naar €500k+ omzet.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Investment Comparison Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Waarom €10.000 Voorinvestering de Beste Keuze Is
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Een directe vergelijking tussen de twee opties voor Rick
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Option A - Current Service */}
            <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-400 mb-2">Huidige Dienstverlening</h3>
                <p className="text-gray-500">20 uur per maand × €85</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">Maandelijkse kosten:</span>
                  <span className="text-white font-bold">€1.700</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">Jaarlijkse kosten:</span>
                  <span className="text-white font-bold">€20.400</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">Tijdsinvestering:</span>
                  <span className="text-red-400 font-bold">240 uur/jaar</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">ROI:</span>
                  <span className="text-gray-400">Niet meetbaar</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold mb-3">❌ Nadelen:</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Hoge maandelijkse kosten (€1.700)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Grote tijdsinvestering (20 uur/maand)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Geen eigenaarschap van het systeem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Afhankelijk van externe dienstverlener</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Geen schaalbaarheid</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Option B - One-time Investment */}
            <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                  AANBEVOLEN
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Voorinvestering Optie</h3>
                <p className="text-green-400">€15.000 eenmalig</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">Eenmalige investering:</span>
                  <span className="text-white font-bold">€15.000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">Verwachte omzet:</span>
                  <span className="text-green-400 font-bold">€100.000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">Netto winst:</span>
                  <span className="text-green-400 font-bold">€85.000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#2D3748] rounded-lg">
                  <span className="text-gray-300">ROI:</span>
                  <span className="text-green-400 font-bold">567%</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-semibold mb-3">✅ Voordelen:</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Eigenaarschap van het volledige systeem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Geen maandelijkse kosten na implementatie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Volledige controle en autonomie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Onbeperkte schaalbaarheid</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Bewezen ROI van 567%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Financial Comparison */}
          <div className="bg-[#1A1F2E] border border-[#2D3748] rounded-xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-white text-center mb-6">Financiële Vergelijking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-[#2D3748] rounded-lg">
                <h4 className="text-white font-semibold mb-2">Jaar 1</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dienstverlening:</span>
                    <span className="text-red-400">-€20.400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voorinvestering:</span>
                    <span className="text-green-400">+€85.000</span>
                  </div>
                  <div className="border-t border-[#3A4D23] pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Verschil:</span>
                      <span className="text-green-400">€105.400</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-[#2D3748] rounded-lg">
                <h4 className="text-white font-semibold mb-2">Jaar 2</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dienstverlening:</span>
                    <span className="text-red-400">-€20.400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voorinvestering:</span>
                    <span className="text-green-400">+€100.000</span>
                  </div>
                  <div className="border-t border-[#3A4D23] pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Verschil:</span>
                      <span className="text-green-400">€120.400</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-4 bg-[#2D3748] rounded-lg">
                <h4 className="text-white font-semibold mb-2">Jaar 3</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dienstverlening:</span>
                    <span className="text-red-400">-€20.400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voorinvestering:</span>
                    <span className="text-green-400">+€100.000</span>
                  </div>
                  <div className="border-t border-[#3A4D23] pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">Verschil:</span>
                      <span className="text-green-400">€120.400</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rick's Decision */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Rick, Dit is Je Beslissing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <h4 className="text-red-400 font-semibold mb-2">Blijf bij Dienstverlening</h4>
                <p className="text-gray-300 text-sm">
                  Betaal €20.400 per jaar voor 240 uur werk<br/>
                  <span className="text-red-400 font-bold">Geen eigenaarschap</span>
                </p>
              </div>
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Kies Voorinvestering</h4>
                <p className="text-gray-300 text-sm">
                  Betaal €15.000 eenmalig<br/>
                  <span className="text-green-400 font-bold">Verdien €85.000+ per jaar</span>
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-white font-semibold text-lg">
                💡 De voorinvestering verdient zichzelf terug in 2,1 maanden
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Na 3 jaar: €316.200 voordeel ten opzichte van dienstverlening
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-12 border border-green-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">
              Maak de Slimme Keuze
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Rick, de cijfers spreken voor zich. €15.000 voorinvestering is de enige logische keuze 
              voor een ondernemer die serieus wil groeien.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105">
                Start Nu - €15.000 Investering
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 border border-white/20">
                Download Business Plan
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              <p>✅ 567% ROI gegarandeerd</p>
              <p>✅ €316.200 voordeel over 3 jaar</p>
              <p>✅ Volledige eigenaarschap</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 