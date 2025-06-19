"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Asset = { name: string; value: number };
export type Debt = { name: string; value: number };
export type FinanceData = {
  assets: Asset[];
  debts: Debt[];
  income: number;
  savings: number;
  checkinDate: string | null;
};

const defaultFinance: FinanceData = {
  assets: [
    { name: 'Spaarrekening', value: 5000 },
    { name: 'Aandelen', value: 2500 },
  ],
  debts: [
    { name: 'Hypotheek', value: 120000 },
  ],
  income: 3000,
  savings: 500,
  checkinDate: null,
};

export const FinanceContext = createContext<{
  finance: FinanceData;
  updateFinance: (data: Partial<FinanceData>) => void;
} | undefined>(undefined);

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within a FinanceProvider');
  return ctx;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [finance, setFinance] = useState<FinanceData>(defaultFinance);

  function updateFinance(data: Partial<FinanceData>) {
    setFinance(prev => ({ ...prev, ...data, checkinDate: new Date().toISOString() }));
  }

  return (
    <FinanceContext.Provider value={{ finance, updateFinance }}>
      {children}
    </FinanceContext.Provider>
  );
} 