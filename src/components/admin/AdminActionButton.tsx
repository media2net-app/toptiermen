import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AdminActionButtonProps {
  variant: 'edit' | 'delete' | 'view' | 'hide' | 'custom';
  onClick: (e?: React.MouseEvent) => void;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AdminActionButton({
  variant,
  onClick,
  size = 'sm',
  className = '',
  disabled = false,
  title,
  icon,
  children
}: AdminActionButtonProps) {
  const baseClasses = "flex items-center justify-center gap-1 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    edit: "text-[#8BAE5A] hover:text-white hover:bg-[#3A4D23]",
    delete: "text-red-400 hover:text-red-300 hover:bg-[#3A4D23]",
    view: "text-blue-400 hover:text-blue-300 hover:bg-[#3A4D23]",
    hide: "text-yellow-400 hover:text-yellow-300 hover:bg-[#3A4D23]",
    custom: "text-gray-400 hover:text-white hover:bg-[#3A4D23]"
  };

  const sizeClasses = {
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm"
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'edit': return <PencilIcon className="w-4 h-4" />;
      case 'delete': return <TrashIcon className="w-4 h-4" />;
      case 'view': return <EyeIcon className="w-4 h-4" />;
      case 'hide': return <EyeSlashIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const getDefaultText = () => {
    switch (variant) {
      case 'edit': return 'Bewerk';
      case 'delete': return 'Verwijder';
      case 'view': return 'Bekijk';
      case 'hide': return 'Verberg';
      default: return '';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon || getDefaultIcon()}
      {(children || getDefaultText()) && (
        <span className="hidden sm:inline">{children || getDefaultText()}</span>
      )}
    </button>
  );
}
