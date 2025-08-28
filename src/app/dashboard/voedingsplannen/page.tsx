'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';

interface NutritionPlan {
  plan_id: string;
  name: string;
  description: string;
  category: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  duration_weeks: number;
  difficulty: string;
  goal: string;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
}

export default function VoedingsplannenPage() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNutritionPlans();
  }, []);

  const fetchNutritionPlans = async () => {
    try {
      setLoading(true);
      
      // 3 carnivoor voedingsplannen
      const correctPlans: NutritionPlan[] = [
        {
          plan_id: 'carnivoor_droogtrainen',
          name: 'Carnivoor Droogtrainen',
          description: 'Een carnivoor voedingsplan specifiek gericht op vetverbranding en droogtrainen. Hoog in eiwitten, zeer laag in koolhydraten, perfect voor het verliezen van lichaamsvet terwijl je spiermassa behoudt.',
          category: 'carnivoor',
          target_calories: 2000,
          target_protein: 200,
          target_carbs: 5,
          target_fat: 130,
          duration_weeks: 12,
          difficulty: 'Makkelijk',
          goal: 'droogtrainen',
          is_featured: true,
          is_public: true,
          created_at: new Date().toISOString()
        },
        {
          plan_id: 'carnivoor_onderhoud',
          name: 'Carnivoor Onderhoud',
          description: 'Een carnivoor voedingsplan voor het behouden van je huidige lichaamscompositie en gezondheid. Gebalanceerd voor langdurige gezondheid en welzijn.',
          category: 'carnivoor',
          target_calories: 2400,
          target_protein: 180,
          target_carbs: 8,
          target_fat: 160,
          duration_weeks: 12,
          difficulty: 'Makkelijk',
          goal: 'onderhoud',
          is_featured: true,
          is_public: true,
          created_at: new Date().toISOString()
        },
        {
          plan_id: 'carnivoor_spiermassa',
          name: 'Carnivoor Spiermassa',
          description: 'Een carnivoor voedingsplan voor spieropbouw en krachttoename. Hoog in eiwitten en gezonde vetten, perfect voor het opbouwen van spiermassa en kracht.',
          category: 'carnivoor',
          target_calories: 2800,
          target_protein: 220,
          target_carbs: 10,
          target_fat: 200,
          duration_weeks: 12,
          difficulty: 'Makkelijk',
          goal: 'spiermassa',
          is_featured: true,
          is_public: true,
          created_at: new Date().toISOString()
        }
      ];

      setPlans(correctPlans);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching nutrition plans:', err);
      setError('Er is een fout opgetreden bij het laden van de voedingsplannen.');
      setLoading(false);
    }
  };

  const handlePlanClick = (planId: string) => {
    router.push(`/dashboard/voedingsplannen/${planId}`);
  };

  const getPlanIcon = (category: string) => {
    switch (category) {
      case 'carnivoor':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'flexibel':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'keto':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
    }
  };

  const getPlanColor = (category: string) => {
    switch (category) {
      case 'carnivoor':
        return 'from-red-600 to-orange-500';
      case 'flexibel':
        return 'from-green-600 to-blue-500';
      case 'keto':
        return 'from-purple-600 to-pink-500';
      default:
        return 'from-gray-600 to-gray-500';
    }
  };

  if (loading) {
    return (
      <PageLayout title="Voedingsplannen" subtitle="Laden...">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948]"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Voedingsplannen" subtitle="Fout">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#232D1A] border border-red-500 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchNutritionPlans}
              className="px-4 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Voedingsplannen"
      subtitle="Kies het voedingsplan dat bij jou past"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Voedingsplannen</h1>
          <p className="text-[#B6C948] text-lg">
            Ontdek onze wetenschappelijk onderbouwde voedingsplannen voor optimale prestaties en gezondheid.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.plan_id}
              onClick={() => handlePlanClick(plan.plan_id)}
              className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 cursor-pointer hover:border-[#B6C948] transition-all duration-300 hover:shadow-lg hover:shadow-[#B6C948]/20 group"
            >
              {/* Plan Header */}
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getPlanColor(plan.category)} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                  <div className="text-white">
                    {getPlanIcon(plan.category)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#B6C948] transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-[#8BAE5A] text-sm">{plan.difficulty}</p>
                </div>
              </div>

              {/* Plan Goal Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-600 to-orange-500 text-white">
                  {plan.goal === 'droogtrainen' && '🎯 Droogtrainen'}
                  {plan.goal === 'onderhoud' && '⚖️ Onderhoud'}
                  {plan.goal === 'spiermassa' && '💪 Spiermassa'}
                </span>
              </div>

              {/* Plan Description */}
              <p className="text-[#B6C948] text-sm mb-4 line-clamp-3">
                {plan.description}
              </p>

              {/* Nutrition Info */}
              <div className="bg-[#181F17] rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#8BAE5A]">Calorieën</p>
                    <p className="text-white font-semibold">{plan.target_calories}</p>
                  </div>
                  <div>
                    <p className="text-[#8BAE5A]">Eiwitten</p>
                    <p className="text-white font-semibold">{plan.target_protein}g</p>
                  </div>
                  <div>
                    <p className="text-[#8BAE5A]">Koolhydraten</p>
                    <p className="text-white font-semibold">{plan.target_carbs}g</p>
                  </div>
                  <div>
                    <p className="text-[#8BAE5A]">Vetten</p>
                    <p className="text-white font-semibold">{plan.target_fat}g</p>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#8BAE5A] text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {plan.duration_weeks} weken
                </div>
                <div className="text-[#B6C948] group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Over onze voedingsplannen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#B6C948]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#B6C948]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Wetenschappelijk Onderbouwd</h4>
              <p className="text-[#8BAE5A] text-sm">Alle plannen zijn gebaseerd op de laatste voedingswetenschap en bewezen methoden.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#B6C948]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#B6C948]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Aanpasbaar</h4>
              <p className="text-[#8BAE5A] text-sm">Pas je plan aan aan jouw specifieke doelen, voorkeuren en levensstijl.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#B6C948]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#B6C948]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-white font-semibold mb-2">Resultaatgericht</h4>
              <p className="text-[#8BAE5A] text-sm">Ontworpen voor meetbare resultaten in korte tijd.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
