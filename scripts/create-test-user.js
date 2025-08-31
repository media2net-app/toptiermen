const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  console.log('👤 Creating test user for dashboard...\n');

  try {
    const testEmail = 'test@toptiermen.eu';
    const testPassword = 'TestPassword123!';
    const testName = 'Test User';

    // 1. Create auth user
    console.log('1️⃣ Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: testName
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️ User already exists, getting existing user...');
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === testEmail);
        if (user) {
          console.log('✅ Found existing user:', user.id);
          return { user, password: testPassword };
        }
      } else {
        console.error('❌ Auth user creation failed:', authError);
        return null;
      }
    } else {
      console.log('✅ Auth user created:', authData.user.id);
    }

    const userId = authData?.user?.id;

    // 2. Create profile
    console.log('2️⃣ Creating user profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: testEmail,
        full_name: testName,
        role: 'USER',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      if (profileError.code === '23505') { // Unique constraint violation
        console.log('⚠️ Profile already exists');
      } else {
        console.error('❌ Profile creation failed:', profileError);
      }
    } else {
      console.log('✅ Profile created:', profileData.id);
    }

    // 3. Create some basic data for dashboard
    console.log('3️⃣ Creating dashboard data...');
    
    // Create a mission
    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .insert({
        user_id: userId,
        title: 'Test Mission',
        description: 'This is a test mission for dashboard testing',
        category: 'fitness',
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (missionError) {
      console.log('⚠️ Mission creation failed (might already exist):', missionError.message);
    } else {
      console.log('✅ Test mission created');
    }

    console.log('\n🎯 Test user ready!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('👤 Name:', testName);
    console.log('🆔 User ID:', userId);
    
    console.log('\n💡 You can now login at: http://localhost:3000/login');
    console.log('   Then go to: http://localhost:3000/dashboard');

    return { user: authData?.user, password: testPassword };

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    return null;
  }
}

createTestUser();
