'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  BookOpenIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function TrainingscentrumRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to trainingsschemas after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/dashboard/trainingsschemas');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowRightIcon className="w-10 h-10 text-[#232D1A]" />
              </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Trainingscentrum is gesplitst!
          </h1>
          
          <p className="text-gray-300 text-lg mb-8">
            Het Trainingscentrum is opgesplitst in twee aparte secties voor een betere ervaring.
          </p>
                </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div
            initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push('/dashboard/trainingsschemas')}
            className="p-6 bg-[#232D1A] rounded-xl border border-[#3A4D23] hover:border-[#8BAE5A]/50 cursor-pointer transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon className="w-6 h-6 text-[#232D1A]" />
              </div>
            <h3 className="text-xl font-bold text-white mb-2">Trainingsschemas</h3>
            <p className="text-gray-300 text-sm mb-4">
              Kies en beheer je trainingsschemas voor optimale resultaten
            </p>
            <div className="flex items-center justify-center text-[#8BAE5A] text-sm font-semibold">
              Ga naar Trainingsschemas
              <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </div>
                  </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push('/dashboard/voedingsplannen')}
            className="p-6 bg-[#232D1A] rounded-xl border border-[#3A4D23] hover:border-[#8BAE5A]/50 cursor-pointer transition-all duration-200"
          >
            <div className="w-12 h-12 bg-[#8BAE5A] rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-6 h-6 text-[#232D1A]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Voedingsplannen</h3>
            <p className="text-gray-300 text-sm mb-4">
              Beheer je voedingsplannen en bereken je dagelijkse behoeften
            </p>
            <div className="flex items-center justify-center text-[#8BAE5A] text-sm font-semibold">
              Ga naar Voedingsplannen
              <ArrowRightIcon className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
              </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A] text-sm">
            Je wordt automatisch doorgestuurd naar Trainingsschemas...
          </p>
          <p className="text-[#B6C948] text-xs mt-2">
            Of klik op een van de opties hierboven
          </p>
        </motion.div>
                </div>
              </div>
  );
} 
