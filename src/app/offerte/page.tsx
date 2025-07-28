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
  PresentationChartLineIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface SalesScenario {
  name: string;
  description: string;
  basicSales: number;
  premiumSales: number;
  ultimateSales: number;
  totalRevenue: number;
  totalCustomers: number;
  roi: number;
  marketingBudget: number;
  totalInvestment: number;
  netProfit: number;
  marketingRoi: number;
}

export default function OffertePage() {
  const [selectedScenario, setSelectedScenario] = useState<'A' | 'B'>('A');
  const [showDetails, setShowDetails] = useState(false);

  const scenarios: SalesScenario[] = [
    {
      name: 'Scenario A - Realistische Instapmix',
      description: 'Gebalanceerde verdeling met focus op toegankelijkheid',
      basicSales: 150,
      premiumSales: 80,
      ultimateSales: 9,
      totalRevenue: 99975,
      totalCustomers: 239,
      roi: 567,
      marketingBudget: 35850, // 239 customers / 2% conversion = 11,950 clicks * €0.30 CPC
      totalInvestment: 50850, // €15,000 + €35,850
      netProfit: 49125, // €99,975 - €50,850
      marketingRoi: 179 // (€99,975 - €35,850) / €35,850 * 100
    },
    {
      name: 'Scenario B - Premium & Lifetime Focus',
      description: 'Upsell-funnel gericht op hogere waarde klanten',
      basicSales: 80,
      premiumSales: 100,
      ultimateSales: 15,
      totalRevenue: 100845,
      totalCustomers: 195,
      roi: 572,
      marketingBudget: 29250, // 195 customers / 2% conversion = 9,750 clicks * €0.30 CPC
      totalInvestment: 44250, // €15,000 + €29,250
      netProfit: 56595, // €100,845 - €44,250
      marketingRoi: 193 // (€100,845 - €29,250) / €29,250 * 100
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
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-semibold">Belangrijke Opmerking</span>
              </div>
              <p className="text-yellow-200 text-sm text-center">
                <strong>€15.000 voorinvestering is exclusief marketing kosten.</strong> 
                Hieronder vind je realistische schattingen van de benodigde marketing budgetten.
              </p>
            </div>
            
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

      {/* Rick's Investment Choice - Key Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-blue-500/20"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Rick, hier is wat je krijgt met de voorinvestering van €15.000
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Option A - Upfront Investment */}
            <div className="bg-white/5 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Optie A: Voorinvestering €15.000</h3>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start">
                  <BoltIcon className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Onbeperkte uren beschikbaar</span>
                    <p className="text-sm">Ik werk elke dag volle focus aan Top Tier Men marketing</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <RocketLaunchIcon className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Volledige toewijding</span>
                    <p className="text-sm">Minder werk voor andere klanten = meer ruimte voor jouw project</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <TrophyIcon className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Snelle €100k behalen</span>
                    <p className="text-sm">Volle energie en focus om zo snel mogelijk het target te bereiken</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ShieldCheckIcon className="w-5 h-5 text-green-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Geen urenlimiet</span>
                    <p className="text-sm">Geen stress over tijd, gewoon resultaten behalen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Option B - Hourly Basis */}
            <div className="bg-white/5 rounded-xl p-6 border border-red-500/30">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                  <ClockIcon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Optie B: Urenbasis (€85/uur)</h3>
              </div>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Strikte urenlimiet</span>
                    <p className="text-sm">Moeten heel zakelijk en precies bijhouden van elke minuut</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CogIcon className="w-5 h-5 text-red-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Administratieve overhead</span>
                    <p className="text-sm">Tijdverspilling met urenregistratie en facturering</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <UserGroupIcon className="w-5 h-5 text-red-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Gedeelde focus</span>
                    <p className="text-sm">Moet nog steeds andere klanten bedienen</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CalculatorIcon className="w-5 h-5 text-red-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Onzekere kosten</span>
                    <p className="text-sm">€20.400 per jaar (20u/maand) zonder garantie op resultaat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-white mb-3">
                💡 De keuze is duidelijk, Rick
              </h3>
              <p className="text-gray-300 text-lg">
                Met de voorinvestering krijg je <span className="text-green-400 font-bold">onbeperkte toegang</span> tot mijn expertise, 
                <span className="text-green-400 font-bold"> volledige toewijding</span> aan jouw succes, en de 
                <span className="text-green-400 font-bold"> garantie</span> dat we samen de €100.000 target behalen.
              </p>
            </div>
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
                  <h4 className="text-lg font-semibold text-white mb-4">Investering & ROI Analyse</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Voorinvestering (Excl. Marketing)</span>
                      <span className="text-red-400 font-medium">€{investment.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                      <span className="text-orange-300">Marketing Budget (2% conversie, €0.30 CPC)</span>
                      <span className="text-orange-400 font-medium">€{selectedScenarioData.marketingBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <span className="text-red-300">Totale Investering</span>
                      <span className="text-red-400 font-bold">€{selectedScenarioData.totalInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Verwachte Omzet</span>
                      <span className="text-green-400 font-medium">€{selectedScenarioData.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <span className="text-green-300">Netto Winst</span>
                      <span className="text-green-400 font-bold">€{selectedScenarioData.netProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <span className="text-blue-300">Marketing ROI</span>
                      <span className="text-blue-400 font-bold">{selectedScenarioData.marketingRoi}%</span>
                    </div>
                  </div>
                  
                  {/* Marketing Budget Breakdown */}
                  <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-300 mb-3">Marketing Budget Breakdown</h5>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <span>Benodigde klanten:</span>
                        <span>{selectedScenarioData.totalCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversie percentage:</span>
                        <span>2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Benodigde clicks:</span>
                        <span>{(selectedScenarioData.totalCustomers / 0.02).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gemiddelde CPC:</span>
                        <span>€0.30</span>
                      </div>
                      <div className="flex justify-between font-medium text-orange-400">
                        <span>Marketing budget:</span>
                        <span>€{selectedScenarioData.marketingBudget.toLocaleString()}</span>
                      </div>
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

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <CalculatorIcon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Realistische Marketing Budgetten</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Met 2% conversie en €0,30 CPC zijn de marketing budgetten €29k-€36k - volledig haalbaar en voorspelbaar.
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
              Waarom €15.000 Voorinvestering de Beste Keuze Is
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