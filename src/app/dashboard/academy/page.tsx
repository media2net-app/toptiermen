'use client';
import ClientLayout from '../../components/ClientLayout';
import PageLayout from '../../../components/PageLayout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function MijnMissies() {
  const { user } = useAuth();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchModulesAndProgress() {
      setLoading(true);
      const { data: modulesData, error } = await supabase
        .from('academy_modules')
        .select('*')
        .order('order_index', { ascending: true });
      if (!error && modulesData) {
        // Sorteer modules op positie (of order_index, of id als laatste fallback)
        const sortedModules = [...modulesData].sort((a, b) => {
          if (a.positie != null && b.positie != null) {
            return a.positie - b.positie;
          }
          if (a.positie != null) return -1;
          if (b.positie != null) return 1;
          if (a.order_index != null && b.order_index != null) {
            return a.order_index - b.order_index;
          }
          if (a.order_index != null) return -1;
          if (b.order_index != null) return 1;
          return a.id.localeCompare(b.id);
        });
        setModules(sortedModules);
        if (user) {
          // Haal alle lessen op voor alle modules
          const { data: lessonsData } = await supabase
            .from('academy_lessons')
            .select('id,module_id');
          // Haal alle afgeronde lessen op voor deze user
          const { data: progressRows } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true);
          // Bereken per module het percentage
          const progressPerModule: Record<string, number> = {};
          sortedModules.forEach(mod => {
            const lessons = lessonsData?.filter(l => l.module_id === mod.id) || [];
            const total = lessons.length;
            const completed = lessons.filter(l => progressRows?.some(p => p.lesson_id === l.id)).length;
            progressPerModule[mod.id] = total > 0 ? Math.round((completed / total) * 100) : 0;
          });
          setProgressData(progressPerModule);
        }
      }
      setLoading(false);
    }
    if (user) fetchModulesAndProgress();
  }, [user]);

  return (
    <ClientLayout>
      <PageLayout 
        title="Academy"
        subtitle="Overzicht van alle modules en jouw voortgang"
      >
        {loading ? (
          <div className="text-[#8BAE5A] text-center py-12">Laden...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {modules.map((mod, i) => {
              // Bepaal het modulenummer
              const moduleNum = mod.positie != null ? mod.positie : (mod.order_index != null ? mod.order_index : i + 1);
              // Bepaal of deze module locked is
              let locked = false;
              if (i > 0) {
                // Kijk of de vorige module 100% is afgerond
                const prevModule = modules[i - 1];
                locked = progressData[prevModule.id] !== 100;
              }
              return (
                <div key={mod.id} className="relative">
                  <Link
                    href={locked ? '#' : `/dashboard/academy/${mod.slug || mod.id}`}
                    className={`bg-[#181F17]/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-[#3A4D23] flex flex-col gap-2 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#8BAE5A] relative active:scale-[0.98] touch-manipulation ${locked ? 'opacity-60 pointer-events-none' : ''}`}
                    tabIndex={locked ? -1 : 0}
                    aria-disabled={locked}
                  >
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-semibold text-[#8BAE5A]">
                        <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center font-bold text-base sm:text-lg mr-2 bg-[#232D1A] border-[#8BAE5A]">
                          {moduleNum}
                        </span>
                        {mod.title}
                        {locked && <LockClosedIcon className="w-5 h-5 text-[#8BAE5A] ml-2" title="Module is vergrendeld" />}
                      </span>
                      <span className="text-[#8BAE5A] font-mono text-xs sm:text-sm">{progressData[mod.id] != null ? `${progressData[mod.id]}%` : '0%'}</span>
                    </div>
                    <p className="text-[#A6C97B] mb-1 sm:mb-2 text-xs sm:text-sm line-clamp-2">{mod.short_description || mod.description}</p>
                    <div className="w-full h-1.5 sm:h-2 bg-[#8BAE5A]/20 rounded-full">
                      <div className="h-1.5 sm:h-2 bg-gradient-to-r from-[#8BAE5A] to-[#3A4D23] rounded-full transition-all duration-500" style={{ width: `${progressData[mod.id] || 0}%` }}></div>
                    </div>
                  </Link>
                  {locked && (
                    <div className="absolute inset-0 bg-[#181F17]/60 rounded-xl sm:rounded-2xl flex items-center justify-center z-10">
                      <span className="text-[#8BAE5A] font-bold flex items-center gap-2"><LockClosedIcon className="w-6 h-6" /> Module vergrendeld</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageLayout>
    </ClientLayout>
  );
} 