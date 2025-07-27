import React from 'react';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'green' | 'orange' | 'blue' | 'purple' | 'red';
  subtitle?: string;
  className?: string;
  loading?: boolean;
}

export default function AdminStatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'green',
  subtitle,
  className = '',
  loading = false
}: AdminStatsCardProps) {
  const colorClasses = {
    green: 'from-[#8BAE5A]/10 to-[#FFD700]/10 border-[#8BAE5A] text-[#8BAE5A]',
    orange: 'from-[#f0a14f]/10 to-[#FFD700]/10 border-[#f0a14f] text-[#f0a14f]',
    blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500 text-blue-500',
    purple: 'from-purple-500/10 to-pink-500/10 border-purple-500 text-purple-500',
    red: 'from-red-500/10 to-pink-500/10 border-red-500 text-red-500'
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="animate-pulse bg-[#3A4D23] h-4 rounded mb-2"></div>
            <div className="animate-pulse bg-[#3A4D23] h-8 rounded"></div>
          </div>
          <div className="animate-pulse bg-[#3A4D23] w-8 h-8 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${color === 'green' ? 'text-[#8BAE5A]' : color === 'orange' ? 'text-[#f0a14f]' : ''}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${color === 'green' ? 'text-[#8BAE5A]' : color === 'orange' ? 'text-[#f0a14f]' : ''}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              <span className="text-gray-400 text-xs">vs vorige periode</span>
            </div>
          )}
        </div>
        <div className={`${color === 'green' ? 'text-[#8BAE5A]' : color === 'orange' ? 'text-[#f0a14f]' : ''}`}>
          {icon}
        </div>
      </div>
    </div>
  );
} 