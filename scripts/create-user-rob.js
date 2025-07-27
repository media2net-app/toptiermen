const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUserRob() {
  try {
    console.log('👤 Creating user: rob');
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'rob@media2net.nl',
      password: 'RZ201328',
      email_confirm: true,
      user_metadata: {
        username: 'rob',
        full_name: 'Rob'
      }
    });

    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }

    console.log('✅ User created in Auth:', authData.user.id);

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        display_name: 'Rob',
        full_name: 'Rob',
        email: 'rob@media2net.nl',
        avatar_url: null,
        bio: null,
        location: null,
        website: null,
        phone: null,
        date_of_birth: null,
        gender: null,
        interests: [],
        rank: 'Beginner',
        points: 0,
        missions_completed: 0,
        cover_url: null,
        is_public: true,
        show_email: false,
        show_phone: false,
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.log('❌ Profile error:', profileError.message);
      return;
    }

    console.log('✅ Profile created:', profileData.display_name);

    // Create user preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert([
        {
          user_id: authData.user.id,
          preference_key: 'daily_completion_dismissed',
          preference_value: 'false',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          user_id: authData.user.id,
          preference_key: 'almost_completed_dismissed',
          preference_value: 'false',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          user_id: authData.user.id,
          preference_key: 'last_dismiss_date',
          preference_value: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (prefsError) {
      console.log('❌ Preferences error:', prefsError.message);
    } else {
      console.log('✅ User preferences created');
    }

    // Create user XP record
    const { error: xpError } = await supabase
      .from('user_xp')
      .insert({
        user_id: authData.user.id,
        total_xp: 0,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (xpError) {
      console.log('❌ XP error:', xpError.message);
    } else {
      console.log('✅ User XP record created');
    }

    // Create user presence record
    const { error: presenceError } = await supabase
      .from('user_presence')
      .insert({
        user_id: authData.user.id,
        status: 'offline',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (presenceError) {
      console.log('❌ Presence error:', presenceError.message);
    } else {
      console.log('✅ User presence record created');
    }

    console.log('\n🎉 User "rob" successfully created!');
    console.log('📧 Email: rob@media2net.nl');
    console.log('🔑 Password: RZ201328');
    console.log('🆔 User ID:', authData.user.id);

  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createUserRob(); 