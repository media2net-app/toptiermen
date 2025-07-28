'use client';

import { useState, useEffect } from 'react';
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
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureData, setSignatureData] = useState({
    name: '',
    company: '',
    email: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSigned, setIsSigned] = useState(false);
  const [signedData, setSignedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      marketingBudget: 23900, // 239 customers / 3% conversion = 7,967 clicks * €0.30 CPC
      totalInvestment: 38900, // €15,000 + €23,900
      netProfit: 61075, // €99,975 - €38,900
      marketingRoi: 256 // (€99,975 - €23,900) / €23,900 * 100
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
      marketingBudget: 19500, // 195 customers / 3% conversion = 6,500 clicks * €0.30 CPC
      totalInvestment: 34500, // €15,000 + €19,500
      netProfit: 66345, // €100,845 - €34,500
      marketingRoi: 318 // (€100,845 - €19,500) / €19,500 * 100
    }
  ];

  const selectedScenarioData = scenarios[selectedScenario === 'A' ? 0 : 1];

  const investment = 15000;
  const targetRevenue = 100000;

  // Check if user has already signed this proposal
  useEffect(() => {
    const checkSignatureStatus = async () => {
      try {
        const response = await fetch('/api/proposal-signatures?proposal_type=marketing');
        const data = await response.json();
        
        if (data.success && data.signatures && data.signatures.length > 0) {
          const latestSignature = data.signatures[0];
          setIsSigned(true);
          setSignedData({
            name: latestSignature.client_name,
            company: latestSignature.client_company,
            date: latestSignature.signature_date,
            signedAt: latestSignature.signed_at
          });
        }
      } catch (error) {
        console.error('Error checking signature status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSignatureStatus();
  }, []);

  const handleSignatureSubmit = async () => {
    if (signatureData.name && signatureData.company && signatureData.email) {
      setIsSubmitting(true);
      try {
        // Save signature to database
        const response = await fetch('/api/proposal-signatures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            proposal_type: 'marketing',
            proposal_amount: 15000,
            client_name: signatureData.name,
            client_company: signatureData.company,
            client_email: signatureData.email,
            signature_date: signatureData.date,
            proposal_details: {
              scenario: selectedScenario,
              investment: investment,
              targetRevenue: targetRevenue
            }
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          const signedInfo = {
            ...signatureData,
            signedAt: new Date().toISOString(),
            proposalAmount: '€15.000',
            proposalType: 'Marketing Voorstel Media2Net'
          };
          setSignedData(signedInfo);
          setIsSigned(true);
          setShowSignatureModal(false);
          
          console.log('Ondertekening opgeslagen:', data.signature);
          
          // Doorsturen naar bevestigingspagina
          const params = new URLSearchParams({
            name: signatureData.name,
            company: signatureData.company,
            date: signatureData.date
          });
          
          setTimeout(() => {
            window.location.href = `/offerte/bevestiging?${params.toString()}`;
          }, 1500);
        } else {
          console.error('Error saving signature:', data.error);
          alert('Er is een fout opgetreden bij het opslaan van de ondertekening. Probeer het opnieuw.');
        }
      } catch (error) {
        console.error('Error submitting signature:', error);
        alert('Er is een fout opgetreden bij het opslaan van de ondertekening. Probeer het opnieuw.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSignatureData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link 
            href="/dashboard-marketing"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Terug naar Marketing Dashboard
          </Link>
        </motion.div>
      </div>

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
                <div className="text-white font-bold text-lg">M2N</div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Voorstel marketing
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              De weg naar 100k omzet
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
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
                <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-lg mb-4 mx-auto">
                  <CalculatorIcon className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">€19k-€24k</div>
                <div className="text-gray-300">Marketing Budget</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4 mx-auto">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">256-318%</div>
                <div className="text-gray-300">Marketing ROI</div>
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
              
              <p className="text-gray-300 text-lg">
                Met de voorinvestering krijg je <span className="text-green-400 font-bold">onbeperkte toegang</span> tot mijn expertise en de 
                <span className="text-green-400 font-bold"> garantie van volledige toewijding</span> aan jouw project.
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
                      <span className="text-gray-300">Voorinvestering</span>
                      <span className="text-red-400 font-medium">€{investment.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                      <span className="text-orange-300">Marketing Budget (3% conversie, €0.30 CPC)</span>
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
                        <span>3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Benodigde clicks:</span>
                        <span>{(selectedScenarioData.totalCustomers / 0.03).toLocaleString()}</span>
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

      {/* Digital Signature Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-12 border border-green-500/30">
            <h2 className="text-3xl font-bold text-white mb-6">
              Akkoord & Start Procedure
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Na digitale ondertekening ontvang je direct de factuur en gaan we van start
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Digitale Ondertekening</h3>
                <p className="text-gray-300 text-sm">
                  Rick ondertekent digitaal dat hij akkoord gaat met dit marketing voorstel
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Factuur & Betaling</h3>
                <p className="text-gray-300 text-sm">
                  Direct na ondertekening ontvang je de factuur voor de €15.000 voorinvestering
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <RocketLaunchIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Direct Start</h3>
                <p className="text-gray-300 text-sm">
                  Na betaling starten we direct met marketing activiteiten en informeren we je over planning
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-8 border border-white/20 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Digitale Ondertekening
              </h3>
              <p className="text-gray-300 mb-6">
                Door hieronder te ondertekenen ga je akkoord met het marketing voorstel van Media2Net 
                voor een voorinvestering van €15.000 exclusief marketing kosten.
              </p>
              
              <div className="flex justify-center mb-6">
                {isLoading ? (
                  <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    <span className="text-gray-300 text-sm">Laden...</span>
                  </div>
                ) : !isSigned ? (
                  <button 
                    onClick={() => setShowSignatureModal(true)}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Ondertekenen...
                      </div>
                    ) : (
                      'Digitale Ondertekening'
                    )}
                  </button>
                ) : (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-green-400 font-semibold">Ondertekend</span>
                    </div>
                    <p className="text-green-200 text-sm">
                      Door {signedData?.name} op {new Date(signedData?.signedAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-400 space-y-1 mb-4">
                <p>✅ Direct factuur na ondertekening</p>
                <p>✅ Snelle start na betaling</p>
                <p>✅ Volledige transparantie in planning</p>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                * Alle genoemde bedragen zijn exclusief 21% BTW
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Digital Signature Modal */}
      <AnimatePresence>
        {showSignatureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSignatureModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Digitale Ondertekening
                </h3>
                <p className="text-gray-300 text-sm">
                  Vul je gegevens in om akkoord te gaan met het marketing voorstel
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={signatureData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Volledige naam"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bedrijf *
                  </label>
                  <input
                    type="text"
                    value={signatureData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Bedrijfsnaam"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    value={signatureData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="email@bedrijf.nl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={signatureData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
                  <p className="text-blue-200 text-sm text-center">
                    Door te ondertekenen ga je akkoord met het marketing voorstel van Media2Net 
                    voor een voorinvestering van €15.000 exclusief marketing kosten en BTW.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowSignatureModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleSignatureSubmit}
                    disabled={!signatureData.name || !signatureData.company || !signatureData.email || isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Opslaan...
                      </div>
                    ) : (
                      'Ondertekenen'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
} 