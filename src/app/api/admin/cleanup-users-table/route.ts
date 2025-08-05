import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Cleaning up users table...');
    
    // Get all users
    const { data: allUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message
      }, { status: 400 });
    }

    console.log(`📊 Found ${allUsers?.length || 0} user records`);

    // Group by email to find duplicates
    const emailGroups = new Map();
    allUsers?.forEach(user => {
      if (!emailGroups.has(user.email)) {
        emailGroups.set(user.email, []);
      }
      emailGroups.get(user.email).push(user);
    });

    // Find emails with duplicates
    const emailsWithDuplicates = Array.from(emailGroups.entries())
      .filter(([email, users]) => users.length > 1);

    console.log(`🔍 Found ${emailsWithDuplicates.length} emails with duplicate records`);

    // Fix duplicates by keeping the most recent record
    for (const [email, users] of emailsWithDuplicates) {
      console.log(`🔧 Fixing duplicates for email ${email} (${users.length} records)`);
      
      // Sort by created_at descending and keep the first (most recent)
      const sortedUsers = users.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const keepUser = sortedUsers[0];
      const deleteUsers = sortedUsers.slice(1);
      
      console.log(`   Keeping user ${keepUser.id} (created: ${keepUser.created_at})`);
      console.log(`   Deleting ${deleteUsers.length} duplicate records`);
      
      // Delete duplicate records
      for (const user of deleteUsers) {
        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', user.id);
        
        if (deleteError) {
          console.error(`   ❌ Error deleting user ${user.id}:`, deleteError);
        } else {
          console.log(`   ✅ Deleted user ${user.id}`);
        }
      }
    }

    // Update test user role
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'test' })
      .eq('email', 'test@toptiermen.com');

    if (updateError) {
      console.error('❌ Error updating test user role:', updateError);
    } else {
      console.log('✅ Test user role updated to "test"');
    }

    // Verify the fix
    const { data: finalUsers, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
    } else {
      console.log(`✅ Verification: ${finalUsers?.length || 0} user records remaining`);
      
      // Check for remaining duplicates
      const finalEmailGroups = new Map();
      finalUsers?.forEach(user => {
        if (!finalEmailGroups.has(user.email)) {
          finalEmailGroups.set(user.email, []);
        }
        finalEmailGroups.get(user.email).push(user);
      });

      const remainingDuplicates = Array.from(finalEmailGroups.entries())
        .filter(([email, users]) => users.length > 1);

      if (remainingDuplicates.length > 0) {
        console.log(`⚠️ Still have ${remainingDuplicates.length} emails with duplicates`);
      } else {
        console.log('✅ No more duplicates found');
      }

      // Show test user status
      const testUser = finalUsers?.find(user => user.email === 'test@toptiermen.com');
      if (testUser) {
        console.log('✅ Test user found:', {
          id: testUser.id,
          email: testUser.email,
          role: testUser.role
        });
      } else {
        console.log('❌ Test user not found');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Users table cleaned up',
      beforeCount: allUsers?.length || 0,
      afterCount: finalUsers?.length || 0,
      emailsWithDuplicates: emailsWithDuplicates.length,
      testUser: finalUsers?.find(user => user.email === 'test@toptiermen.com')
    });

  } catch (error) {
    console.error('❌ Cleanup users table error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 