'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  CheckCircleIcon, 
  TrophyIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface OnboardingStatus {
  user_id: string;
  welcome_video_watched: boolean;
  step_1_completed: boolean;
  step_2_completed: boolean;
  step_3_completed: boolean;
  step_4_completed: boolean;
  step_5_completed: boolean;
  onboarding_completed: boolean;
  current_step: number;
}

export default function OnboardingCompletion() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
    }
  }, [user]);

  const fetchOnboardingStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/onboarding?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setOnboardingStatus(data);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8BAE5A] mx-auto mb-4"></div>
          <p className="text-[#8BAE5A]">Laden...</p>
        </div>
      </div>
    );
  }

  // If onboarding is not completed, redirect to onboarding
  if (!onboardingStatus?.onboarding_completed) {
    router.push('/dashboard/onboarding');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircleIcon className="w-12 h-12 text-[#0A0F0A]" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center animate-bounce">
              <StarIcon className="w-5 h-5 text-[#0A0F0A]" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 GEFELICITEERD!
          </h1>
          <p className="text-xl text-[#8BAE5A] mb-8">
            Je hebt de onboarding succesvol voltooid!
          </p>
        </div>

        {/* Completion Summary */}
        <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Wat je hebt bereikt:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Welkomstvideo</h3>
              <p className="text-[#8BAE5A] text-sm">Platform introductie bekeken</p>
            </div>

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Hoofddoel</h3>
              <p className="text-[#8BAE5A] text-sm">Persoonlijk doel gedefinieerd</p>
            </div>

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Missies</h3>
              <p className="text-[#8BAE5A] text-sm">Dagelijkse missies geselecteerd</p>
            </div>

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Training</h3>
              <p className="text-[#8BAE5A] text-sm">Trainingsschema gekozen</p>
            </div>

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Voeding & Challenges</h3>
              <p className="text-[#8BAE5A] text-sm">Voedingsplan en challenges geselecteerd</p>
            </div>

            <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
              </div>
              <h3 className="text-white font-semibold mb-2">Community</h3>
              <p className="text-[#8BAE5A] text-sm">Forum introductie geplaatst</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-[#232D1A] rounded-2xl border border-[#3A4D23] p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Wat nu?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0A0F0A] font-bold text-xl">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Start je missies</h3>
              <p className="text-[#8BAE5A] text-sm">Begin met je dagelijkse missies om punten te verdienen</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0A0F0A] font-bold text-xl">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Volg je schema</h3>
              <p className="text-[#8BAE5A] text-sm">Start met je trainingsschema en voedingsplan</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#0A0F0A] font-bold text-xl">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Doe mee met de community</h3>
              <p className="text-[#8BAE5A] text-sm">Interacteer met andere leden in het forum</p>
            </div>
          </div>
        </div>

        {/* Badge Reward */}
        <div className="bg-gradient-to-br from-[#8BAE5A] to-[#FFD700] rounded-2xl p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-[#0A0F0A] mb-4">
            Je hebt de 'Initiatie' Badge ontgrendeld!
          </h2>
          <p className="text-[#0A0F0A] text-lg">
            Deze badge symboliseert je eerste stap naar een betere versie van jezelf.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={handleGoToDashboard}
            className="bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] px-8 py-4 rounded-xl font-bold text-lg hover:from-[#A6C97B] hover:to-[#FFE55C] transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            <span>Start je reis</span>
            <ArrowRightIcon className="w-6 h-6" />
          </button>
          
          <p className="text-[#8BAE5A] mt-4 text-sm">
            Je wordt automatisch doorgestuurd naar je dashboard
          </p>
        </div>
      </div>
    </div>
  );
} 