'use client';

import { useEffect, useState } from 'react';

type Row = {
  userId: string;
  email: string | null;
  fullName: string | null;
  selectedSchemaId: string | null;
  selectedSchemaName: string | null;
  selectedSchemaNumber: number | null;
  trainingFrequency: number;
  totalDaysCompleted: number;
  weeksCompleted: number;
  completedAt: string | null;
};

export default function TrainingschemasDBPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/database/trainingschemas', { cache: 'no-store' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#8BAE5A]">Database • Trainingschemas</h1>
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
                <th className="px-4 py-3 text-left">Schema</th>
                <th className="px-4 py-3 text-left">Nr</th>
                <th className="px-4 py-3 text-left">Frequentie</th>
                <th className="px-4 py-3 text-left">Dagen</th>
                <th className="px-4 py-3 text-left">Weken</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3820] text-[#B6C948]">
              {rows.map((r) => {
                const status = r.completedAt ? 'Voltooid' : (r.weeksCompleted >= 8 ? 'Voltooid (auto)' : 'In progress');
                return (
                  <tr key={r.userId} className="hover:bg-[#1A2318]">
                    <td className="px-4 py-2">{r.email}</td>
                    <td className="px-4 py-2">{r.fullName}</td>
                    <td className="px-4 py-2">{r.selectedSchemaName || '-'}</td>
                    <td className="px-4 py-2">{r.selectedSchemaNumber ?? '-'}</td>
                    <td className="px-4 py-2">{r.trainingFrequency}</td>
                    <td className="px-4 py-2">{r.totalDaysCompleted}</td>
                    <td className="px-4 py-2">{r.weeksCompleted}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${status.startsWith('Voltooid') ? 'bg-green-700 text-white' : 'bg-yellow-800 text-yellow-100'}`}>
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
    </div>
  );
}
