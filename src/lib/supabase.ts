import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not configured properly');
  console.error('Please create a .env.local file with your Supabase credentials');
  console.error('See ENVIRONMENT_SETUP.md for instructions');
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured properly');
  console.error('Please create a .env.local file with your Supabase credentials');
  console.error('See ENVIRONMENT_SETUP.md for instructions');
}

// Use fallback values for development, but warn the user
const finalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Verleng sessie timeout naar 30 dagen (2592000 seconden)
    storageKey: 'toptiermen-auth',
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      }
    }
  }
});

// Test the connection on client side
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      if (error.message.includes('Invalid API key') || error.message.includes('Project not found')) {
        console.error('This usually means your environment variables are not configured correctly');
        console.error('Please check ENVIRONMENT_SETUP.md for instructions');
      }
    } else {
      console.log('✅ Supabase connection successful');
    }
  });
} 