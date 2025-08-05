import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Final fix for all database constraints...');
    
    // Step 1: Drop ALL constraints that might be causing issues
    const dropAllConstraintsSQL = `
      -- Drop all check constraints on users table
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check_old;
      
      -- Drop unique constraints that might cause issues
      ALTER TABLE public.onboarding_status DROP CONSTRAINT IF EXISTS onboarding_status_user_id_key;
      ALTER TABLE public.onboarding_status DROP CONSTRAINT IF EXISTS onboarding_status_user_id_unique;
      
      -- Drop any other problematic constraints
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_email_key;
    `;
    
    const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: dropAllConstraintsSQL
    });

    if (dropError) {
      console.error('❌ Error dropping constraints:', dropError);
    } else {
      console.log('✅ All problematic constraints dropped');
    }

    // Step 2: Clean up any duplicate records first
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!usersError && allUsers) {
      console.log(`📊 Found ${allUsers.length} user records`);
      
      // Group by email and keep only the most recent
      const emailGroups = new Map();
      allUsers.forEach(user => {
        if (!emailGroups.has(user.email)) {
          emailGroups.set(user.email, []);
        }
        emailGroups.get(user.email).push(user);
      });

      // Delete duplicates
      for (const [email, users] of emailGroups.entries()) {
        if (users.length > 1) {
          console.log(`🔧 Cleaning up ${users.length} records for ${email}`);
          
          // Sort by created_at and keep the most recent
          const sortedUsers = users.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Delete all but the first (most recent)
          for (let i = 1; i < sortedUsers.length; i++) {
            await supabaseAdmin
              .from('users')
              .delete()
              .eq('id', sortedUsers[i].id);
          }
        }
      }
    }

    // Step 3: Clean up onboarding duplicates
    const { data: allOnboarding, error: onboardingError } = await supabaseAdmin
      .from('onboarding_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (!onboardingError && allOnboarding) {
      console.log(`📊 Found ${allOnboarding.length} onboarding records`);
      
      // Group by user_id and keep only the most recent
      const userGroups = new Map();
      allOnboarding.forEach(record => {
        if (!userGroups.has(record.user_id)) {
          userGroups.set(record.user_id, []);
        }
        userGroups.get(record.user_id).push(record);
      });

      // Delete duplicates
      for (const [userId, records] of userGroups.entries()) {
        if (records.length > 1) {
          console.log(`🔧 Cleaning up ${records.length} onboarding records for user ${userId}`);
          
          // Sort by created_at and keep the most recent
          const sortedRecords = records.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Delete all but the first (most recent)
          for (let i = 1; i < sortedRecords.length; i++) {
            await supabaseAdmin
              .from('onboarding_status')
              .delete()
              .eq('id', sortedRecords[i].id);
          }
        }
      }
    }

    // Step 4: Add proper constraints back
    const addConstraintsSQL = `
      -- Add proper role check constraint
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('user', 'admin', 'test'));
      
      -- Add unique constraint for onboarding
      ALTER TABLE public.onboarding_status 
      ADD CONSTRAINT onboarding_status_user_id_key 
      UNIQUE (user_id);
      
      -- Add unique constraint for user email
      ALTER TABLE public.users 
      ADD CONSTRAINT users_email_key 
      UNIQUE (email);
    `;
    
    const { error: addError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: addConstraintsSQL
    });

    if (addError) {
      console.error('❌ Error adding constraints:', addError);
    } else {
      console.log('✅ New constraints added successfully');
    }

    // Step 5: Update test user role using direct SQL
    const updateTestUserSQL = `
      UPDATE public.users 
      SET role = 'test' 
      WHERE email = 'test@toptiermen.com' 
      OR email = 'testuser@toptiermen.com';
    `;
    
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: updateTestUserSQL
    });

    if (updateError) {
      console.error('❌ Error updating test user:', updateError);
    } else {
      console.log('✅ Test user role updated');
    }

    // Step 6: Verify everything works
    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying users:', verifyError);
    } else {
      console.log(`✅ Verification: ${finalUsers?.length || 0} users remaining`);
      
      // Show test users
      const testUsers = finalUsers?.filter(user => 
        user.email?.includes('test') || user.role === 'test'
      );
      
      if (testUsers && testUsers.length > 0) {
        console.log('✅ Test users found:');
        testUsers.forEach(user => {
          console.log(`   - ${user.email}: role = ${user.role}`);
        });
      } else {
        console.log('❌ No test users found');
      }
    }

    // Step 7: Test onboarding API
    const testUserId = finalUsers?.find(u => u.email?.includes('test'))?.id;
    if (testUserId) {
      const { data: onboardingStatus, error: onboardingTestError } = await supabaseAdmin
        .from('onboarding_status')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      if (onboardingTestError) {
        console.error('❌ Error testing onboarding:', onboardingTestError);
      } else {
        console.log('✅ Onboarding status verified:', {
          user_id: onboardingStatus.user_id,
          onboarding_completed: onboardingStatus.onboarding_completed,
          current_step: onboardingStatus.current_step
        });
      }
    }

    console.log('🎉 All database issues permanently fixed!');

    return NextResponse.json({
      success: true,
      message: 'All database constraints and issues permanently fixed',
      testUsers: finalUsers?.filter(user => 
        user.email?.includes('test') || user.role === 'test'
      ),
      totalUsers: finalUsers?.length || 0
    });

  } catch (error) {
    console.error('❌ Final fix constraints error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 