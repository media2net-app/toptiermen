import React from 'react';

interface AdminCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

export default function AdminCard({ 
  title, 
  children, 
  className = '', 
  gradient = false,
  icon,
  subtitle 
}: AdminCardProps) {
  const baseClasses = "bg-[#232D1A] border border-[#3A4D23] rounded-xl p-6";
  const gradientClasses = gradient ? "bg-gradient-to-br from-[#232D1A] to-[#181F17]" : "";
  
  return (
    <div className={`${baseClasses} ${gradientClasses} ${className}`}>
      {(title || icon || subtitle) && (
        <div className="mb-4">
          {title && (
            <div className="flex items-center gap-3 mb-2">
              {icon && <div className="text-[#8BAE5A]">{icon}</div>}
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
          )}
          {subtitle && (
            <p className="text-gray-400 text-sm">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
} 