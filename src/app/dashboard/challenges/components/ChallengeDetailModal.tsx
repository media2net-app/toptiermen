'use client';
import { useState } from 'react';
import { 
  XMarkIcon, 
  TrophyIcon, 
  CalendarIcon, 
  ClockIcon, 
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  FireIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import AdminButton from '@/components/admin/AdminButton';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  duration_days: number;
  points_reward: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  requirements: string[];
  rewards: string[];
  participants_count: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

interface ChallengeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  onStartChallenge?: (challengeId: string) => void;
}

export default function ChallengeDetailModal({ 
  isOpen, 
  onClose, 
  challenge, 
  onStartChallenge 
}: ChallengeDetailModalProps) {
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen || !challenge) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'medium': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'hard': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly': return CalendarIcon;
      case 'monthly': return ClockIcon;
      case 'special': return StarIcon;
      default: return TrophyIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'monthly': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'special': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleStartChallenge = async () => {
    if (!onStartChallenge) return;
    
    setIsStarting(true);
    try {
      await onStartChallenge(challenge.id);
    } finally {
      setIsStarting(false);
    }
  };

  const TypeIcon = getTypeIcon(challenge.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#232D1A] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A4D23]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#8BAE5A] to-[#B6C948] rounded-xl flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-[#181F17]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTypeColor(challenge.type)}`}>
                  {challenge.type === 'weekly' ? 'Wekelijks' : 
                   challenge.type === 'monthly' ? 'Maandelijks' : 'Speciaal'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty === 'easy' ? 'Makkelijk' : 
                   challenge.difficulty === 'medium' ? 'Gemiddeld' : 'Moeilijk'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#3A4D23] rounded-lg flex items-center justify-center hover:bg-[#4A5D33] transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#8BAE5A]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Beschrijving</h3>
            <p className="text-[#8BAE5A] leading-relaxed">{challenge.description}</p>
          </div>

          {/* Challenge Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#1A2313] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-[#8BAE5A]" />
                <span className="text-sm font-medium text-white">Duur</span>
              </div>
              <div className="text-xl font-bold text-[#B6C948]">{challenge.duration_days} dagen</div>
            </div>

            <div className="bg-[#1A2313] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="w-5 h-5 text-[#8BAE5A]" />
                <span className="text-sm font-medium text-white">Punten</span>
              </div>
              <div className="text-xl font-bold text-[#B6C948]">{challenge.points_reward}</div>
            </div>

            <div className="bg-[#1A2313] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-[#8BAE5A]" />
                <span className="text-sm font-medium text-white">Deelnemers</span>
              </div>
              <div className="text-xl font-bold text-[#B6C948]">{challenge.participants_count.toLocaleString()}</div>
            </div>

            <div className="bg-[#1A2313] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="w-5 h-5 text-[#8BAE5A]" />
                <span className="text-sm font-medium text-white">Voltooid</span>
              </div>
              <div className="text-xl font-bold text-[#B6C948]">{challenge.completion_rate}%</div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-[#1A2313] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Tijdschema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[#8BAE5A] mb-1">Startdatum</div>
                <div className="text-white font-medium">{formatDate(challenge.start_date)}</div>
              </div>
              <div>
                <div className="text-sm text-[#8BAE5A] mb-1">Einddatum</div>
                <div className="text-white font-medium">{formatDate(challenge.end_date)}</div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Vereisten</h3>
            <div className="space-y-2">
              {challenge.requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[#8BAE5A]">{requirement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Beloningen</h3>
            <div className="space-y-2">
              {challenge.rewards.map((reward, index) => (
                <div key={index} className="flex items-start gap-3">
                  <TrophyIcon className="w-5 h-5 text-[#B6C948] flex-shrink-0 mt-0.5" />
                  <span className="text-[#8BAE5A]">{reward}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#3A4D23]/40">
          <div className="flex gap-3">
            <AdminButton
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Sluiten
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleStartChallenge}
              disabled={isStarting}
              icon={<PlayIcon className="w-4 h-4" />}
              className="flex-1"
            >
              {isStarting ? 'Starten...' : 'Start Challenge'}
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  );
}
