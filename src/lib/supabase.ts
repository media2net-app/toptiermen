import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable to prevent redirect loops
    flowType: 'implicit', // Use implicit flow for simpler session management
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-toptiermen-auth-token',
    // Reduced session management for stability
    debug: false // Disable debug logs to reduce noise
  }
});