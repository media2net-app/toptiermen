import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  interactive?: boolean;
}

const cardVariants = {
  default: 'bg-[#232D1A]/80 border border-[#3A4D23]/40',
  elevated: 'bg-[#232D1A]/90 border border-[#8BAE5A]/40 shadow-xl',
  outlined: 'bg-[#181F17]/90 border border-[#3A4D23]'
};

const cardPadding = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8'
};

export default function Card({ 
  children, 
  className,
  padding = 'md',
  variant = 'default',
  hover = false,
  interactive = false
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl sm:rounded-2xl shadow-xl w-full max-w-full box-border overflow-hidden',
        cardVariants[variant],
        cardPadding[padding],
        hover && 'hover:shadow-2xl hover:border-[#8BAE5A]/60 transition-all duration-200',
        interactive && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 touch-manipulation',
        className
      )}
      style={{ 
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
}

// Card sub-components for better structure
export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-xl font-bold text-white mb-2', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('space-y-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('mt-6 pt-4 border-t border-[#3A4D23]/40', className)}>
      {children}
    </div>
  );
} 