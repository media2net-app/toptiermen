'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  RocketLaunchIcon,
  HeartIcon,
  StarIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function BevestigingContent() {
  const searchParams = useSearchParams();
  const name = searchParams?.get('name') || 'Rick';
  const company = searchParams?.get('company') || 'Top Tier Men';
  const date = searchParams?.get('date') || new Date().toLocaleDateString('nl-NL');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Bedankt voor je vertrouwen!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              {name}, je marketing voorstel is succesvol ondertekend. 
              We gaan samen de weg naar €100.000 omzet bewandelen!
            </motion.p>

            {/* Confirmation Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-8 border border-green-500/30 max-w-2xl mx-auto mb-12"
            >
              <div className="flex items-center justify-center mb-4">
                <HeartIcon className="w-8 h-8 text-green-400 mr-3" />
                <span className="text-green-400 font-semibold text-lg">Opdracht Bevestigd</span>
              </div>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Ondertekend door:</span>
                  <span className="text-white font-semibold">{name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bedrijf:</span>
                  <span className="text-white font-semibold">{company}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Datum:</span>
                  <span className="text-white font-semibold">{date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Voorinvestering:</span>
                  <span className="text-green-400 font-bold">€15.000</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Wat gebeurt er nu?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We gaan direct aan de slag om jouw marketing strategie tot leven te brengen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Factuur Onderweg</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Je ontvangt binnen 24 uur de factuur voor €15.000 (excl. BTW) op je e-mailadres.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Planning & Strategie</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Na betaling ontvang je een gedetailleerde planning en starten we direct met de marketing activiteiten.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.9 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Persoonlijke Begeleiding</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Je krijgt direct toegang tot ons team en regelmatige updates over de voortgang van je campagnes.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Success Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-12 border border-blue-500/30">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Op naar een mooie samenwerking! 🚀
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {name}, bedankt voor je vertrouwen in Media2Net. We gaan er samen voor zorgen dat 
              Top Tier Men de €100.000 omzet target behaalt. 
              <br /><br />
              <span className="text-blue-400 font-semibold">
                "Samen bereiken we meer dan alleen"
              </span>
            </p>

                         <div className="flex items-center justify-center gap-2 text-yellow-400 mb-6">
               <StarIcon className="w-5 h-5" />
               <StarIcon className="w-5 h-5" />
               <StarIcon className="w-5 h-5" />
               <StarIcon className="w-5 h-5" />
               <StarIcon className="w-5 h-5" />
             </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="text-center"
        >
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-white/20"
          >
            <RocketLaunchIcon className="w-5 h-5" />
            Terug naar Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function BevestigingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <BevestigingContent />
    </Suspense>
  );
} 