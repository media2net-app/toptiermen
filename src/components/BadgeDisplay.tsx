'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  image_url?: string;
  rarity_level: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  unlocked_at?: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
  maxDisplay?: number;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function BadgeDisplay({ 
  badges, 
  maxDisplay = 6, 
  showTitle = true, 
  size = 'md',
  loading = false
}: BadgeDisplayProps) {
  const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-400/10';
      case 'rare': return 'bg-blue-400/10';
      case 'epic': return 'bg-purple-400/10';
      case 'legendary': return 'bg-yellow-400/10';
      default: return 'bg-gray-400/10';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-12 h-12 text-lg';
      case 'lg': return 'w-16 h-16 text-2xl';
      default: return 'w-12 h-12 text-lg';
    }
  };

  // Show loading state, empty state, or demo badges
  if (loading) {
    return (
      <div className="relative">
        {showTitle && (
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-[#8BAE5A]">Behaalde Badges</h3>
            <div className="animate-pulse bg-[#3A4D23]/20 rounded h-5 w-8"></div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-[#3A4D23]/20 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Show demo badges if no real badges exist (only when not loading)
  const displayBadges = badges.length === 0 ? [
    {
      id: 'demo-1',
      title: 'Vroege Vogel',
      description: '5 dagen vroeg op',
      icon_name: '🌅',
      image_url: '/badge-no-excuses.png',
      rarity_level: 'common' as const,
      xp_reward: 100,
      unlocked_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: 'Workout King',
      description: '30 workouts voltooid',
      icon_name: '💪',
      image_url: '/badge-no-excuses.png',
      rarity_level: 'epic' as const,
      xp_reward: 500,
      unlocked_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      title: 'Academy Master',
      description: 'Je hebt alle Academy modules voltooid!',
      icon_name: '🎓',
      image_url: '/badge-no-excuses.png',
      rarity_level: 'legendary' as const,
      xp_reward: 1000,
      unlocked_at: new Date().toISOString()
    }
  ] : badges;

  const displayedBadges = displayBadges.slice(0, maxDisplay);
  const remainingCount = displayBadges.length - maxDisplay;

  return (
    <div className="relative">
      {showTitle && (
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-[#8BAE5A]">Behaalde Badges</h3>
          <span className="text-sm text-[#A6C97B]">({displayBadges.length})</span>
          {badges.length === 0 && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              Demo
            </span>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {displayedBadges.map((badge) => (
          <div
            key={badge.id}
            className="relative"
            onMouseEnter={() => setHoveredBadge(badge)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <div
              className={`
                ${getSizeClasses(size)} 
                ${getRarityColor(badge.rarity_level)}
                rounded-full flex items-center justify-center cursor-pointer
                transition-all duration-200 hover:scale-110 hover:shadow-lg
                relative group overflow-hidden
              `}
            >
              {badge.image_url ? (
                <img 
                  src={badge.image_url} 
                  alt={badge.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="drop-shadow-sm">{badge.icon_name}</span>
              )}
              
              {/* Glow effect for legendary badges */}
              {badge.rarity_level === 'legendary' && (
                <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" />
              )}
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
              {hoveredBadge?.id === badge.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2"
                >
                  <div className="bg-[#181F17] border border-[#3A4D23] rounded-lg p-4 shadow-xl min-w-[280px] max-w-[320px]">
                    {/* Badge Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${getRarityColor(badge.rarity_level)} rounded-full flex items-center justify-center overflow-hidden`}>
                        {badge.image_url ? (
                          <img 
                            src={badge.image_url} 
                            alt={badge.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">{badge.icon_name}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#8BAE5A] text-sm">{badge.title}</h4>
                        <span className={`text-xs font-medium ${getRarityTextColor(badge.rarity_level)}`}>
                          {badge.rarity_level.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Badge Description */}
                    <p className="text-[#A6C97B] text-sm mb-3 leading-relaxed">
                      {badge.description}
                    </p>

                    {/* Badge Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8BAE5A]">XP Reward:</span>
                        <span className="text-[#B6C948] font-semibold">+{badge.xp_reward}</span>
                      </div>
                      
                      {badge.unlocked_at && (
                        <div className="text-[#8BAE5A]/70">
                          {new Date(badge.unlocked_at).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#181F17]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Show remaining count if there are more badges */}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-[#232D1A] rounded-full flex items-center justify-center">
              <span className="text-[#8BAE5A] text-sm font-semibold">+{remainingCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Badge Stats Summary */}
      {showTitle && displayBadges.length > 0 && (
        <div className="mt-3 text-xs text-[#A6C97B]/70">
          <div className="flex items-center gap-4">
            <span>Legendary: {displayBadges.filter(b => b.rarity_level === 'legendary').length}</span>
            <span>Epic: {displayBadges.filter(b => b.rarity_level === 'epic').length}</span>
            <span>Rare: {displayBadges.filter(b => b.rarity_level === 'rare').length}</span>
            <span>Common: {displayBadges.filter(b => b.rarity_level === 'common').length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
