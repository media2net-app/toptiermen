const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateUserRob() {
  try {
    console.log('👤 Updating user: rob');
    
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ List users error:', listError.message);
      return;
    }

    const robUser = users.users.find(user => user.email === 'rob@media2net.nl');
    
    if (!robUser) {
      console.log('❌ User rob@media2net.nl not found');
      return;
    }

    console.log('✅ Found existing user:', robUser.id);

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      robUser.id,
      {
        password: 'RZ201328',
        user_metadata: {
          username: 'rob',
          full_name: 'Rob'
        }
      }
    );

    if (updateError) {
      console.log('❌ Update auth error:', updateError.message);
    } else {
      console.log('✅ User auth updated');
    }

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', robUser.id)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.log('❌ Profile check error:', profileCheckError.message);
      return;
    }

    if (existingProfile) {
      // Update existing profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: 'Rob',
          full_name: 'Rob',
          email: 'rob@media2net.nl',
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
          updated_at: new Date().toISOString()
        })
        .eq('id', robUser.id)
        .select()
        .single();

      if (profileError) {
        console.log('❌ Profile update error:', profileError.message);
      } else {
        console.log('✅ Profile updated:', profileData.display_name);
      }
    } else {
      // Create new profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: robUser.id,
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
        console.log('❌ Profile create error:', profileError.message);
      } else {
        console.log('✅ Profile created:', profileData.display_name);
      }
    }

    // Check and create user preferences
    const { data: existingPrefs, error: prefsCheckError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', robUser.id);

    if (prefsCheckError) {
      console.log('❌ Preferences check error:', prefsCheckError.message);
    } else if (!existingPrefs || existingPrefs.length === 0) {
      // Create user preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .insert([
          {
            user_id: robUser.id,
            preference_key: 'daily_completion_dismissed',
            preference_value: 'false',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            user_id: robUser.id,
            preference_key: 'almost_completed_dismissed',
            preference_value: 'false',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            user_id: robUser.id,
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
    } else {
      console.log('✅ User preferences already exist');
    }

    // Check and create user XP record
    const { data: existingXP, error: xpCheckError } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', robUser.id)
      .single();

    if (xpCheckError && xpCheckError.code !== 'PGRST116') {
      console.log('❌ XP check error:', xpCheckError.message);
    } else if (!existingXP) {
      // Create user XP record
      const { error: xpError } = await supabase
        .from('user_xp')
        .insert({
          user_id: robUser.id,
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
    } else {
      console.log('✅ User XP record already exists');
    }

    // Check and create user presence record
    const { data: existingPresence, error: presenceCheckError } = await supabase
      .from('user_presence')
      .select('*')
      .eq('user_id', robUser.id)
      .single();

    if (presenceCheckError && presenceCheckError.code !== 'PGRST116') {
      console.log('❌ Presence check error:', presenceCheckError.message);
    } else if (!existingPresence) {
      // Create user presence record
      const { error: presenceError } = await supabase
        .from('user_presence')
        .insert({
          user_id: robUser.id,
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
    } else {
      console.log('✅ User presence record already exists');
    }

    console.log('\n🎉 User "rob" successfully updated!');
    console.log('📧 Email: rob@media2net.nl');
    console.log('🔑 Password: RZ201328');
    console.log('🆔 User ID:', robUser.id);

  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
}

updateUserRob(); 