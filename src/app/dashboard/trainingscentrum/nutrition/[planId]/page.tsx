'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import Breadcrumb, { createBreadcrumbs } from '@/components/Breadcrumb';
import PlanDetail from '../PlanDetail';

interface NutritionPlan {
  id: number;
  plan_id: string;
  name: string;
  subtitle?: string;
  description: string;
  icon?: string;
  color?: string;
  meals?: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function NutritionPlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const planId = params?.planId as string;

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/nutrition-plans');
      
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const foundPlan = data.plans.find((p: NutritionPlan) => p.plan_id === planId);
        
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          setError('Voedingsplan niet gevonden');
        }
      } else {
        throw new Error(data.error || 'Failed to fetch nutrition plans');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching plan details:', err);
      setError('Er is een fout opgetreden bij het laden van het voedingsplan.');
      setLoading(false);
    }
  };

  const handleBack = () => {
            router.push('/dashboard/trainingscentrum');
  };

  if (loading) {
    return (
      <PageLayout title="Voedingsplan" subtitle="Laden...">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B6C948]"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !plan) {
    return (
      <PageLayout title="Voedingsplan" subtitle="Fout">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#232D1A] border border-red-500 rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error || 'Voedingsplan niet gevonden'}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#B6C948] text-[#181F17] rounded-lg hover:bg-[#8BAE5A] transition-colors mr-4"
            >
              Terug naar overzicht
            </button>
            <button
              onClick={fetchPlanDetails}
              className="px-4 py-2 bg-[#8BAE5A] text-[#181F17] rounded-lg hover:bg-[#B6C948] transition-colors"
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
      title={plan.name}
      subtitle={plan.subtitle || 'Gedetailleerd voedingsplan'}
    >
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={createBreadcrumbs('Voedingsplannen', plan.name)} />
      </div>
      
      <div className="max-w-6xl mx-auto">
        {/* Plan Header */}
        <div className="bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl text-white">🥩</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{plan.name}</h1>
                {plan.subtitle && (
                  <p className="text-[#8BAE5A] text-lg">{plan.subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#3A4D23] text-[#B6C948] rounded-lg hover:bg-[#8BAE5A] hover:text-[#181F17] transition-colors"
            >
              ← Terug
            </button>
          </div>
          
          <p className="text-[#B6C948] text-lg leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Plan Detail Component */}
        <PlanDetail 
          slug={planId} 
          onBack={handleBack}
        />
      </div>
    </PageLayout>
  );
}
