import React from 'react';

interface AdminButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export default function AdminButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon
}: AdminButtonProps) {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] hover:from-[#A6C97B] hover:to-[#FFE55C] shadow-lg",
    secondary: "bg-[#181F17] text-gray-400 border border-[#3A4D23] hover:bg-[#232D1A] hover:text-[#8BAE5A]",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg"
  };

  const sizeClasses = {
    sm: "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-9 min-w-[70px] sm:min-w-[80px]",
    md: "px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm h-9 sm:h-10 min-w-[90px] sm:min-w-[100px]",
    lg: "px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base h-10 sm:h-12 min-w-[100px] sm:min-w-[120px]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="leading-none text-center">{children}</span>
    </button>
  );
} 