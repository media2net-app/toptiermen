const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const testEmail = 'test.user.1756630044380@toptiermen.test';
  const testPassword = 'test123';
  
  console.log('🔍 Testing login functionality...\n');
  console.log('📧 Email:', testEmail);
  console.log('🔑 Password:', testPassword);
  console.log('🌐 Supabase URL:', supabaseUrl);
  console.log('🔑 Supabase Key:', supabaseKey ? '✅ Present' : '❌ Missing');
  
  try {
    console.log('\n🔄 Attempting login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('Error details:', error);
      return;
    }

    if (data.user) {
      console.log('✅ Login successful!');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('🔑 Session:', data.session ? '✅ Present' : '❌ Missing');
      
      if (data.session) {
        console.log('🎫 Access Token:', data.session.access_token ? '✅ Present' : '❌ Missing');
        console.log('🔄 Refresh Token:', data.session.refresh_token ? '✅ Present' : '❌ Missing');
      }
      
      // Test profile fetch
      console.log('\n🔄 Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message);
      } else {
        console.log('✅ Profile fetched successfully');
        console.log('👤 Full Name:', profile.full_name);
        console.log('🎭 Role:', profile.role);
        console.log('🎯 Main Goal:', profile.main_goal);
      }
      
    } else {
      console.log('❌ No user data returned');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testLogin();
