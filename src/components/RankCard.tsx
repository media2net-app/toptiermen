'use client';

import { useState } from 'react';
import { StarIcon, TrophyIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface RankCardProps {
  rank: {
    id: number;
    name: string;
    icon_name: string;
    badges_needed: number;
    xp_needed: number;
    unlock_description: string;
    rank_order: number;
  };
  currentRank?: {
    rank_order: number;
  };
  userXP?: number;
  badgesUnlocked?: number;
  isUnlocked?: boolean;
  isNextRank?: boolean;
}

export default function RankCard({ 
  rank, 
  currentRank, 
  userXP = 0, 
  badgesUnlocked = 0, 
  isUnlocked = false,
  isNextRank = false 
}: RankCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getRankIcon = (rankOrder: number) => {
    if (rankOrder <= 2) return '⭐';
    if (rankOrder <= 4) return '🏆';
    if (rankOrder <= 6) return '👑';
    return '💎';
  };

  const getRankColor = () => {
    if (isUnlocked) return 'border-green-500 bg-green-900/20';
    if (isNextRank) return 'border-yellow-500 bg-yellow-900/20';
    return 'border-gray-600 bg-gray-900/20';
  };

  const getProgressPercentage = () => {
    if (isUnlocked) return 100;
    if (!isNextRank) return 0;
    
    const previousRank = rank.rank_order - 1;
    const previousXP = previousRank === 0 ? 0 : (previousRank * 1000); // Simplified calculation
    const currentRankXP = rank.xp_needed;
    const userProgress = userXP - previousXP;
    const rankXPNeeded = currentRankXP - previousXP;
    
    return Math.min((userProgress / rankXPNeeded) * 100, 100);
  };

  const getBadgeProgressPercentage = () => {
    if (isUnlocked) return 100;
    if (!isNextRank) return 0;
    
    return Math.min((badgesUnlocked / rank.badges_needed) * 100, 100);
  };

  return (
    <div
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
        isUnlocked ? 'cursor-default' : 'cursor-pointer hover:scale-105'
      } ${getRankColor()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rank Order Badge */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${
        isUnlocked 
          ? 'bg-green-500 text-white' 
          : isNextRank 
          ? 'bg-yellow-500 text-black' 
          : 'bg-gray-600 text-gray-300'
      }`}>
        #{rank.rank_order}
      </div>

      {/* Rank Content */}
      <div className="text-center">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl ${
          isUnlocked 
            ? 'bg-green-500/20 text-green-400' 
            : isNextRank 
            ? 'bg-yellow-500/20 text-yellow-400' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {getRankIcon(rank.rank_order)}
        </div>

        {/* Rank Name */}
        <h3 className={`text-xl font-bold mb-2 ${
          isUnlocked 
            ? 'text-green-400' 
            : isNextRank 
            ? 'text-yellow-400' 
            : 'text-gray-400'
        }`}>
          {rank.name}
        </h3>

        {/* XP Required */}
        <div className="text-sm text-[#B6C948] mb-3">
          {rank.xp_needed.toLocaleString()} XP
        </div>

        {/* Badges Required */}
        <div className="text-sm text-[#8BAE5A] mb-4">
          {rank.badges_needed} badges
        </div>

        {/* Progress Bars */}
        {isNextRank && (
          <div className="space-y-2 mb-4">
            {/* XP Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>XP Progress</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Badge Progress */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Badge Progress</span>
                <span>{badgesUnlocked}/{rank.badges_needed}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getBadgeProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Unlock Description */}
        <p className="text-xs text-gray-300 line-clamp-2">
          {rank.unlock_description}
        </p>
      </div>

      {/* Status Indicator */}
      {isUnlocked && (
        <div className="absolute bottom-2 left-2">
          <div className="flex items-center gap-1 text-green-400 text-xs">
            <SparklesIcon className="w-4 h-4" />
            <span>Unlocked</span>
          </div>
        </div>
      )}

      {/* Hover Effect */}
      {isHovered && !isUnlocked && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
          <div className="text-center p-4">
            <h4 className="text-white font-semibold mb-2">Requirements</h4>
            <div className="text-gray-300 text-sm space-y-1">
              <p>• {rank.xp_needed.toLocaleString()} XP</p>
              <p>• {rank.badges_needed} badges</p>
              <p className="text-xs mt-2">{rank.unlock_description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 