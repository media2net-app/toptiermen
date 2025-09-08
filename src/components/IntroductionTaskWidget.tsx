'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface IntroductionTask {
  id: string;
  user_id: string;
  task_type: string;
  status: 'pending' | 'completed' | 'skipped';
  forum_post_id?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface IntroductionTaskWidgetProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function IntroductionTaskWidget({ isVisible, onComplete }: IntroductionTaskWidgetProps) {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [task, setTask] = useState<IntroductionTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (isVisible && user) {
      fetchIntroductionTask();
    }
  }, [isVisible, user]);

  const fetchIntroductionTask = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/user-introduction-task?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setTask(data.task);
      } else {
        console.error('Error fetching introduction task:', data.error);
      }
    } catch (error) {
      console.error('Error fetching introduction task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!user || !task) return;

    try {
      setCompleting(true);
      const response = await fetch('/api/user-introduction-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'complete'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTask(data.task);
        toast.success('Introductie taak voltooid! 🎉');
        onComplete?.();
      } else {
        toast.error(data.error || 'Er is een fout opgetreden');
      }
    } catch (error) {
      console.error('Error completing introduction task:', error);
      toast.error('Er is een fout opgetreden');
    } finally {
      setCompleting(false);
    }
  };

  const handleSkipTask = async () => {
    if (!user || !task) return;

    try {
      setCompleting(true);
      const response = await fetch('/api/user-introduction-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'skip'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTask(data.task);
        toast.success('Taak overgeslagen');
        onComplete?.();
      } else {
        toast.error(data.error || 'Er is een fout opgetreden');
      }
    } catch (error) {
      console.error('Error skipping introduction task:', error);
      toast.error('Er is een fout opgetreden');
    } finally {
      setCompleting(false);
    }
  };

  const handleGoToForum = () => {
    router.push('/dashboard/brotherhood/forum');
  };

  // Don't show if not visible or task is completed/skipped
  if (!isVisible || !task || task.status !== 'pending') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8BAE5A] mr-3"></div>
          <span className="text-[#8BAE5A]">Laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#8BAE5A]/10 to-[#B6C948]/10 border border-[#8BAE5A] rounded-xl p-6 mb-6 animate-fade-in-up">
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-[#8BAE5A]/20 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-[#8BAE5A]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">
              👋 Stel je voor aan de Community
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8BAE5A]/20 text-[#8BAE5A]">
              Nieuwe Taak
            </span>
          </div>

          <p className="text-[#B6C948] text-sm mb-4 leading-relaxed">
            Welkom bij Top Tier Men! Maak kennis met andere leden door jezelf voor te stellen in het forum. 
            Dit helpt je om connecties te maken en onderdeel te worden van de community.
          </p>

          {/* Task Details */}
          <div className="bg-[#232D1A]/50 rounded-lg p-4 mb-4 border border-[#3A4D23]">
            <h4 className="text-[#8BAE5A] font-semibold mb-2 flex items-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Wat kun je delen:
            </h4>
            <ul className="text-[#B6C948] text-sm space-y-1">
              <li>• Je naam en waar je vandaan komt</li>
              <li>• Je hoofddoel en motivatie</li>
              <li>• Wat je hoopt te bereiken</li>
              <li>• Je interesses en passies</li>
            </ul>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoToForum}
              disabled={completing}
              className="flex-1 bg-[#8BAE5A] hover:bg-[#B6C948] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
              Ga naar Forum
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={handleCompleteTask}
              disabled={completing}
              className="flex-1 bg-[#3A4D23] hover:bg-[#4A5D33] text-[#8BAE5A] px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Taak Voltooid
            </button>

            <button
              onClick={handleSkipTask}
              disabled={completing}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              Overslaan
            </button>
          </div>

          {/* Progress Info */}
          <div className="mt-4 text-xs text-[#B6C948] bg-[#232D1A]/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span>Taak blijft zichtbaar tot je een post hebt geplaatst</span>
              <span className="text-[#8BAE5A] font-medium">Stap 1 van 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
