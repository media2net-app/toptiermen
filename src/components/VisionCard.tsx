import React from 'react';

interface VisionCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function VisionCard({ title, children, icon, className = '' }: VisionCardProps) {
  return (
    <div
      className={`bg-[#232D1A] rounded-2xl p-6 flex flex-col items-center border border-[#3A4D23] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(182,201,72,0.15)] ${className}`}
    >
      {icon && <div className="mb-3 text-3xl text-[#B6C948]">{icon}</div>}
      <h3 className="text-xl font-bold text-[#B6C948] mb-4 text-center font-figtree">{title}</h3>
      <div className="w-full flex-1 flex flex-col items-center justify-center text-white/90 font-figtree">
        {children}
      </div>
    </div>
  );
} 