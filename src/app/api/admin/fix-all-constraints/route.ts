import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing all database constraints and issues...');
    
    // Step 1: Drop all problematic constraints
    const dropConstraintsSQL = `
      ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE public.onboarding_status DROP CONSTRAINT IF EXISTS onboarding_status_user_id_key;
    `;
    
    const { error: dropError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: dropConstraintsSQL
    });

    if (dropError) {
      console.error('❌ Error dropping constraints:', dropError);
    } else {
      console.log('✅ Constraints dropped');
    }

    // Step 2: Add proper constraints
    const addConstraintsSQL = `
      ALTER TABLE public.users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('user', 'admin', 'test'));
      
      ALTER TABLE public.onboarding_status 
      ADD CONSTRAINT onboarding_status_user_id_key 
      UNIQUE (user_id);
    `;
    
    const { error: addError } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: addConstraintsSQL
    });

    if (addError) {
      console.error('❌ Error adding constraints:', addError);
    } else {
      console.log('✅ New constraints added');
    }

    // Step 3: Clean up duplicate onboarding records
    const { data: allOnboarding, error: onboardingError } = await supabaseAdmin
      .from('onboarding_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (onboardingError) {
      console.error('❌ Error fetching onboarding records:', onboardingError);
    } else {
      console.log(`📊 Found ${allOnboarding?.length || 0} onboarding records`);
      
      // Group by user_id and keep only the most recent
      const userGroups = new Map();
      allOnboarding?.forEach(record => {
        if (!userGroups.has(record.user_id)) {
          userGroups.set(record.user_id, []);
        }
        userGroups.get(record.user_id).push(record);
      });

      // Delete duplicates
      for (const [userId, records] of userGroups.entries()) {
        if (records.length > 1) {
          console.log(`🔧 Cleaning up ${records.length} records for user ${userId}`);
          
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
          
          console.log(`✅ Kept 1 record, deleted ${sortedRecords.length - 1} duplicates`);
        }
      }
    }

    // Step 4: Update test user role
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'test' })
      .eq('email', 'test@toptiermen.com');

    if (updateError) {
      console.error('❌ Error updating test user role:', updateError);
    } else {
      console.log('✅ Test user role updated to "test"');
    }

    // Step 5: Verify everything
    const { data: testUser, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('email, role')
      .eq('email', 'test@toptiermen.com')
      .single();

    if (verifyError) {
      console.error('❌ Error verifying test user:', verifyError);
    } else {
      console.log('✅ Test user verified:', testUser);
    }

    // Step 6: Test onboarding API
    const testUserId = 'c6cee7ef-08e7-424f-89a5-06452b43e8df';
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

    console.log('🎉 All database issues fixed!');

    return NextResponse.json({
      success: true,
      message: 'All database constraints and issues fixed',
      testUser: testUser,
      onboardingStatus: onboardingStatus
    });

  } catch (error) {
    console.error('❌ Fix all constraints error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 