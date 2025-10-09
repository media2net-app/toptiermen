'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton Supabase client for the browser to avoid multiple GoTrue instances
// Reuses the same instance across components/pages via window cache
const getBrowserClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    // Should not be imported server-side, but guard anyway
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    return createClient(url, key, {
      auth: {
        storageKey: 'toptiermen-v2-auth',
      },
    });
  }

  const w = window as any;
  if (!w.__ttm_supabase_client__) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    w.__ttm_supabase_client__ = createClient(url, key, {
      auth: {
        storageKey: 'toptiermen-v2-auth',
      },
    });
  }
  return w.__ttm_supabase_client__ as SupabaseClient;
};

export const supabaseBrowser = getBrowserClient();
