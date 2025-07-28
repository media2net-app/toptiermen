'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RocketLaunchIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MegaphoneIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  GlobeAltIcon,
  CpuChipIcon,
  BoltIcon,
  PresentationChartLineIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

export default function UitlegPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const features = [
    {
      id: 'overview',
      title: 'Dashboard Overzicht',
      icon: ChartBarIcon,
      description: 'Real-time inzicht in alle marketing activiteiten',
      benefits: [
        'Live performance metrics',
        'Geconsolideerde data van alle platforms',
        'Custom KPI dashboards',
        'Automatische rapportages'
      ]
    },
    {
      id: 'competition',
      title: 'Competitive Intelligence',
      icon: BuildingStorefrontIcon,
      description: 'Monitor en analyseer concurrenten in real-time',
      benefits: [
        'Facebook Ad Library integratie',
        'Instagram ads tracking',
        'SWOT analyse per concurrent',
        'Automatische alerts bij nieuwe ads'
      ]
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      icon: BeakerIcon,
      description: 'Diepgaande data analyse en voorspellingen',
      benefits: [
        'AI-powered insights',
        'Predictive analytics',
        'A/B testing tools',
        'ROI optimalisatie'
      ]
    },
    {
      id: 'automation',
      title: 'Marketing Automation',
      icon: BoltIcon,
      description: 'Automatiseer repetitieve taken en workflows',
      benefits: [
        'Geautomatiseerde rapportages',
        'Smart alert system',
        'Campaign scheduling',
        'Performance monitoring'
      ]
    }
  ];

  const competitiveAdvantages = [
    {
      title: 'Real-time Monitoring',
      description: 'Zie wat je concurrenten doen voordat ze het zelf weten',
      icon: EyeIcon,
      impact: '3x snellere reactietijd'
    },
    {
      title: 'Data-Driven Decisions',
      description: 'Maak beslissingen gebaseerd op harde data, niet op gevoel',
      icon: ChartBarIcon,
      impact: '40% hogere ROI'
    },
    {
      title: 'Automated Intelligence',
      description: 'AI analyseert duizenden ads en geeft actionable insights',
      icon: CpuChipIcon,
      impact: '80% tijd besparing'
    },
    {
      title: 'Predictive Analytics',
      description: 'Voorspel trends en anticipeer op marktveranderingen',
      icon: ArrowTrendingUpIcon,
      impact: '2x betere planning'
    }
  ];

  const roiMetrics = [
    { metric: 'Tijd Besparing', value: '80%', description: 'Automatisering van repetitieve taken' },
    { metric: 'ROI Verbetering', value: '40%', description: 'Data-driven optimalisatie' },
    { metric: 'Reactietijd', value: '3x Sneller', description: 'Real-time monitoring en alerts' },
    { metric: 'Kosten Reductie', value: '60%', description: 'Efficiëntere campagnes' }
  ];

  return (
    <div className="min-h-screen bg-[#0F1419] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-4">
              <RocketLaunchIcon className="w-6 h-6" />
              <span className="font-semibold">Marketing Dashboard 2.0</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              De Kracht van
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Intelligente Marketing</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ontdek hoe dit systeem je marketing naar het volgende niveau tilt met AI-powered insights, 
              real-time competitive intelligence en geautomatiseerde optimalisatie.
            </p>
          </motion.div>
        </div>

        {/* Feature Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveSection(feature.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeSection === feature.id
                  ? 'bg-[#1E40AF] text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <feature.icon className="w-5 h-5" />
              <span className="font-medium">{feature.title}</span>
            </button>
          ))}
        </div>

        {/* Feature Details */}
        <AnimatePresence mode="wait">
          {features.map((feature) => (
            activeSection === feature.id && (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
                    </div>
                    <p className="text-gray-300 text-lg mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-300">
                          <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Live Demo</h3>
                      <p className="text-gray-400 mb-4">Zie hoe {feature.title.toLowerCase()} werkt in de praktijk</p>
                      <button className="bg-[#1E40AF] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-lg transition-colors">
                        Bekijk Demo
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Competitive Advantages */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Waarom Dit Systeem <span className="text-blue-400">Uniek</span> Is
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Geen andere marketing tool biedt deze combinatie van features en intelligentie
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitiveAdvantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <advantage.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{advantage.title}</h3>
                <p className="text-gray-300 text-sm mb-3">{advantage.description}</p>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                  <span className="text-green-400 text-sm font-medium">{advantage.impact}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ROI Metrics */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/30 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Bewezen <span className="text-blue-400">ROI</span> Resultaten
            </h2>
            <p className="text-gray-300">
              Deze metrics zijn gebaseerd op echte implementaties bij vergelijkbare bedrijven
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roiMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center"
              >
                <div className="text-3xl font-bold text-blue-400 mb-2">{metric.value}</div>
                <div className="text-white font-medium mb-2">{metric.metric}</div>
                <div className="text-gray-400 text-sm">{metric.description}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technical Excellence */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              <span className="text-blue-400">Technische</span> Excellentie
            </h2>
            <p className="text-gray-300">
              Gebouwd met de nieuwste technologieën voor maximale betrouwbaarheid en performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Enterprise Security</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>• End-to-end encryptie</li>
                <li>• GDPR compliant</li>
                <li>• Multi-factor authenticatie</li>
                <li>• Regular security audits</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <BoltIcon className="w-8 h-8 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">High Performance</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>• 99.9% uptime garantie</li>
                <li>• Real-time data processing</li>
                <li>• Auto-scaling infrastructure</li>
                <li>• Global CDN</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <GlobeAltIcon className="w-8 h-8 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Global Integration</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>• Facebook Ad Library API</li>
                <li>• Instagram Business API</li>
                <li>• Google Ads integration</li>
                <li>• Custom API endpoints</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StarIcon className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Klaar om te <span className="text-yellow-300">Revolutioneren</span>?
            </h2>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Dit systeem geeft je een voorsprong van 6-12 maanden op je concurrenten. 
              De investering verdient zichzelf terug binnen 3 maanden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Gratis Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Plan Demo
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">500+</div>
            <div className="text-gray-400">Ads Geanalyseerd</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">40%</div>
            <div className="text-gray-400">ROI Verbetering</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">24/7</div>
            <div className="text-gray-400">Monitoring</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
} 