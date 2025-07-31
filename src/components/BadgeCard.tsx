'use client';

import { useState } from 'react';
import { BadgeCheckIcon, LockClosedIcon, ClockIcon } from '@heroicons/react/24/outline';

interface BadgeCardProps {
  badge: {
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
  onBadgeClick?: (badgeId: number) => void;
}

export default function BadgeCard({ badge, userBadge, onBadgeClick }: BadgeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 text-gray-400';
      case 'rare': return 'border-blue-400 text-blue-400';
      case 'epic': return 'border-purple-400 text-purple-400';
      case 'legendary': return 'border-yellow-400 text-yellow-400';
      default: return 'border-gray-400 text-gray-400';
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
      return <BadgeCheckIcon className="w-6 h-6 text-green-500" />;
    } else if (userBadge?.status === 'progress') {
      return <ClockIcon className="w-6 h-6 text-yellow-500" />;
    } else {
      return <LockClosedIcon className="w-6 h-6 text-gray-500" />;
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

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        userBadge?.status === 'unlocked' 
          ? 'border-green-500 bg-green-900/10 hover:bg-green-900/20' 
          : userBadge?.status === 'progress'
          ? 'border-yellow-500 bg-yellow-900/10 hover:bg-yellow-900/20'
          : `border-gray-600 bg-gray-900/20 hover:bg-gray-900/40 ${getRarityColor(badge.rarity_level)}`
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onBadgeClick?.(badge.id)}
    >
      {/* Rarity Badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getRarityBg(badge.rarity_level)} ${getRarityColor(badge.rarity_level)}`}>
        {badge.rarity_level.toUpperCase()}
      </div>

      {/* Status Icon */}
      <div className="absolute top-2 left-2">
        {getStatusIcon()}
      </div>

      {/* Badge Content */}
      <div className="mt-8 text-center">
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
          userBadge?.status === 'unlocked' 
            ? 'bg-green-500/20 text-green-400' 
            : userBadge?.status === 'progress'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          <span className="text-2xl">🏆</span>
        </div>

        {/* Title */}
        <h3 className={`font-semibold mb-2 ${
          userBadge?.status === 'unlocked' 
            ? 'text-green-400' 
            : userBadge?.status === 'progress'
            ? 'text-yellow-400'
            : 'text-gray-400'
        }`}>
          {badge.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {badge.description}
        </p>

        {/* XP Reward */}
        <div className="text-xs text-[#B6C948] font-semibold mb-3">
          +{badge.xp_reward} XP
        </div>

        {/* Progress Bar */}
        {userBadge?.status === 'progress' && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        )}

        {/* Unlock Date */}
        {userBadge?.status === 'unlocked' && userBadge.unlocked_at && (
          <div className="text-xs text-green-400">
            Unlocked: {new Date(userBadge.unlocked_at).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <div className="text-center p-4">
            <h4 className="text-white font-semibold mb-2">Requirements</h4>
            <p className="text-gray-300 text-sm">
              {badge.requirements?.type === 'daily_check' && `${badge.requirements.count} days`}
              {badge.requirements?.type === 'early_wake' && `${badge.requirements.count} early mornings`}
              {badge.requirements?.type === 'books_read' && `${badge.requirements.count} books`}
              {badge.requirements?.type === 'distance_run' && `${badge.requirements.distance}km run`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 