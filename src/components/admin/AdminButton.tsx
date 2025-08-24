"use client";

import React from 'react';

interface AdminButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  fullWidth?: boolean;
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
  icon,
  fullWidth = false
}: AdminButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed border";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#0A0F0A] hover:from-[#A6C97B] hover:to-[#FFE55C] shadow-lg border-transparent",
    secondary: "bg-[#232D1A] text-[#8BAE5A] border-[#3A4D23] hover:bg-[#181F17] hover:text-[#B6C948] hover:border-[#8BAE5A]",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg border-transparent",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg border-transparent"
  };

  const sizeClasses = {
    sm: "px-2 py-1.5 text-xs h-7",
    md: "px-4 py-2.5 text-sm h-10",
    lg: "px-6 py-3 text-base h-12"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {loading && (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-shrink-0">{children}</span>
    </button>
  );
} 