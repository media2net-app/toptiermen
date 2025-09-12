import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🗑️ Starting user deletion process for user:', userId);

    // Delete from all related tables in order (to respect foreign key constraints)
    const tablesToClean = [
      'user_achievements',
      'user_badges', 
      'user_challenges',
      'user_goals',
      'user_habits',
      'user_missions',
      'user_nutrition_plans',
      'user_training_sessions',
      'user_workouts',
      'forum_posts',
      'forum_replies',
      'user_points',
      'user_stats',
      'user_preferences',
      'user_notes',
      'user_activity_log',
      'prelaunch_packages', // Payment data
      'profiles', // Main profile data
      'users' // Legacy users table
    ];

    let deletedRecords = 0;
    let errors: string[] = [];

    // Delete from each table
    for (const table of tablesToClean) {
      try {
        // First check if there are records to delete
        const { data: existingData, error: checkError } = await supabaseAdmin
          .from(table)
          .select('*')
          .eq('id', userId);

        if (checkError) {
          console.log(`⚠️ Table ${table} doesn't exist or error checking:`, checkError.message);
          continue;
        }

        if (existingData && existingData.length > 0) {
          console.log(`🔍 Found ${existingData.length} records in ${table} for user ${userId}`);
          
          const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('id', userId);

          if (error) {
            console.error(`❌ Error deleting from ${table}:`, error);
            errors.push(`${table}: ${error.message}`);
          } else {
            // Verify the deletion actually worked
            const { data: verifyData, error: verifyError } = await supabaseAdmin
              .from(table)
              .select('*')
              .eq('id', userId);

            if (verifyError) {
              console.error(`❌ Error verifying deletion from ${table}:`, verifyError);
            } else {
              const remainingRecords = verifyData?.length || 0;
              if (remainingRecords === 0) {
                const deletedCount = existingData.length;
                deletedRecords += deletedCount;
                console.log(`✅ Successfully deleted ${deletedCount} records from ${table}`);
              } else {
                console.error(`❌ Deletion failed for ${table}: ${remainingRecords} records still exist`);
                errors.push(`${table}: Deletion failed - ${remainingRecords} records still exist`);
              }
            }
          }
        } else {
          console.log(`ℹ️ No records found in ${table} for user ${userId}`);
        }
      } catch (err) {
        console.error(`❌ Exception deleting from ${table}:`, err);
        errors.push(`${table}: ${err}`);
      }
    }

    // Try to delete from Supabase Auth (this might fail if user doesn't exist in auth)
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authError) {
        console.log('Auth user deletion failed (user might not exist in auth):', authError);
        // Don't add to errors as this is expected for some users
      } else {
        console.log('✅ Deleted user from Supabase Auth');
      }
    } catch (err) {
      console.log('Auth deletion exception:', err);
    }

    console.log(`🗑️ User deletion completed. Total records deleted: ${deletedRecords}`);

    if (errors.length > 0) {
      console.warn('Some deletions failed:', errors);
      return NextResponse.json({ 
        success: true, 
        message: 'User deleted with some warnings',
        deletedRecords,
        warnings: errors 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User successfully deleted',
      deletedRecords
    });

  } catch (error) {
    console.error('Error in delete-user API:', error);
    return NextResponse.json({ 
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
