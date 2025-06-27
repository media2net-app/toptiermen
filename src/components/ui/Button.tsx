import { ReactNode, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-[#8BAE5A] to-[#FFD700] text-[#181F17] font-semibold shadow-lg hover:from-[#FFD700] hover:to-[#8BAE5A] transition-all active:scale-95',
  secondary: 'bg-gradient-to-r from-[#8BAE5A] to-[#f0a14f] text-[#181F17] font-semibold shadow hover:from-[#B6C948] hover:to-[#8BAE5A] transition-all',
  outline: 'bg-[#181F17] text-[#8BAE5A] font-semibold border border-[#3A4D23] hover:bg-[#232D1A] transition-all',
  ghost: 'bg-[#3A4D23] text-[#8BAE5A] font-semibold hover:bg-[#4A5D33] transition-all',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition-all'
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl'
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        loading && 'opacity-75 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed',
        'touch-manipulation',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Laden...
        </div>
      ) : (
        children
      )}
    </button>
  );
} 