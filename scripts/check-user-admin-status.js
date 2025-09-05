#!/usr/bin/env node

/**
 * Script om gebruiker admin status te controleren en eventueel te herstellen
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixAdminStatus() {
  console.log('🔍 Checking Admin Status...');
  console.log('===============================');

  try {
    // 1. Check all users and their roles
    console.log('\n📊 1. Checking All Users:');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.full_name || 'No name'}) - Role: ${user.role || 'No role'}`);
    });

    // 2. Check admin emails
    console.log('\n📊 2. Known Admin Emails:');
    const knownAdminEmails = ['chiel@media2net.nl', 'rick@toptiermen.eu', 'admin@toptiermen.com'];
    
    for (const adminEmail of knownAdminEmails) {
      const adminUser = users.find(u => u.email === adminEmail);
      if (adminUser) {
        console.log(`   ✅ ${adminEmail} - Found - Role: ${adminUser.role}`);
        
        // If not admin, fix it
        if (adminUser.role !== 'admin') {
          console.log(`   🔧 Fixing admin role for ${adminEmail}...`);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('email', adminEmail);
          
          if (updateError) {
            console.error(`   ❌ Failed to update ${adminEmail}:`, updateError);
          } else {
            console.log(`   ✅ Successfully updated ${adminEmail} to admin`);
          }
        }
      } else {
        console.log(`   ⚠️ ${adminEmail} - Not found in database`);
      }
    }

    // 3. Check auth.users table for additional verification
    console.log('\n📊 3. Checking Auth Users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users:`);
      
      for (const authUser of authUsers.users) {
        const profileUser = users.find(u => u.email === authUser.email);
        const isKnownAdmin = knownAdminEmails.includes(authUser.email);
        
        console.log(`   ${authUser.email}:`);
        console.log(`     - Auth ID: ${authUser.id}`);
        console.log(`     - Profile exists: ${profileUser ? 'Yes' : 'No'}`);
        console.log(`     - Profile role: ${profileUser?.role || 'N/A'}`);
        console.log(`     - Should be admin: ${isKnownAdmin ? 'Yes' : 'No'}`);
        console.log(`     - User metadata:`, authUser.user_metadata);
        
        // Update user metadata if needed
        if (isKnownAdmin && (!authUser.user_metadata?.role || authUser.user_metadata.role !== 'admin')) {
          console.log(`     🔧 Updating auth metadata for ${authUser.email}...`);
          
          const { error: metadataError } = await supabase.auth.admin.updateUserById(
            authUser.id,
            {
              user_metadata: {
                ...authUser.user_metadata,
                role: 'admin',
                is_admin: true
              }
            }
          );
          
          if (metadataError) {
            console.error(`     ❌ Failed to update metadata:`, metadataError);
          } else {
            console.log(`     ✅ Successfully updated auth metadata`);
          }
        }
      }
    }

    // 4. Test admin API access
    console.log('\n📊 4. Testing Admin API Access:');
    
    try {
      const testResponse = await fetch('http://localhost:3000/api/admin/test-database');
      const testData = await testResponse.json();
      
      if (testResponse.ok) {
        console.log('✅ Admin API is accessible');
        console.log('📊 Test response:', testData);
      } else {
        console.log('⚠️ Admin API responded with error:', testData);
      }
    } catch (apiError) {
      console.log('❌ Could not reach admin API (server might not be running)');
      console.log('💡 Make sure to run: npm run dev');
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }

  console.log('\n===============================');
  console.log('🏁 Admin Status Check Complete');
  console.log('\n💡 Next steps:');
  console.log('   1. If your email is in the known admin list, try refreshing the admin dashboard');
  console.log('   2. If still having issues, check the F12 console for detailed logs');
  console.log('   3. Make sure you\'re logged in with the correct admin email');
}

// Run the check
checkAndFixAdminStatus().catch(console.error);
