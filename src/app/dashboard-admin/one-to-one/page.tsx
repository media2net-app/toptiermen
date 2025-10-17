'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface O2OClient {
  id: string;
  email: string;
  full_name?: string;
  is_one_to_one?: boolean;
  coach_id?: string | null;
}

export default function OneToOneAdminPage() {
  const { user, isAdmin } = useSupabaseAuth();
  const [clients, setClients] = useState<O2OClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [onlyMyClients, setOnlyMyClients] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      let q = supabase
        .from('profiles')
        .select('id,email,full_name,is_one_to_one,coach_id')
        .eq('is_one_to_one', true)
        .order('full_name', { ascending: true, nullsFirst: true });

      // Non-admin coaches: enforce own clients
      if (!isAdmin && user?.id) {
        q = q.eq('coach_id', user.id);
      } else if (isAdmin && onlyMyClients && user?.id) {
        q = q.eq('coach_id', user.id);
      }

      if (query.trim()) {
        const ql = query.trim().toLowerCase();
        // Client-side filter after fetch to keep simple
        const { data, error } = await q;
        if (error) throw error;
        const filtered = (data || []).filter((c: any) =>
          (c.full_name || '').toLowerCase().includes(ql) || (c.email || '').toLowerCase().includes(ql)
        );
      	setClients(filtered as O2OClient[]);
      } else {
        const { data, error } = await q;
        if (error) throw error;
        setClients((data || []) as O2OClient[]);
      }
    } catch (e) {
      console.error('Failed to load 1:1 clients', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMyClients]);

  const visible = useMemo(() => clients, [clients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-[#8BAE5A]" /> 1:1 Coaching
        </h1>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={onlyMyClients}
                onChange={(e) => setOnlyMyClients(e.target.checked)}
              />
              Alleen mijn cliënten
            </label>
          )}
          <button
            onClick={fetchClients}
            className="px-3 py-2 rounded-lg bg-[#232D1A] border border-[#3A4D23] text-[#8BAE5A] hover:bg-[#2B3820]"
          >
            Vernieuwen
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchClients(); }}
            placeholder="Zoek op naam of e-mail"
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-[#181F17] border border-[#3A4D23] text-white focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          />
        </div>
        <button
          onClick={fetchClients}
          className="px-3 py-2 rounded-lg bg-[#8BAE5A] text-black font-semibold hover:bg-[#A6C97B]"
        >
          Zoeken
        </button>
      </div>

      <div className="bg-[#232D1A] border border-[#3A4D23] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr] gap-2 px-4 py-3 text-xs text-gray-400 border-b border-[#3A4D23]">
          <div>Naam</div>
          <div>E-mail</div>
          <div>Acties</div>
        </div>
        {loading ? (
          <div className="p-6 text-gray-400">Laden...</div>
        ) : visible.length === 0 ? (
          <div className="p-6 text-gray-400">Geen 1:1 cliënten gevonden.</div>
        ) : (
          <div className="divide-y divide-[#3A4D23]">
            {visible.map((c) => (
              <div key={c.id} className="grid grid-cols-[2fr_2fr_1fr] items-center gap-2 px-4 py-3 text-sm">
                <div className="text-white">{c.full_name || '—'}</div>
                <div className="text-gray-300">{c.email}</div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/one-to-one`}
                    className="px-3 py-1 rounded-lg bg-[#8BAE5A] text-black text-xs font-semibold hover:bg-[#A6C97B]"
                    title="Bekijk als klant (client dashboard)"
                  >
                    Client Dashboard
                  </Link>
                  <Link
                    href={`/dashboard-admin/ledenbeheer`}
                    className="px-3 py-1 rounded-lg bg-[#232D1A] border border-[#3A4D23] text-[#8BAE5A] text-xs hover:bg-[#2B3820]"
                    title="Open ledenbeheer"
                  >
                    Ledenbeheer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Binnenkort: notities, sessies en doelen beheren per cliënt.
      </div>
    </div>
  );
}
