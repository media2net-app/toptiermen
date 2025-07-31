'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TrophyIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: {
    id: number;
    title: string;
    description: string;
    icon_name: string;
    rarity_level: string;
    xp_reward: number;
    requirements: any;
  };
  userBadge?: {
    status: 'locked' | 'progress' | 'unlocked';
    progress_data?: any;
    unlocked_at?: string;
  };
}

export default function BadgeModal({ isOpen, onClose, badge, userBadge }: BadgeModalProps) {
  if (!badge) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-900/20';
      case 'rare': return 'bg-blue-900/20';
      case 'epic': return 'bg-purple-900/20';
      case 'legendary': return 'bg-yellow-900/20';
      default: return 'bg-gray-900/20';
    }
  };

  const getStatusIcon = () => {
    if (userBadge?.status === 'unlocked') {
      return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
    } else if (userBadge?.status === 'progress') {
      return <ClockIcon className="w-8 h-8 text-yellow-500" />;
    } else {
      return <TrophyIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const getProgressPercentage = () => {
    if (!userBadge?.progress_data || userBadge.status === 'unlocked') return 0;
    
    const progress = userBadge.progress_data;
    const required = badge.requirements;
    
    if (required.type === 'daily_check' && progress.current) {
      return Math.min((progress.current / required.count) * 100, 100);
    }
    
    return 0;
  };

  const getRequirementText = () => {
    const req = badge.requirements;
    switch (req.type) {
      case 'daily_check': return `${req.count} dagen dagelijkse check-in`;
      case 'early_wake': return `${req.count} dagen vroeg opstaan`;
      case 'books_read': return `${req.count} boek${req.count > 1 ? 'en' : ''} lezen`;
      case 'distance_run': return `${req.distance}km hardlopen`;
      case 'workout_streak': return `${req.count} dagen workout streak`;
      case 'meditation_streak': return `${req.count} dagen meditatie streak`;
      default: return 'Onbekende vereiste';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#181F17] border border-[#3A4D23] p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                    Badge Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Badge Content */}
                <div className="text-center mb-6">
                  {/* Status Icon */}
                  <div className="mb-4">
                    {getStatusIcon()}
                  </div>

                  {/* Badge Icon */}
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
                    userBadge?.status === 'unlocked' 
                      ? 'bg-green-500/20 text-green-400' 
                      : userBadge?.status === 'progress'
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    🏆
                  </div>

                  {/* Title */}
                  <h2 className={`text-xl font-bold mb-2 ${
                    userBadge?.status === 'unlocked' 
                      ? 'text-green-400' 
                      : userBadge?.status === 'progress'
                      ? 'text-yellow-400' 
                      : 'text-gray-400'
                  }`}>
                    {badge.title}
                  </h2>

                  {/* Rarity Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${getRarityBg(badge.rarity_level)} ${getRarityColor(badge.rarity_level)}`}>
                    {badge.rarity_level.toUpperCase()}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4">
                    {badge.description}
                  </p>

                  {/* XP Reward */}
                  <div className="text-[#B6C948] font-semibold mb-4">
                    +{badge.xp_reward} XP Reward
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="bg-[#232D1A] rounded-lg p-4 mb-6">
                  <h4 className="text-[#8BAE5A] font-semibold mb-3">Requirements</h4>
                  <p className="text-gray-300 mb-3">
                    {getRequirementText()}
                  </p>

                  {/* Progress Bar */}
                  {userBadge?.status === 'progress' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Progress</span>
                        <span>{Math.round(getProgressPercentage())}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Unlock Date */}
                  {userBadge?.status === 'unlocked' && userBadge.unlocked_at && (
                    <div className="text-green-400 text-sm">
                      Unlocked: {new Date(userBadge.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Tips Section */}
                <div className="bg-[#232D1A] rounded-lg p-4">
                  <h4 className="text-[#8BAE5A] font-semibold mb-2">Tips</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Blijf consistent met je dagelijkse routine</li>
                    <li>• Track je voortgang regelmatig</li>
                    <li>• Vier kleine overwinningen</li>
                    <li>• Blijf gemotiveerd door je doelen</li>
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 