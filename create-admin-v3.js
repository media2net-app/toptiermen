#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  console.log('👑 Creating ADMIN user for V3.0 testing...\n');

  try {
    const adminUser = {
      email: 'admin@toptiermen.com',
      password: 'AdminPassword123!',
      name: 'Top Tier Men Admin',
      role: 'admin'
    };
    
    console.log('👤 Admin User Details:');
    console.log('=====================');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Name: ${adminUser.name}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Password: ${adminUser.password}`);
    console.log('');

    // 1. Create auth user
    console.log('🔧 Step 1: Creating admin auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminUser.name,
        role: adminUser.role
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Admin user already exists, updating profile...');
        
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === adminUser.email);
        
        if (existingUser) {
          // Update profile to admin
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: existingUser.id,
              email: adminUser.email,
              full_name: adminUser.name,
              role: 'admin',
              updated_at: new Date().toISOString()
            });
          
          if (updateError) {
            console.log('❌ Error updating profile:', updateError.message);
          } else {
            console.log('✅ Admin profile updated successfully!');
          }
          
          console.log(`✅ Admin user ready: ${existingUser.id}`);
          return { user: existingUser, password: adminUser.password };
        }
      } else {
        console.error('❌ Error creating admin user:', authError.message);
        return;
      }
    } else {
      console.log('✅ Admin auth user created:', authData.user.id);
    }

    const userId = authData?.user?.id;

    // 2. Create/update profile
    console.log('📋 Step 2: Creating admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: adminUser.email,
        full_name: adminUser.name,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creating admin profile:', profileError.message);
    } else {
      console.log('✅ Admin profile created successfully!');
    }

    console.log('\n🎉 ADMIN USER READY!');
    console.log('====================');
    console.log('📧 Login Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    console.log('');
    console.log('🔗 Admin Login URL:');
    console.log('   http://localhost:3000/login');
    console.log('');
    console.log('📋 Expected Behavior:');
    console.log('   - Login should redirect to /dashboard-admin');
    console.log('   - Should have full admin access');
    console.log('   - Role: admin (for dashboard routing)');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createAdminUser().catch(console.error);
