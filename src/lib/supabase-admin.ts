import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not configured properly');
  console.error('Please create a .env.local file with your Supabase credentials');
  console.error('See ENVIRONMENT_SETUP.md for instructions');
}

if (!supabaseServiceKey || supabaseServiceKey === 'placeholder-service-key') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not configured properly');
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
  console.error('This key can be found in your Supabase dashboard under Settings > API');
  console.error('See ENVIRONMENT_SETUP.md for instructions');
}

// Use fallback values for development, but warn the user
const finalSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalSupabaseServiceKey = supabaseServiceKey || 'placeholder-service-key';

export const supabaseAdmin = createClient(finalSupabaseUrl, finalSupabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test the admin connection
supabaseAdmin.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Failed to connect to Supabase Admin:', error.message);
    if (error.message.includes('Invalid API key') || error.message.includes('Project not found')) {
      console.error('This usually means your SUPABASE_SERVICE_ROLE_KEY is not configured correctly');
      console.error('Please check ENVIRONMENT_SETUP.md for instructions');
    }
  } else {
    console.log('✅ Supabase Admin connection successful');
  }
}); 