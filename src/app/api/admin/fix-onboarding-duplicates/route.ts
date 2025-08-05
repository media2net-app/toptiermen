import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing duplicate onboarding records...');
    
    // First, let's see what we have
    const { data: allRecords, error: fetchError } = await supabaseAdmin
      .from('onboarding_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching onboarding records:', fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message
      }, { status: 400 });
    }

    console.log(`📊 Found ${allRecords?.length || 0} onboarding records`);

    // Group by user_id to find duplicates
    const userGroups = new Map();
    allRecords?.forEach(record => {
      if (!userGroups.has(record.user_id)) {
        userGroups.set(record.user_id, []);
      }
      userGroups.get(record.user_id).push(record);
    });

    // Find users with duplicates
    const usersWithDuplicates = Array.from(userGroups.entries())
      .filter(([userId, records]) => records.length > 1);

    console.log(`🔍 Found ${usersWithDuplicates.length} users with duplicate records`);

    // Fix duplicates by keeping the most recent record
    for (const [userId, records] of usersWithDuplicates) {
      console.log(`🔧 Fixing duplicates for user ${userId} (${records.length} records)`);
      
      // Sort by created_at descending and keep the first (most recent)
      const sortedRecords = records.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const keepRecord = sortedRecords[0];
      const deleteRecords = sortedRecords.slice(1);
      
      console.log(`   Keeping record ${keepRecord.id} (created: ${keepRecord.created_at})`);
      console.log(`   Deleting ${deleteRecords.length} duplicate records`);
      
      // Delete duplicate records
      for (const record of deleteRecords) {
        const { error: deleteError } = await supabaseAdmin
          .from('onboarding_status')
          .delete()
          .eq('id', record.id);
        
        if (deleteError) {
          console.error(`   ❌ Error deleting record ${record.id}:`, deleteError);
        } else {
          console.log(`   ✅ Deleted record ${record.id}`);
        }
      }
    }

    // Verify the fix
    const { data: finalRecords, error: verifyError } = await supabaseAdmin
      .from('onboarding_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
    } else {
      console.log(`✅ Verification: ${finalRecords?.length || 0} records remaining`);
      
      // Check for remaining duplicates
      const finalUserGroups = new Map();
      finalRecords?.forEach(record => {
        if (!finalUserGroups.has(record.user_id)) {
          finalUserGroups.set(record.user_id, []);
        }
        finalUserGroups.get(record.user_id).push(record);
      });

      const remainingDuplicates = Array.from(finalUserGroups.entries())
        .filter(([userId, records]) => records.length > 1);

      if (remainingDuplicates.length > 0) {
        console.log(`⚠️ Still have ${remainingDuplicates.length} users with duplicates`);
      } else {
        console.log('✅ No more duplicates found');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Duplicate onboarding records fixed',
      beforeCount: allRecords?.length || 0,
      afterCount: finalRecords?.length || 0,
      usersWithDuplicates: usersWithDuplicates.length
    });

  } catch (error) {
    console.error('❌ Fix onboarding duplicates error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 