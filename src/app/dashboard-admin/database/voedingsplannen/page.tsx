'use client';

import { useEffect, useState } from 'react';

type Row = {
  userId: string;
  email: string | null;
  fullName: string | null;
  selectedPlanId: string | null;
  selectedPlanName: string | null;
  planGoal: string | null;
  fitnessGoal: string | null;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  daysSinceStart: number;
  hasCustomPlans: boolean;
  customPlanCount: number;
  isActive: boolean;
  lastUpdated: string | null;
};

export default function VoedingsplannenDBPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/database/voedingsplannen', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRows(data.rows || []);
    } catch (e: any) {
      setError(e?.message || 'Fout bij laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);


  const getStatusColor = (isActive: boolean, hasCustomPlans: boolean) => {
    if (hasCustomPlans) return 'bg-purple-600 text-white';
    if (isActive) return 'bg-green-600 text-white';
    return 'bg-yellow-600 text-white';
  };

  const getStatusText = (isActive: boolean, hasCustomPlans: boolean) => {
    if (hasCustomPlans) return 'Custom';
    if (isActive) return 'Actief';
    return 'Inactief';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#8BAE5A]">Database • Voedingsplannen</h1>
        <button
          onClick={load}
          className="px-3 py-2 rounded-lg bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] hover:bg-[#1F2819]"
        >
          Vernieuwen
        </button>
      </div>

      {loading && (
        <div className="text-[#B6C948]">Laden...</div>
      )}
      {error && (
        <div className="text-red-400">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-auto border border-[#3A4D23] rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-[#232D1A] text-[#8BAE5A]">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Naam</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Calorieën</th>
                <th className="px-4 py-3 text-left">Eiwit</th>
                <th className="px-4 py-3 text-left">Koolhydraten</th>
                <th className="px-4 py-3 text-left">Vetten</th>
                <th className="px-4 py-3 text-left">Dagen</th>
                <th className="px-4 py-3 text-left">Custom</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3820] text-[#B6C948]">
              {rows.map((r) => {
                const status = getStatusText(r.isActive, r.hasCustomPlans);
                const statusColor = getStatusColor(r.isActive, r.hasCustomPlans);
                
                return (
                  <tr key={r.userId} className="hover:bg-[#1A2318]">
                    <td className="px-4 py-2">{r.email}</td>
                    <td className="px-4 py-2">{r.fullName}</td>
                    <td className="px-4 py-2">{r.selectedPlanName || 'Geen plan geselecteerd'}</td>
                    <td className="px-4 py-2">{r.targetCalories > 0 ? r.targetCalories : '-'}</td>
                    <td className="px-4 py-2">{r.targetProtein > 0 ? `${r.targetProtein}g` : '-'}</td>
                    <td className="px-4 py-2">{r.targetCarbs > 0 ? `${r.targetCarbs}g` : '-'}</td>
                    <td className="px-4 py-2">{r.targetFat > 0 ? `${r.targetFat}g` : '-'}</td>
                    <td className="px-4 py-2">{r.daysSinceStart}</td>
                    <td className="px-4 py-2">
                      {r.hasCustomPlans ? (
                        <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                          {r.customPlanCount}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="text-center py-8 text-[#B6C948]">
          Geen voedingsplan data gevonden.
        </div>
      )}
    </div>
  );
}
