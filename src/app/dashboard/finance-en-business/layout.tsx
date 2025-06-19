'use client';
import { FinanceProvider } from './FinanceContext';

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      {children}
    </FinanceProvider>
  );
} 