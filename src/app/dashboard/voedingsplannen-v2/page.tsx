'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { RocketLaunchIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import UpgradeRequiredModal from '@/components/UpgradeRequiredModal';

interface NutritionPlan {
  id: string;
  plan_id?: string;
  name: string;
  description?: string;
  goal: string;
  difficulty: string;
  created_at: string;
}

interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activity_level: 'sedentary' | 'moderate' | 'very_active';
  fitness_goal: 'droogtrainen' | 'onderhoud' | 'spiermassa';
}

export default function VoedingsplannenV2() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userAccessLevel, setUserAccessLevel] = useState<string>('Basic Tier');

  // Check user access level
  const checkUserAccess = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/user-profile?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        const packageType = data.profile?.package_type || 'Basic Tier';
        const role = data.profile?.role || 'user';

        setUserAccessLevel(packageType);

        // Check if user has access to nutrition plans
        const hasAccess = packageType === 'Premium Tier' ||
                         packageType === 'Lifetime Tier' ||
                         packageType === 'Lifetime Access';

        if (!hasAccess) {
          setShowUpgradeModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking user access:', error);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/nutrition-profile-v2?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch nutrition plans
  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/nutrition-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Failed to fetch nutrition plans');
      }
    } catch (error) {
      setError('Error fetching nutrition plans');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate personalized targets
  const calculatePersonalizedTargets = (plan: NutritionPlan) => {
    if (!userProfile) return null;

    const activityMultipliers = {
      sedentary: 1.1,
      moderate: 1.3,
      very_active: 1.6
    };

    const baseCalories = userProfile.weight * 22 * activityMultipliers[userProfile.activity_level];
    
    const goalAdjustments = {
      droogtrainen: -500,
      onderhoud: 0,
      spiermassa: 400
    };

    const planGoal = plan.goal?.toLowerCase() || 'onderhoud';
    const goalAdjustment = goalAdjustments[planGoal] || 0;
    const targetCalories = Math.round(baseCalories + goalAdjustment);

    // Use default percentages
    const proteinPercentage = 35;
    const carbsPercentage = 40;
    const fatPercentage = 25;

    const targetProtein = Math.round((targetCalories * proteinPercentage / 100) / 4);
    const targetCarbs = Math.round((targetCalories * carbsPercentage / 100) / 4);
    const targetFat = Math.round((targetCalories * fatPercentage / 100) / 9);

    return {
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat
    };
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    checkUserAccess();
    fetchUserProfile();
    fetchPlans();
  }, [user, authLoading]);

  // Show loading state
  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <RocketLaunchIcon className="w-8 h-8 text-[#181F17]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Laden...</h2>
          <p className="text-[#8BAE5A]">Voedingsplannen worden geladen</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Fout</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] rounded-full flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-[#181F17]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voedingsplannen V2</h1>
              <p className="text-[#B6C948]">Gepersonaliseerde voedingsplannen</p>
            </div>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans
            .filter((plan) => {
              const userGoal = userProfile?.fitness_goal;
              if (!userGoal) return true;
              
              const goalMapping = {
                'droogtrainen': 'droogtrainen',
                'onderhoud': 'onderhoud', 
                'spiermassa': 'spiermassa'
              };
              
              const planGoal = plan.goal?.toLowerCase();
              return userGoal && planGoal === goalMapping[userGoal];
            })
            .map((plan) => {
              const personalizedTargets = calculatePersonalizedTargets(plan);
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl p-6 cursor-pointer transition-all duration-200 bg-[#181F17] text-white border border-[#3A4D23] hover:border-[#B6C948]"
                >
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#B6C948] to-[#8BAE5A]">
                      <span className="text-lg font-bold text-[#181F17]">
                        {plan.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-[#8BAE5A]">
                        {plan.goal === 'droogtrainen' && '🎯 Droogtrainen'}
                        {plan.goal === 'onderhoud' && '⚖️ Onderhoud'}
                        {plan.goal === 'spiermassa' && '💪 Spiermassa'}
                      </p>
                    </div>
                  </div>

                  {/* Plan Description */}
                  <p className="text-sm mb-4 text-gray-300">
                    {plan.description || 'Een gepersonaliseerd voedingsplan aangepast aan jouw doelen.'}
                  </p>

                  {/* Personalized Targets */}
                  {personalizedTargets && (
                    <div className="bg-[#0A0F0A] rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-3 text-[#8BAE5A]">
                        Jouw Doelen
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-400">Calorieën</span>
                          <p className="font-bold text-white">
                            {personalizedTargets.targetCalories}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Eiwit</span>
                          <p className="font-bold text-white">
                            {personalizedTargets.targetProtein}g
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Koolhydraten</span>
                          <p className="font-bold text-white">
                            {personalizedTargets.targetCarbs}g
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400">Vet</span>
                          <p className="font-bold text-white">
                            {personalizedTargets.targetFat}g
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8BAE5A]">
                      Selecteer Plan
                    </span>
                    
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-[#B6C948] to-[#8BAE5A] group-hover:scale-110">
                      <span className="text-sm text-[#181F17]">
                        →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* No Plans Message */}
        {plans.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#3A4D23] rounded-full flex items-center justify-center mx-auto mb-4">
              <RocketLaunchIcon className="w-8 h-8 text-[#8BAE5A]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Geen voedingsplannen gevonden</h3>
            <p className="text-gray-500">Er zijn momenteel geen voedingsplannen beschikbaar.</p>
          </div>
        )}
      </div>
      
      {/* Upgrade Required Modal */}
      <UpgradeRequiredModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Voedingsplannen"
      />
    </div>
  );
}