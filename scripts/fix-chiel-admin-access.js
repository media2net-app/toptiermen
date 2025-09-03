const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixChielAdminAccess() {
  console.log('🔧 Fixing Chiel\'s admin access...\n');

  try {
    // 1. Check Chiel's current profile
    console.log('1️⃣ Checking Chiel\'s profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at, updated_at')
      .eq('email', 'chiel@media2net.nl')
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    if (!profile) {
      console.error('❌ Profile not found for chiel@media2net.nl');
      return;
    }

    console.log('📊 Current profile:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      updated_at: profile.updated_at
    });

    // 2. Update role to admin if not already
    if (profile.role !== 'admin') {
      console.log('\n2️⃣ Updating role to admin...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error('❌ Error updating role:', updateError);
        return;
      }
      console.log('✅ Role updated to admin');
    } else {
      console.log('✅ Role already set to admin');
    }

    // 3. Sync auth metadata
    console.log('\n3️⃣ Syncing auth metadata...');
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(profile.id, {
        user_metadata: { role: 'admin' }
      });

      if (authError) {
        console.error('❌ Error syncing auth metadata:', authError);
      } else {
        console.log('✅ Auth metadata synced successfully');
      }
    } catch (authException) {
      console.error('❌ Exception syncing auth metadata:', authException);
    }

    // 4. Force refresh user session
    console.log('\n4️⃣ Forcing session refresh...');
    try {
      const { error: refreshError } = await supabase.auth.admin.updateUserById(profile.id, {
        app_metadata: { 
          role: 'admin',
          last_updated: new Date().toISOString()
        }
      });

      if (refreshError) {
        console.error('❌ Error updating app metadata:', refreshError);
      } else {
        console.log('✅ App metadata updated');
      }
    } catch (refreshException) {
      console.error('❌ Exception updating app metadata:', refreshException);
    }

    // 5. Verify final state
    console.log('\n5️⃣ Verifying final state...');
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('id, email, role, updated_at')
      .eq('email', 'chiel@media2net.nl')
      .single();

    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);

    console.log('\n📊 FINAL STATUS:');
    console.log('  Database role:', finalProfile?.role);
    console.log('  Auth user_metadata.role:', authUser?.user?.user_metadata?.role);
    console.log('  Auth app_metadata.role:', authUser?.user?.app_metadata?.role);
    console.log('  Last updated:', finalProfile?.updated_at);

    if (finalProfile?.role === 'admin') {
      console.log('\n🎉 SUCCESS! Chiel now has admin access');
      console.log('📋 Next steps:');
      console.log('  1. Chiel should log out completely');
      console.log('  2. Log back in');
      console.log('  3. Try accessing admin dashboard');
    } else {
      console.log('\n❌ FAILED! Role is still not admin');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

fixChielAdminAccess();
